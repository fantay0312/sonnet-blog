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
  title: "Fantay's blog",
  prologue: "北海虽赊，扶摇可接；东隅已逝，桑榆非晚。\n取次花丛懒回顾，半缘修道半缘君。",
  author: {
    name: "Fantasy",
    email: "fantay0312@gmail.com",
    link: "https://blog.fantay.cc",
  },
  description: "诗意栖居，代码织梦",
  copyright: {
    type: "CC BY-NC-ND 4.0",
    year: "2026",
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
          { name: "Python", icon: "icon-[mdi--language-python]" },
          { name: "C++", icon: "icon-[mdi--language-cpp]" },
          { name: "JavaScript", icon: "icon-[mdi--language-javascript]" },
          { name: "Deep Learning", icon: "icon-[mdi--brain]" },
        ],
      },
      {
        direction: "right",
        skills: [
          { name: "Computer Vision", icon: "icon-[mdi--eye-outline]" },
          { name: "AI Agent", icon: "icon-[mdi--robot-outline]" },
          { name: "Security", icon: "icon-[mdi--shield-lock-outline]" },
          { name: "Cloud Infra", icon: "icon-[mdi--cloud-outline]" },
        ],
      },
    ],
  },
};

export const monolocale = config.i18n.locales.length === 1;

export default config;
