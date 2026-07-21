import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const offerCategoryEnum = pgEnum("offer_category", [
  "microloans",
  "credits",
  "credit_cards",
  "debit_cards",
]);

export const borrowerCategoryEnum = pgEnum("borrower_category", [
  "employed",
  "unemployed",
  "pensioner",
  "student",
  "self_employed",
  "any",
]);

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  category: offerCategoryEnum("category").notNull(),
  amountMin: integer("amount_min").notNull().default(1000),
  amountMax: integer("amount_max").notNull().default(100000),
  termMinDays: integer("term_min_days").notNull().default(1),
  termMaxDays: integer("term_max_days").notNull().default(365),
  psk: numeric("psk", { precision: 6, scale: 2 }).notNull().default("0"),
  rate: numeric("rate", { precision: 6, scale: 2 }).notNull().default("0"),
  freeTermDays: integer("free_term_days").notNull().default(0),
  logoUrl: text("logo_url").default(""),
  affiliateUrl: text("affiliate_url").notNull(),
  borrowerCategory: borrowerCategoryEnum("borrower_category").notNull().default("any"),
  description: text("description").default(""),
  seoKeywords: text("seo_keywords").default(""),
  regions: text("regions").default(""),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  excerpt: text("excerpt").default(""),
  content: text("content").notNull(),
  metaTitle: varchar("meta_title", { length: 255 }).default(""),
  metaDescription: text("meta_description").default(""),
  coverImage: text("cover_image").default(""),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;

// Click tracking for affiliate links
export const clickStats = pgTable("click_stats", {
  id: serial("id").primaryKey(),
  offerId: integer("offer_id").notNull().references(() => offers.id, { onDelete: "cascade" }),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
  userAgent: text("user_agent").default(""),
  referer: text("referer").default(""),
});

export type ClickStat = typeof clickStats.$inferSelect;

// Email subscriptions
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;

// Reviews for offers
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  offerId: integer("offer_id").notNull().references(() => offers.id, { onDelete: "cascade" }),
  authorName: varchar("author_name", { length: 100 }).notNull(),
  rating: integer("rating").notNull().default(5),
  comment: text("comment").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
