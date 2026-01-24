export interface SiteConfig {
  title: string;
  prologue: string;
  author: {
    name: string;
    email?: string;
    link?: string;
  };
  description: string;
  copyright: {
    type: string;
    year: string;
  };
  i18n: {
    locales: string[];
    defaultLocale: string;
  };
  pagination: {
    note: number;
    jotting: number;
  };
  feed: {
    section: "*" | ("note" | "jotting")[];
    limit: number;
  };
  latest: "*" | ("note" | "jotting")[];
  github: {
    enabled: boolean;
    username: string;
    tooltipEnabled: boolean;
  };
  skills: {
    enabled: boolean;
    data: SkillGroup[];
  };
}

export interface SkillGroup {
  direction: "left" | "right";
  skills: Skill[];
}

export interface Skill {
  name: string;
  icon: string;
  url?: string;
}

const config: SiteConfig = {
  title: "Sonnet",
  prologue: "北海虽赊，扶摇可接；东隅已逝，桑榆非晚。\n取次花丛懒回顾，半缘修道半缘君。",
  author: {
    name: "Fantasy",
    email: "hi@your.mail",
    link: "https://your.website",
  },
  description: "诗意栖居，代码织梦",
  copyright: {
    type: "CC BY-NC-ND 4.0",
    year: "2025",
  },
  i18n: {
    locales: ["zh-cn", "en"],
    defaultLocale: "zh-cn",
  },
  pagination: {
    note: 15,
    jotting: 24,
  },
  feed: {
    section: "*",
    limit: 20,
  },
  latest: "*",
  github: {
    enabled: true,
    username: "py66666654",
    tooltipEnabled: true,
  },
  skills: {
    enabled: true,
    data: [
      {
        direction: "left",
        skills: [
          { name: "JavaScript", icon: "icon-[mdi--language-javascript]" },
          { name: "TypeScript", icon: "icon-[mdi--language-typescript]" },
          { name: "React", icon: "icon-[mdi--react]" },
          { name: "Astro", icon: "icon-[lineicons--astro]" },
        ],
      },
      {
        direction: "right",
        skills: [
          { name: "Node.js", icon: "icon-[mdi--nodejs]" },
          { name: "Tailwind CSS", icon: "icon-[mdi--tailwind]" },
          { name: "Git", icon: "icon-[mdi--git]" },
        ],
      },
    ],
  },
};

export const monolocale = config.i18n.locales.length === 1;

export default config;
