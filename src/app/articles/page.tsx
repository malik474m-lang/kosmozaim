import Link from "next/link";
import { normalizeMediaUrl } from "@/lib/utils";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Полезные статьи о финансах — Космозайм",
  description:
    "Актуальные статьи о займах, кредитах, банковских картах и личных финансах. Советы экспертов и полезные рекомендации.",
  keywords: "финансовые статьи, статьи о кредитах, советы по займам",
};

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const allArticles = await db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.createdAt));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Полезные статьи</h1>
        <p className="text-gray-600">
          Актуальные материалы о финансах, кредитах, займах и банковских картах
        </p>
      </div>

      {allArticles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">
          <p className="text-3xl mb-3">📚</p>
          <p className="text-gray-500 text-lg">Статьи скоро появятся</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allArticles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover block"
            >
              {normalizeMediaUrl(article.coverImage) ? (
                <div className="h-48 bg-gray-100">
                  <img
                    src={normalizeMediaUrl(article.coverImage)}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <span className="text-5xl">📰</span>
                </div>
              )}
              <div className="p-5">
                <h2 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">{article.excerpt}</p>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(article.createdAt).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
