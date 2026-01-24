// Import translation files for different locales
import zhCN from "./zh-cn/index.yaml";
import zhCNScript from "./zh-cn/script.yaml";
import en from "./en/index.yaml";
import enScript from "./en/script.yaml";

// Translation object mapping locale codes to their respective translation data
const translations = {
  "zh-cn": {
    index: zhCN,
    script: zhCNScript,
  },
  en: {
    index: en,
    script: enScript,
  },
};

// Define Language type based on available translations
type Language = keyof typeof translations;

// Define Namespace type based on keys in the translation objects
type TranslationNamespace = keyof (typeof translations)[Language];

/**
 * Validate if the provided language is supported
 */
function validateLanguage(language: string): asserts language is Language {
  if (!(language in translations)) {
    throw new Error(
      `Unsupported language: ${language}. Available: ${Object.keys(translations).join(", ")}`
    );
  }
}

/**
 * Create an internationalization function for a specific language
 */
export default function i18nit(
  language: string,
  namespace?: TranslationNamespace
): (key: string, params?: Record<string, string | number>) => string {
  validateLanguage(language);

  const dictionary = translations[language][namespace ?? "index"];
  const rules = new Intl.PluralRules(language);

  function t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split(".");
    let value: any = dictionary;

    for (const k of keys) {
      if (value === undefined || value === null) break;
      value = value[k];
    }

    // Handle pluralization
    if (
      value &&
      typeof value === "object" &&
      params?.count !== undefined &&
      typeof params.count === "number"
    ) {
      const rule = rules.select(params.count);
      const plural = value[rule] || value.other;
      if (typeof plural === "string") value = plural;
    }

    if (value === undefined || typeof value !== "string") return key;

    // Parameter interpolation
    if (params) {
      return value.replace(
        /\{(\w+)\}/g,
        (_, param) => String(params[param] ?? `{${param}}`)
      );
    }

    return value;
  }

  return t;
}

export type { Language, TranslationNamespace };
