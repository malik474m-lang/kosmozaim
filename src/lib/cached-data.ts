import { db } from "@/db";
import { articles, offers, reviews } from "@/db/schema";
import { and, asc, avg, desc, eq, ne } from "drizzle-orm";

export async function getHomeData() {
  const [topOffers, latestArticles] = await Promise.all([
    db.select().from(offers).where(eq(offers.isActive, true)).orderBy(asc(offers.sortOrder)).limit(6),
    db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.createdAt)).limit(3),
  ]);
  return { topOffers, latestArticles };
}

export async function getPublishedArticles() {
  return db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.createdAt));
}

export async function getPublishedArticleBySlug(slug: string) {
  const result = await db.select().from(articles).where(and(eq(articles.slug, slug), eq(articles.isPublished, true))).limit(1);
  return result[0] ?? null;
}

export async function getOfferBySlug(slug: string) {
  const result = await db.select().from(offers).where(and(eq(offers.slug, slug), eq(offers.isActive, true))).limit(1);
  return result[0] ?? null;
}

export async function getOfferSeoBySlug(slug: string) {
  const result = await db.select().from(offers).where(eq(offers.slug, slug)).limit(1);
  return result[0] ?? null;
}

export async function getApprovedOfferRating(offerId: number) {
  const result = await db.select({ avg: avg(reviews.rating) }).from(reviews).where(and(eq(reviews.offerId, offerId), eq(reviews.isApproved, true)));
  return result[0]?.avg ? parseFloat(String(result[0].avg)) : null;
}

export async function getSimilarOffers(category: "microloans" | "credits" | "credit_cards" | "debit_cards", offerId: number) {
  return db.select().from(offers).where(and(eq(offers.isActive, true), eq(offers.category, category), ne(offers.id, offerId))).orderBy(asc(offers.sortOrder)).limit(4);
}
