import { db } from "@/db";
import { offers } from "@/db/schema";
import { eq, and, ne, asc } from "drizzle-orm";
import Link from "next/link";
import { formatMoney, categoryLabels, normalizeMediaUrl } from "@/lib/utils";
import type { Offer } from "@/db/schema";

interface SimilarOffersProps {
  currentOffer: Offer;
}

export default async function SimilarOffers({ currentOffer }: SimilarOffersProps) {
  // Находим похожие предложения по категории
  const similar = await db
    .select()
    .from(offers)
    .where(
      and(
        eq(offers.isActive, true),
        eq(offers.category, currentOffer.category),
        ne(offers.id, currentOffer.id)
      )
    )
    .orderBy(asc(offers.sortOrder))
    .limit(4);

  if (similar.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Похожие предложения</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {similar.map((offer) => (
          <Link
            key={offer.id}
            href={`/offer/${offer.slug}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {normalizeMediaUrl(offer.logoUrl) ? (
                <img src={normalizeMediaUrl(offer.logoUrl)} alt="" className="w-full h-full object-contain p-0.5" />
              ) : (
                <span className="text-lg">🏦</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{offer.title}</h3>
              <p className="text-xs text-gray-500">
                до {formatMoney(offer.amountMax)} • от {offer.rate}%
              </p>
            </div>
            {offer.freeTermDays > 0 && (
              <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded flex-shrink-0">
                0%
              </span>
            )}
          </Link>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link
          href={
            currentOffer.category === "microloans"
              ? "/zajmy"
              : currentOffer.category === "credits"
              ? "/kredity"
              : currentOffer.category === "credit_cards"
              ? "/karty/kreditnye"
              : "/karty/debetovye"
          }
          className="text-primary hover:underline text-sm font-medium"
        >
          Все {categoryLabels[currentOffer.category]?.toLowerCase() || "предложения"} →
        </Link>
      </div>
    </div>
  );
}
