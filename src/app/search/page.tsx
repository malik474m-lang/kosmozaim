import { db } from "@/db";
import { offers, articles, type Offer, type Article } from "@/db/schema";
import { eq, or, like, and } from "drizzle-orm";
import OfferCard from "@/components/OfferCard";
import Link from "next/link";
import { normalizeMediaUrl } from "@/lib/utils";
import type { Metadata } from "next";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Поиск: ${q} | Космозайм` : "Поиск | Космозайм",
    robots: "noindex, follow",
  };
}

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  let foundOffers: Offer[] = [];
  let foundArticles: Article[] = [];

  if (query) {
    const searchPattern = `%${query}%`;

    foundOffers = await db
      .select()
      .from(offers)
      .where(
        and(
          eq(offers.isActive, true),
          or(
            like(offers.title, searchPattern),
            like(offers.description, searchPattern)
          )
        )
      );

    foundArticles = await db
      .select()
      .from(articles)
      .where(
        and(
          eq(articles.isPublished, true),
          or(
            like(articles.title, searchPattern),
            like(articles.excerpt, searchPattern),
            like(articles.content, searchPattern)
          )
        )
      );
  }

  const totalResults = foundOffers.length + foundArticles.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {query ? `Результаты поиска: "${query}"` : "Поиск"}
        </h1>
        {query && (
          <p className="text-gray-600">
            Найдено результатов: {totalResults}
          </p>
        )}
      </div>

      {!query && (
        <div className="text-center py-16 bg-white rounded-xl">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-gray-500 text-lg">Введите запрос для поиска</p>
          <p className="text-gray-400 text-sm mt-2">
            Используйте поиск в шапке сайта
          </p>
        </div>
      )}

      {query && totalResults === 0 && (
        <div className="text-center py-16 bg-white rounded-xl">
          <p className="text-3xl mb-3">😕</p>
          <p className="text-gray-500 text-lg">Ничего не найдено</p>
          <p className="text-gray-400 text-sm mt-2">
            Попробуйте изменить поисковый запрос
          </p>
        </div>
      )}

      {/* Offers */}
      {foundOffers.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Предложения ({foundOffers.length})
          </h2>
          <div className="grid gap-4">
            {foundOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      )}

      {/* Articles */}
      {foundArticles.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Статьи ({foundArticles.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {foundArticles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover block"
              >
                {normalizeMediaUrl(article.coverImage) ? (
                  <div className="h-40 bg-gray-100">
                    <img
                      src={normalizeMediaUrl(article.coverImage)}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <span className="text-4xl">📰</span>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
