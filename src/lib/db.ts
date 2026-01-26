/**
 * 数据持久化层
 * 使用 JSON 文件存储数据
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { createHash, randomBytes } from "crypto";

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

async function writeJson<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filepath = join(DATA_DIR, filename);
  await writeFile(filepath, JSON.stringify(data, null, 2), "utf-8");
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

  const data = await readJson<ApiKeysData>(API_KEYS_FILE, { keys: [] });
  data.keys.push(keyData);
  await writeJson(API_KEYS_FILE, data);

  return { key: rawKey, keyData };
}

export async function verifyApiKey(key: string): Promise<ApiKey | null> {
  const keyHash = hashKey(key);
  const data = await readJson<ApiKeysData>(API_KEYS_FILE, { keys: [] });
  const found = data.keys.find((k) => k.keyHash === keyHash);

  if (found) {
    // 更新最后使用时间
    found.lastUsedAt = new Date().toISOString();
    await writeJson(API_KEYS_FILE, data);
  }

  return found || null;
}

export async function deleteApiKey(id: string): Promise<boolean> {
  const data = await readJson<ApiKeysData>(API_KEYS_FILE, { keys: [] });
  const index = data.keys.findIndex((k) => k.id === id);
  if (index === -1) return false;

  data.keys.splice(index, 1);
  await writeJson(API_KEYS_FILE, data);
  return true;
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
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
  // 优先使用环境变量
  if (ENV_ADMIN_USERNAME && ENV_ADMIN_PASSWORD) {
    return {
      username: ENV_ADMIN_USERNAME,
      passwordHash: hashPassword(ENV_ADMIN_PASSWORD),
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

  const passwordHash = hashPassword(password);
  const admin: Admin = {
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  await writeJson(ADMIN_FILE, { admin });
  return admin;
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const admin = await getAdmin();
  if (!admin) return false;
  if (admin.username !== username) return false;
  return admin.passwordHash === hashPassword(password);
}

// 检查是否通过环境变量配置
export function isAdminFromEnv(): boolean {
  return !!(ENV_ADMIN_USERNAME && ENV_ADMIN_PASSWORD);
}

function hashPassword(password: string): string {
  // 简单哈希，生产环境应使用 bcrypt
  return createHash("sha256").update(password + "sonnet_salt_2024").digest("hex");
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

const JWT_SECRET = process.env.JWT_SECRET || "sonnet_jwt_secret_change_in_production";

export function createJWT(payload: object, expiresIn: number = 7 * 24 * 60 * 60): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresIn };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = createHash("sha256")
    .update(`${headerB64}.${payloadB64}.${JWT_SECRET}`)
    .digest("base64url");

  return `${headerB64}.${payloadB64}.${signature}`;
}

export function verifyJWT(token: string): object | null {
  try {
    const [headerB64, payloadB64, signature] = token.split(".");
    const expectedSig = createHash("sha256")
      .update(`${headerB64}.${payloadB64}.${JWT_SECRET}`)
      .digest("base64url");

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}
