import Link from "next/link";
import { formatMoney, formatDays, generateSeoTags } from "@/lib/utils";
import type { Offer } from "@/db/schema";
import FavoriteButton from "./FavoriteButton";

interface OfferCardProps {
  offer: Offer;
}

export default function OfferCard({ offer }: OfferCardProps) {
  const seoTags = offer.seoKeywords
    ? offer.seoKeywords.split(",").map((t) => t.trim()).filter(Boolean)
    : generateSeoTags(offer.category, offer.title, offer.amountMax, offer.freeTermDays);

  return (
    <article 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover"
      itemScope
      itemType="https://schema.org/FinancialProduct"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Logo */}
        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {offer.logoUrl ? (
            <img
              src={offer.logoUrl}
              alt={`Логотип ${offer.title}`}
              className="w-full h-full object-contain p-1"
              itemProp="image"
            />
          ) : (
            <span className="text-3xl">🏦</span>
          )}
        </div>

        {/* Title & Favorite */}
        <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
          <div>
<Link href={`/offer/${offer.slug}`} className="hover:text-primary transition-colors">
            <h3 className="text-lg font-bold text-gray-900 mb-1" itemProp="name">
              {offer.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            {Number(offer.rating) > 0 && (
              <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded">
                ★ {Number(offer.rating).toFixed(1)}
                {offer.reviewCount > 0 && (
                  <span className="text-yellow-500 font-normal">({offer.reviewCount})</span>
                )}
              </span>
            )}
            {offer.freeTermDays > 0 && (
              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                Без % — {formatDays(offer.freeTermDays)}
              </span>
            )}
          </div>
          </div>
          <FavoriteButton offerId={offer.id} size="sm" />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Сумма</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5" itemProp="amount">
            {formatMoney(offer.amountMin)} — {formatMoney(offer.amountMax)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Срок</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">
            {formatDays(offer.termMinDays)} — {formatDays(offer.termMaxDays)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Ставка</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5" itemProp="interestRate">
            от {offer.rate}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">ПСК</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{offer.psk}%</p>
        </div>
      </div>

      {offer.description && (
        <p className="text-sm text-gray-600 mt-4 line-clamp-2" itemProp="description">
          {offer.description}
        </p>
      )}

      {/* SEO Keywords */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {seoTags.slice(0, 5).map((tag, index) => (
          <span
            key={index}
            className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-5 flex items-center justify-between">
        <Link
          href={`/offer/${offer.slug}`}
          className="text-primary hover:underline text-sm font-medium"
        >
          Подробнее →
        </Link>
        <a
          href={`/api/click/${offer.id}`}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          className="btn-accent inline-flex items-center space-x-2 text-sm"
        >
          <span>Оформить</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>

      {/* Schema.org meta */}
      <meta itemProp="category" content={offer.category} />
      <meta itemProp="url" content={`/offer/${offer.slug}`} />
    </article>
  );
}
