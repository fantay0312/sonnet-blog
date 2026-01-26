import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import yaml from "@rollup/plugin-yaml";

import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkMark from "./src/lib/remark-mark";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import type { ShikiTransformer } from "shiki";

// Shiki transformer: 添加语言标签到代码块
const addLanguageLabel: ShikiTransformer = {
  name: "add-language-label",
  pre(node) {
    const lang = this.options.lang || "text";
    node.properties["data-language"] = lang;
  },
};

export default defineConfig({
  site: "https://your-site.com",
  adapter: node({ mode: "standalone" }),

  devToolbar: {
    enabled: false,
  },

  i18n: {
    locales: ["zh-cn", "en"],
    defaultLocale: "zh-cn",
    routing: {
      redirectToDefaultLocale: false,
      prefixDefaultLocale: false,
    },
  },

  integrations: [react(), mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss(), yaml()],
    resolve: {
      alias: {
        "~": "/src",
        $config: "/site.config.ts",
        $i18n: "/src/i18n",
        $components: "/src/components",
        $layouts: "/src/layouts",
        $styles: "/src/styles",
        $lib: "/src/lib",
      },
    },
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      transformers: [addLanguageLabel],
    },
    remarkPlugins: [remarkGfm, remarkMath, remarkMark],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: { class: "heading-link" },
        },
      ],
      [
        rehypeExternalLinks,
        {
          target: "_blank",
          rel: ["noopener", "noreferrer"],
        },
      ],
      rehypeKatex,
    ],
  },
});
