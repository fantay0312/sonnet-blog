import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { Feed } from "feed";
import config from "$config";

export const getStaticPaths: GetStaticPaths = () => {
  const locales = config.i18n.locales;
  const defaultLocale = config.i18n.defaultLocale;

  return locales.map((locale) => ({
    params: { locale: locale === defaultLocale ? undefined : locale },
    props: { locale },
  }));
};

export const GET: APIRoute = async ({ props, site }) => {
  const { locale } = props as { locale: string };

  const siteUrl = site?.toString() || "https://your-site.com";
  const basePath = locale === config.i18n.defaultLocale ? "" : `/${locale}`;

  // Create feed
  const feed = new Feed({
    title: config.title,
    description: config.description,
    id: siteUrl,
    link: siteUrl,
    language: locale,
    favicon: `${siteUrl}/favicon.svg`,
    copyright: `${config.copyright.year} ${config.author.name}`,
    author: {
      name: config.author.name,
      email: config.author.email,
      link: config.author.link,
    },
  });

  // Get notes and jottings
  const notes = await getCollection("note", (entry) => {
    const entryLocale = entry.id.split("/")[0];
    return entryLocale === locale && !entry.data.draft;
  });

  const jottings = await getCollection("jotting", (entry) => {
    const entryLocale = entry.id.split("/")[0];
    return entryLocale === locale && !entry.data.draft;
  });

  // Combine and sort by date
  const allContent = [...notes, ...jottings].sort(
    (a, b) => b.data.timestamp.getTime() - a.data.timestamp.getTime()
  );

  // Limit to configured amount
  const limitedContent = allContent.slice(0, config.feed.limit);

  // Add items to feed
  for (const item of limitedContent) {
    const collection = item.collection;
    const id = item.id.split("/").slice(1).join("/").replace(/\.mdx?$/, "");
    const url = `${siteUrl}${basePath}/${collection}/${id}`;

    feed.addItem({
      title: item.data.title,
      id: url,
      link: url,
      description: item.data.description || "",
      date: item.data.timestamp,
      category: item.data.tags?.map((tag) => ({ name: tag })) || [],
    });
  }

  return new Response(feed.atom1(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
