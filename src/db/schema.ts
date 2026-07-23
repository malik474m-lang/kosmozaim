import {
  mysqlTable,
  serial,
  varchar,
  text,
  int,
  decimal,
  boolean,
  timestamp,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const offers = mysqlTable("offers", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  category: mysqlEnum("category", ["microloans", "credits", "credit_cards", "debit_cards"]).notNull(),
  amountMin: int("amount_min").notNull().default(1000),
  amountMax: int("amount_max").notNull().default(100000),
  termMinDays: int("term_min_days").notNull().default(1),
  termMaxDays: int("term_max_days").notNull().default(365),
  psk: decimal("psk", { precision: 6, scale: 2 }).notNull().default("0"),
  rate: decimal("rate", { precision: 6, scale: 2 }).notNull().default("0"),
  freeTermDays: int("free_term_days").notNull().default(0),
  logoUrl: text("logo_url"),
  affiliateUrl: text("affiliate_url").notNull(),
  borrowerCategory: mysqlEnum("borrower_category", ["employed", "unemployed", "pensioner", "student", "self_employed", "any"]).notNull().default("any"),
  description: text("description"),
  seoKeywords: text("seo_keywords"),
  regions: text("regions"),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull().default("0"),
  reviewCount: int("review_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const articles = mysqlTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  coverImage: text("cover_image"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminUsers = mysqlTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clickStats = mysqlTable("click_stats", {
  id: serial("id").primaryKey(),
  offerId: int("offer_id").notNull(),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
  userAgent: text("user_agent"),
  referer: text("referer"),
});

export const subscribers = mysqlTable("subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

export const reviews = mysqlTable("reviews", {
  id: serial("id").primaryKey(),
  offerId: int("offer_id").notNull(),
  authorName: varchar("author_name", { length: 100 }).notNull(),
  rating: int("rating").notNull().default(5),
  comment: text("comment").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type ClickStat = typeof clickStats.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export const geoRedirects = mysqlTable("geo_redirects", {
  id: serial("id").primaryKey(),
  countryCode: varchar("country_code", { length: 10 }).notNull(),
  countryName: varchar("country_name", { length: 100 }).notNull().default(""),
  redirectUrl: text("redirect_url").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type GeoRedirect = typeof geoRedirects.$inferSelect;
