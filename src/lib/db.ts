/**
 * 数据持久化层
 * 使用 JSON 文件存储数据
 */

import { readFile, writeFile, mkdir, rename } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

// 数据目录路径
const DATA_DIR = join(process.cwd(), "data");

// 确保数据目录存在
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

// 通用 JSON 读写
async function readJson<T>(filename: string, defaultValue: T): Promise<T> {
  await ensureDataDir();
  const filepath = join(DATA_DIR, filename);
  try {
    const content = await readFile(filepath, "utf-8");
    return JSON.parse(content);
  } catch {
    return defaultValue;
  }
}

// 原子写入：先写临时文件再 rename 覆盖，避免进程崩溃留下半截 JSON
async function writeJson<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filepath = join(DATA_DIR, filename);
  const tmp = `${filepath}.tmp-${randomBytes(6).toString("hex")}`;
  await writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await rename(tmp, filepath);
}

// 按文件名串行化「读-改-写」：多个并发请求同时改同一个 JSON 会丢更新/互相覆盖，
// 这里把每个文件的读改写排成一条 Promise 链，逐个执行
const writeChains = new Map<string, Promise<unknown>>();

async function updateJson<T, R>(
  filename: string,
  defaultValue: T,
  mutator: (data: T) => { data: T; result: R } | Promise<{ data: T; result: R }>
): Promise<R> {
  const prev = writeChains.get(filename) ?? Promise.resolve();
  const run = prev.catch(() => {}).then(async () => {
    const current = await readJson<T>(filename, defaultValue);
    const { data, result } = await mutator(current);
    await writeJson(filename, data);
    return result;
  });
  writeChains.set(filename, run);
  try {
    return await run;
  } finally {
    if (writeChains.get(filename) === run) writeChains.delete(filename);
  }
}

// ============ API Keys ============

export interface ApiKey {
  id: string;
  name: string;
  keyHash: string;
  keyPrefix: string; // 显示用，如 "sonnet_sk_abc..."
  permissions: string[];
  createdAt: string;
  lastUsedAt?: string;
}

interface ApiKeysData {
  keys: ApiKey[];
}

const API_KEYS_FILE = "api-keys.json";

export async function getApiKeys(): Promise<ApiKey[]> {
  const data = await readJson<ApiKeysData>(API_KEYS_FILE, { keys: [] });
  return data.keys;
}

export async function createApiKey(name: string, permissions: string[]): Promise<{ key: string; keyData: ApiKey }> {
  const rawKey = `sonnet_sk_${randomBytes(24).toString("hex")}`;
  const keyHash = hashKey(rawKey);
  const keyPrefix = `${rawKey.slice(0, 15)}...`;

  const keyData: ApiKey = {
    id: randomBytes(8).toString("hex"),
    name,
    keyHash,
    keyPrefix,
    permissions,
    createdAt: new Date().toISOString(),
  };

  await updateJson<ApiKeysData, void>(API_KEYS_FILE, { keys: [] }, (data) => {
    data.keys.push(keyData);
    return { data, result: undefined };
  });

  return { key: rawKey, keyData };
}

export async function verifyApiKey(key: string): Promise<ApiKey | null> {
  const keyHash = hashKey(key);
  const data = await readJson<ApiKeysData>(API_KEYS_FILE, { keys: [] });
  const found = data.keys.find((k) => constantTimeEqualHex(k.keyHash, keyHash));
  if (!found) return null;

  // lastUsedAt 节流：超过 5 分钟才落盘，避免每次鉴权都全量重写 key 文件
  const last = found.lastUsedAt ? Date.parse(found.lastUsedAt) : 0;
  if (Date.now() - last > 5 * 60 * 1000) {
    await updateJson<ApiKeysData, void>(API_KEYS_FILE, { keys: [] }, (d) => {
      const k = d.keys.find((x) => x.id === found.id);
      if (k) k.lastUsedAt = new Date().toISOString();
      return { data: d, result: undefined };
    }).catch(() => {});
  }

  return found;
}

export async function deleteApiKey(id: string): Promise<boolean> {
  return updateJson<ApiKeysData, boolean>(API_KEYS_FILE, { keys: [] }, (data) => {
    const index = data.keys.findIndex((k) => k.id === id);
    if (index === -1) return { data, result: false };
    data.keys.splice(index, 1);
    return { data, result: true };
  });
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

// 等长十六进制字符串的恒定时间比较，避免对存储哈希做计时侧信道
function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

// ============ Admin ============

export interface Admin {
  username: string;
  passwordHash: string;
  createdAt: string;
}

interface AdminData {
  admin: Admin | null;
}

const ADMIN_FILE = "admin.json";

// 环境变量中的管理员凭据
const ENV_ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ENV_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function getAdmin(): Promise<Admin | null> {
  // 优先使用环境变量（密码留在内存，不在此处生成可比对的哈希）
  if (ENV_ADMIN_USERNAME && ENV_ADMIN_PASSWORD) {
    return {
      username: ENV_ADMIN_USERNAME,
      passwordHash: "env",
      createdAt: "env",
    };
  }

  const data = await readJson<AdminData>(ADMIN_FILE, { admin: null });
  return data.admin;
}

export async function createAdmin(username: string, password: string): Promise<Admin> {
  // 如果环境变量已配置，不允许创建新管理员
  if (ENV_ADMIN_USERNAME && ENV_ADMIN_PASSWORD) {
    throw new Error("Admin credentials are configured via environment variables");
  }

  const admin: Admin = {
    username,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  await writeJson(ADMIN_FILE, { admin });
  return admin;
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  // 环境变量管理员：直接与明文环境值做恒定时间比对（密码本就是明文配置项）
  if (ENV_ADMIN_USERNAME && ENV_ADMIN_PASSWORD) {
    const userOk = constantTimeEqualStr(username, ENV_ADMIN_USERNAME);
    const passOk = constantTimeEqualStr(password, ENV_ADMIN_PASSWORD);
    return userOk && passOk;
  }

  const data = await readJson<AdminData>(ADMIN_FILE, { admin: null });
  const admin = data.admin;
  if (!admin) return false;
  if (!constantTimeEqualStr(admin.username, username)) return false;
  return verifyPassword(password, admin.passwordHash);
}

// 检查是否通过环境变量配置
export function isAdminFromEnv(): boolean {
  return !!(ENV_ADMIN_USERNAME && ENV_ADMIN_PASSWORD);
}

// scrypt + 每条记录随机盐，存储格式 scrypt$<saltHex>$<hashHex>
function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 32);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  // 兼容历史上用 sha256+静态盐 存的旧哈希（仅文件存储模式可能存在）
  if (scheme !== "scrypt" || !saltHex || !hashHex) {
    const legacy = createHash("sha256").update(password + "sonnet_salt_2024").digest("hex");
    return constantTimeEqualStr(legacy, stored);
  }
  const hash = scryptSync(password, Buffer.from(saltHex, "hex"), 32);
  try {
    return timingSafeEqual(hash, Buffer.from(hashHex, "hex"));
  } catch {
    return false;
  }
}

// 任意长度字符串的恒定时间比较（先 sha256 归一到等长，避免泄漏长度）
function constantTimeEqualStr(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

// ============ Skills ============

export interface SkillItem {
  id: string;
  name: string;
  icon: string;
  url?: string;
}

export interface SkillRow {
  id: string;
  direction: "left" | "right";
  skills: SkillItem[];
}

interface SkillsData {
  rows: SkillRow[];
}

const SKILLS_FILE = "skills.json";

export async function getSkills(): Promise<SkillRow[]> {
  const data = await readJson<SkillsData>(SKILLS_FILE, { rows: [] });
  return data.rows;
}

export async function saveSkills(rows: SkillRow[]): Promise<void> {
  await writeJson(SKILLS_FILE, { rows });
}

export async function addSkillRow(direction: "left" | "right"): Promise<SkillRow> {
  const data = await readJson<SkillsData>(SKILLS_FILE, { rows: [] });
  const newRow: SkillRow = {
    id: randomBytes(8).toString("hex"),
    direction,
    skills: [],
  };
  data.rows.push(newRow);
  await writeJson(SKILLS_FILE, data);
  return newRow;
}

export async function addSkillToRow(rowId: string, skill: Omit<SkillItem, "id">): Promise<SkillItem | null> {
  const data = await readJson<SkillsData>(SKILLS_FILE, { rows: [] });
  const row = data.rows.find((r) => r.id === rowId);
  if (!row) return null;

  const newSkill: SkillItem = {
    id: randomBytes(8).toString("hex"),
    ...skill,
  };
  row.skills.push(newSkill);
  await writeJson(SKILLS_FILE, data);
  return newSkill;
}

export async function updateSkill(rowId: string, skillId: string, updates: Partial<SkillItem>): Promise<boolean> {
  const data = await readJson<SkillsData>(SKILLS_FILE, { rows: [] });
  const row = data.rows.find((r) => r.id === rowId);
  if (!row) return false;

  const skill = row.skills.find((s) => s.id === skillId);
  if (!skill) return false;

  Object.assign(skill, updates);
  await writeJson(SKILLS_FILE, data);
  return true;
}

export async function deleteSkill(rowId: string, skillId: string): Promise<boolean> {
  const data = await readJson<SkillsData>(SKILLS_FILE, { rows: [] });
  const row = data.rows.find((r) => r.id === rowId);
  if (!row) return false;

  const index = row.skills.findIndex((s) => s.id === skillId);
  if (index === -1) return false;

  row.skills.splice(index, 1);
  await writeJson(SKILLS_FILE, data);
  return true;
}

export async function deleteSkillRow(rowId: string): Promise<boolean> {
  const data = await readJson<SkillsData>(SKILLS_FILE, { rows: [] });
  const index = data.rows.findIndex((r) => r.id === rowId);
  if (index === -1) return false;

  data.rows.splice(index, 1);
  await writeJson(SKILLS_FILE, data);
  return true;
}

// ============ Projects ============

export interface Project {
  id: string;
  name: string;
  description: string;
  githubUrl?: string;
  website?: string;
  icon: string;
  star: number;
  fork: number;
  draft: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectsData {
  projects: Project[];
}

const PROJECTS_FILE = "projects.json";

export async function getProjects(): Promise<Project[]> {
  const data = await readJson<ProjectsData>(PROJECTS_FILE, { projects: [] });
  return data.projects;
}

export async function createProject(
  project: Omit<Project, "id" | "createdAt" | "updatedAt">
): Promise<Project> {
  const data = await readJson<ProjectsData>(PROJECTS_FILE, { projects: [] });
  const now = new Date().toISOString();

  const newProject: Project = {
    id: randomBytes(8).toString("hex"),
    ...project,
    createdAt: now,
    updatedAt: now,
  };

  data.projects.push(newProject);
  await writeJson(PROJECTS_FILE, data);
  return newProject;
}

export async function updateProject(
  id: string,
  updates: Partial<Omit<Project, "id" | "createdAt">>
): Promise<Project | null> {
  const data = await readJson<ProjectsData>(PROJECTS_FILE, { projects: [] });
  const index = data.projects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  data.projects[index] = {
    ...data.projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await writeJson(PROJECTS_FILE, data);
  return data.projects[index];
}

export async function deleteProject(id: string): Promise<boolean> {
  const data = await readJson<ProjectsData>(PROJECTS_FILE, { projects: [] });
  const index = data.projects.findIndex((p) => p.id === id);
  if (index === -1) return false;

  data.projects.splice(index, 1);
  await writeJson(PROJECTS_FILE, data);
  return true;
}

export async function getProjectById(id: string): Promise<Project | null> {
  const data = await readJson<ProjectsData>(PROJECTS_FILE, { projects: [] });
  return data.projects.find((p) => p.id === id) || null;
}

// ============ JWT ============

const DEFAULT_JWT_SECRET = "sonnet_jwt_secret_change_in_production";
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

// 生产环境若未设置（或仍是默认）JWT_SECRET，则密钥是公开可知的，
// 任何人都能伪造管理员令牌。此时失败关闭：拒绝签发与校验一切令牌。
const JWT_SECRET_INSECURE =
  import.meta.env.PROD && (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_JWT_SECRET);

if (JWT_SECRET_INSECURE) {
  console.error(
    "[SECURITY] JWT_SECRET is unset or default in production — admin auth is disabled. Set a strong JWT_SECRET in .env."
  );
}

function signJWT(headerB64: string, payloadB64: string): string {
  return createHmac("sha256", JWT_SECRET).update(`${headerB64}.${payloadB64}`).digest("base64url");
}

export function createJWT(payload: object, expiresIn: number = 7 * 24 * 60 * 60): string {
  if (JWT_SECRET_INSECURE) {
    throw new Error("JWT_SECRET must be set to a strong value in production");
  }
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresIn };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  return `${headerB64}.${payloadB64}.${signJWT(headerB64, payloadB64)}`;
}

export function verifyJWT(token: string): object | null {
  if (JWT_SECRET_INSECURE) return null; // 失败关闭
  try {
    const [headerB64, payloadB64, signature] = token.split(".");
    if (!headerB64 || !payloadB64 || !signature) return null;

    const expectedSig = signJWT(headerB64, payloadB64);
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

// ============ 访问统计 ============

interface StatsData {
  total: number;
  days: Record<string, number>;
}

const STATS_FILE = "stats.json";

// 以中国时区计算"今天"
function todayKey(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai" }).format(new Date());
}

export async function recordVisit(): Promise<{ total: number; today: number }> {
  const key = todayKey();
  return updateJson<StatsData, { total: number; today: number }>(
    STATS_FILE,
    { total: 0, days: {} },
    (data) => {
      data.total += 1;
      data.days[key] = (data.days[key] || 0) + 1;

      // 仅保留最近 400 天的按日数据
      const keys = Object.keys(data.days).sort();
      while (keys.length > 400) {
        delete data.days[keys.shift()!];
      }

      return { data, result: { total: data.total, today: data.days[key] } };
    }
  );
}

export async function getVisitStats(): Promise<{ total: number; today: number }> {
  const data = await readJson<StatsData>(STATS_FILE, { total: 0, days: {} });
  return { total: data.total, today: data.days[todayKey()] || 0 };
}
