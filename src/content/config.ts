import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

/**
 * 文记（Note）- 长篇文章
 */
const note = defineCollection({
  loader: glob({
    pattern: ["**/*.md", "**/*.mdx", "!**/_*.md"],
    base: "./src/content/note",
  }),
  schema: z.object({
    title: z.string(),
    timestamp: z.coerce.date(),
    series: z.string().optional(),
    tags: z.array(z.string()).optional(),
    description: z.string().optional(),
    mood: z.string().optional(),
    sensitive: z.boolean().default(false),
    toc: z.boolean().default(true),
    top: z.number().int().nonnegative().default(0),
    draft: z.boolean().default(false),
  }),
});

/**
 * 随笔（Jotting）- 短篇内容
 */
const jotting = defineCollection({
  loader: glob({
    pattern: ["**/*.md", "**/*.mdx", "!**/_*.md"],
    base: "./src/content/jotting",
  }),
  schema: z.object({
    title: z.string(),
    timestamp: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    description: z.string().optional(),
    sensitive: z.boolean().default(false),
    top: z.number().int().nonnegative().default(0),
    draft: z.boolean().default(false),
  }),
});

/**
 * 序章（Preface）- 首页展示内容
 */
const preface = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/preface",
  }),
  schema: z.object({
    timestamp: z.coerce.date(),
  }),
});

/**
 * 絮述（Information）- 关于页面等
 */
const information = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx,yaml}",
    base: "./src/content/information",
  }),
});

/**
 * 项目（Projects）
 */
const projects = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx,yaml}",
    base: "./src/content/projects",
  }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    githubUrl: z.string().optional(),
    website: z.string().optional(),
    icon: z.string().optional(),
    star: z.number().optional(),
    fork: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  note,
  jotting,
  preface,
  information,
  projects,
};
