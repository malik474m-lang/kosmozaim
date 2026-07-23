"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import type { Offer } from "@/db/schema";
import { formatDays, formatMoney, normalizeMediaUrl, generateSeoTags } from "@/lib/utils";

interface CityOffersClientProps {
  category: string;
  cityName: string;
}

export default function CityOffersClient({ category, cityName }: CityOffersClientProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ category, city: cityName });
        const res = await fetch(`/api/offers?${params.toString()}`, { cache: "no-store" });
        const data = await res.json();
        setOffers(Array.isArray(data) ? data : []);
      } catch {
        setOffers([]);
      }
      setLoading(false);
    };

    fetchOffers();
  }, [category, cityName]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Загрузка предложений...</div>;
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <p className="text-gray-500">Предложения не найдены</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 mb-8">
      {offers.map((offer) => {
        const logoUrl = normalizeMediaUrl(offer.logoUrl);
        const seoTags = offer.seoKeywords
          ? offer.seoKeywords.split(",").map((t) => t.trim()).filter(Boolean)
          : generateSeoTags(offer.category, offer.title, offer.amountMax, offer.freeTermDays);

        return (
          <article key={offer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt={offer.title} className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-3xl">🏦</span>
                )}
              </div>

              <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                <div>
                  <Link href={`/offer/${offer.slug}`} className="hover:text-primary transition-colors">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{offer.title}</h3>
                  </Link>
                  <div className="flex items-center gap-2 flex-wrap">
                    {Number(offer.rating) > 0 && (
                      <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded">
                        ★ {Number(offer.rating).toFixed(1)}
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              <div>
                <p className="text-xs text-gray-500 uppercase">Сумма</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {formatMoney(offer.amountMin)} — {formatMoney(offer.amountMax)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Срок</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {formatDays(offer.termMinDays)} — {formatDays(offer.termMaxDays)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Ставка</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">от {offer.rate}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">ПСК</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{offer.psk}%</p>
              </div>
            </div>

            {offer.description && (
              <p className="text-sm text-gray-600 mt-4 line-clamp-2">{offer.description}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-1.5">
              {seoTags.slice(0, 5).map((tag, i) => (
                <span key={i} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <Link href={`/offer/${offer.slug}`} className="text-primary hover:underline text-sm font-medium">
                Подробнее →
              </Link>
              <a
                href={`/api/click/${offer.id}`}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="btn-accent inline-flex items-center space-x-2 text-sm"
              >
                <span>Оформить</span>
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
