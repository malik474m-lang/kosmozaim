import { unstable_cache } from "next/cache";
import { db } from "@/db";
import { articles, offers, reviews } from "@/db/schema";
import { and, asc, avg, desc, eq, ne } from "drizzle-orm";

const getHomeDataCached = unstable_cache(
  async () => {
    const [topOffers, latestArticles] = await Promise.all([
      db.select().from(offers).where(eq(offers.isActive, true)).orderBy(asc(offers.sortOrder)).limit(6),
      db
        .select()
        .from(articles)
        .where(eq(articles.isPublished, true))
        .orderBy(desc(articles.createdAt))
        .limit(3),
    ]);

    return { topOffers, latestArticles };
  },
  ["home-data"],
  { revalidate: 300 }
);

const getPublishedArticlesCached = unstable_cache(
  async () => {
    return db
      .select()
      .from(articles)
      .where(eq(articles.isPublished, true))
      .orderBy(desc(articles.createdAt));
  },
  ["published-articles"],
  { revalidate: 600 }
);

const getPublishedArticleBySlugCached = unstable_cache(
  async (slug: string) => {
    const result = await db
      .select()
      .from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.isPublished, true)))
      .limit(1);

    return result[0] ?? null;
  },
  ["published-article-by-slug"],
  { revalidate: 600 }
);

const getOfferBySlugCached = unstable_cache(
  async (slug: string) => {
    const result = await db
      .select()
      .from(offers)
      .where(and(eq(offers.slug, slug), eq(offers.isActive, true)))
      .limit(1);

    return result[0] ?? null;
  },
  ["offer-by-slug"],
  { revalidate: 300 }
);

const getOfferSeoBySlugCached = unstable_cache(
  async (slug: string) => {
    const result = await db.select().from(offers).where(eq(offers.slug, slug)).limit(1);
    return result[0] ?? null;
  },
  ["offer-seo-by-slug"],
  { revalidate: 300 }
);

const getApprovedOfferRatingCached = unstable_cache(
  async (offerId: number) => {
    const result = await db
      .select({ avg: avg(reviews.rating) })
      .from(reviews)
      .where(and(eq(reviews.offerId, offerId), eq(reviews.isApproved, true)));

    return result[0]?.avg ? parseFloat(String(result[0].avg)) : null;
  },
  ["approved-offer-rating"],
  { revalidate: 300 }
);

const getSimilarOffersCached = unstable_cache(
  async (category: "microloans" | "credits" | "credit_cards" | "debit_cards", offerId: number) => {
    return db
      .select()
      .from(offers)
      .where(and(eq(offers.isActive, true), eq(offers.category, category), ne(offers.id, offerId)))
      .orderBy(asc(offers.sortOrder))
      .limit(4);
  },
  ["similar-offers"],
  { revalidate: 300 }
);

export async function getHomeData() {
  return getHomeDataCached();
}

export async function getPublishedArticles() {
  return getPublishedArticlesCached();
}

export async function getPublishedArticleBySlug(slug: string) {
  return getPublishedArticleBySlugCached(slug);
}

export async function getOfferBySlug(slug: string) {
  return getOfferBySlugCached(slug);
}

export async function getOfferSeoBySlug(slug: string) {
  return getOfferSeoBySlugCached(slug);
}

export async function getApprovedOfferRating(offerId: number) {
  return getApprovedOfferRatingCached(offerId);
}

export async function getSimilarOffers(
  category: "microloans" | "credits" | "credit_cards" | "debit_cards",
  offerId: number
) {
  return getSimilarOffersCached(category, offerId);
}
