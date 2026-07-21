import { db } from "@/db";
import { offers, articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cities } from "@/lib/cities";
import { glossaryTerms } from "@/lib/glossary";
import { loanTypes } from "@/lib/loanTypes";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kosmozaim.ru";

  // Статические страницы
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/zajmy`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kredity`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/karty/kreditnye`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/karty/debetovye`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/glossary`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/favorites`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  // Страницы глоссария
  const glossaryPages: MetadataRoute.Sitemap = glossaryTerms.map((term) => ({
    url: `${baseUrl}/glossary/${term.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Страницы типов займов
  const loanTypePages: MetadataRoute.Sitemap = loanTypes.map((type) => ({
    url: `${baseUrl}/zajmy/type/${type.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Городские страницы (высокий приоритет для SEO)
  const cityPages: MetadataRoute.Sitemap = [];

  for (const city of cities) {
    // Приоритет на основе населения
    const priority = city.population > 1000000 ? 0.8 : city.population > 500000 ? 0.7 : 0.6;

    // Займы в городе
    cityPages.push({
      url: `${baseUrl}/zajmy/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority,
    });

    // Кредиты в городе
    cityPages.push({
      url: `${baseUrl}/kredity/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority,
    });

    // Карты в городе
    cityPages.push({
      url: `${baseUrl}/karty/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority,
    });
  }

  // Динамические страницы статей
  const publishedArticles = await db
    .select({ slug: articles.slug, updatedAt: articles.updatedAt })
    .from(articles)
    .where(eq(articles.isPublished, true));

  const articlePages: MetadataRoute.Sitemap = publishedArticles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Динамические страницы предложений
  const activeOffers = await db
    .select({ slug: offers.slug, updatedAt: offers.updatedAt })
    .from(offers)
    .where(eq(offers.isActive, true));

  const offerPages: MetadataRoute.Sitemap = activeOffers.map((offer) => ({
    url: `${baseUrl}/offer/${offer.slug}`,
    lastModified: offer.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...glossaryPages, ...loanTypePages, ...cityPages, ...articlePages, ...offerPages];
}
