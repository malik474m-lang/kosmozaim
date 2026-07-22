import { notFound } from "next/navigation";
import Link from "next/link";
import { formatMoney, formatDays, categoryLabels, borrowerLabels, generateSeoTags, normalizeMediaUrl } from "@/lib/utils";
import ReviewSection from "@/components/ReviewSection";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import SimilarOffers from "@/components/SimilarOffers";
import FavoriteButton from "@/components/FavoriteButton";
import { getApprovedOfferRating, getOfferBySlug, getOfferSeoBySlug } from "@/lib/cached-data";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const o = await getOfferSeoBySlug(slug);

  if (!o) {
    return { title: "Предложение не найдено" };
  }

  const seoTags = o.seoKeywords
    ? o.seoKeywords.split(",").map((t: string) => t.trim()).filter(Boolean)
    : generateSeoTags(o.category, o.title, o.amountMax, o.freeTermDays);

  return {
    title: `${o.title} — ${categoryLabels[o.category]} | Космозайм`,
    description: o.description || `${o.title}: ставка от ${o.rate}%, сумма до ${o.amountMax.toLocaleString()} ₽. Оформите онлайн на Космозайм.`,
    keywords: seoTags.join(", "),
  };
}

export const revalidate = 300;

export default async function OfferPage({ params }: PageProps) {
  const { slug } = await params;
  const o = await getOfferBySlug(slug);

  if (!o) {
    notFound();
  }

  const logoUrl = normalizeMediaUrl(o.logoUrl);

  const seoTags = o.seoKeywords
    ? o.seoKeywords.split(",").map((t: string) => t.trim()).filter(Boolean)
    : generateSeoTags(o.category, o.title, o.amountMax, o.freeTermDays);

  const rating = await getApprovedOfferRating(o.id);

  // Category URL
  const categoryUrls: Record<string, string> = {
    microloans: "/zajmy",
    credits: "/kredity",
    credit_cards: "/karty/kreditnye",
    debit_cards: "/karty/debetovye",
  };

  return (
    <>
      <JsonLd type="offer" offer={o} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: "Главная", url: "/" },
            { name: categoryLabels[o.category], url: categoryUrls[o.category] || "/" },
            { name: o.title, url: `/offer/${o.slug}` },
          ]}
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt={o.title} className="w-full h-full object-contain p-2" />
              ) : (
                <span className="text-4xl">🏦</span>
              )}
            </div>
            <div className="flex-1 flex justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{o.title}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded text-sm font-medium">
                    {categoryLabels[o.category]}
                  </span>
                  {rating && (
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <span className="text-yellow-400">★</span>
                      {rating.toFixed(1)}
                    </span>
                  )}
                  {o.freeTermDays > 0 && (
                    <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm font-semibold">
                      Без % — {formatDays(o.freeTermDays)}
                    </span>
                  )}
                </div>
              </div>
              <FavoriteButton offerId={o.id} />
            </div>
          </div>

          {/* Description */}
          {o.description && (
            <p className="text-gray-600 mb-6">{o.description}</p>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Сумма</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {formatMoney(o.amountMin)} — {formatMoney(o.amountMax)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Срок</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {formatDays(o.termMinDays)} — {formatDays(o.termMaxDays)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Ставка</p>
              <p className="text-lg font-bold text-primary mt-1">от {o.rate}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">ПСК</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{o.psk}%</p>
            </div>
          </div>

          {/* Additional info */}
          <div className="border-t border-gray-100 pt-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <span>👤</span>
              <span>Для кого: {borrowerLabels[o.borrowerCategory]}</span>
            </div>
            
            {/* SEO Keywords */}
            <div className="flex flex-wrap gap-1.5">
              {seoTags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <a
            href={`/api/click/${o.id}`}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="btn-accent w-full text-center text-lg py-4 inline-block"
          >
            Оформить заявку →
          </a>
        </div>

        {/* Reviews */}
        <ReviewSection offerId={o.id} offerTitle={o.title} />

        {/* Similar Offers */}
        <SimilarOffers currentOffer={o} />

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href={categoryUrls[o.category] || "/"}
            className="text-primary hover:underline font-medium"
          >
            ← Все {categoryLabels[o.category].toLowerCase()}
          </Link>
        </div>
      </div>
    </>
  );
}
