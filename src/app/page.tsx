import Link from "next/link";
import OfferCard from "@/components/OfferCard";
import JsonLd from "@/components/JsonLd";
import { normalizeMediaUrl } from "@/lib/utils";
import { getHomeData } from "@/lib/cached-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Космозайм — Подбор займов, кредитов и банковских карт онлайн",
  description:
    "Сравните лучшие предложения по займам, кредитам, кредитным и дебетовым картам. Калькулятор займа, удобные фильтры и актуальные условия.",
};

export const revalidate = 300;

export default async function HomePage() {
  const { topOffers, latestArticles } = await getHomeData();

  return (
    <>
      <JsonLd type="organization" />
      <JsonLd type="website" />

      {/* Hero Section */}
      <section className="gradient-hero text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-6 leading-tight">
            Подберите лучший займ, кредит<br className="hidden sm:block" /> или банковскую карту
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Сравнивайте условия от проверенных партнёров. Используйте калькулятор и фильтры для подбора
            идеального предложения.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/calculator" className="btn-accent text-lg px-8 py-4">
              🧮 Калькулятор займа
            </Link>
            <Link
              href="/zajmy"
              className="bg-white/20 backdrop-blur text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/30 transition-colors text-lg"
            >
              Все предложения →
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: "/zajmy", icon: "💵", title: "Займы", desc: "Быстрые микрозаймы онлайн" },
            { href: "/kredity", icon: "🏦", title: "Кредиты", desc: "Банковские кредиты" },
            { href: "/karty/kreditnye", icon: "💳", title: "Кредитные карты", desc: "Карты с кредитным лимитом" },
            { href: "/karty/debetovye", icon: "🪪", title: "Дебетовые карты", desc: "Карты с кэшбеком" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center card-hover block"
            >
              <span className="text-3xl block mb-2">{item.icon}</span>
              <h2 className="font-bold text-gray-900">{item.title}</h2>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Offers */}
      {topOffers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Лучшие предложения</h2>
            <Link href="/zajmy" className="text-primary hover:underline font-medium text-sm">
              Все предложения →
            </Link>
          </div>
          <div className="grid gap-4">
            {topOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      )}

      {/* Calculator Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Калькулятор займа</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            Рассчитайте стоимость займа и подберите подходящие предложения по вашим параметрам
          </p>
          <Link
            href="/calculator"
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Открыть калькулятор
          </Link>
        </div>
      </section>

      {/* Articles */}
      {latestArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Полезные статьи</h2>
            <Link href="/articles" className="text-primary hover:underline font-medium text-sm">
              Все статьи →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover block"
              >
                {normalizeMediaUrl(article.coverImage) && (
                  <div className="h-40 bg-gray-100">
                    <img
                      src={normalizeMediaUrl(article.coverImage)}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                  {article.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-3">{article.excerpt}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(article.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SEO Text Block */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Подбор финансовых продуктов онлайн
          </h2>
          <div className="prose prose-sm text-gray-600 max-w-none">
            <p>
              <strong>Космозайм</strong> — это удобный сервис сравнения финансовых предложений от
              проверенных банков и микрофинансовых организаций. На нашем сайте вы можете подобрать
              выгодный займ, кредит, кредитную или дебетовую карту, используя удобные фильтры и
              калькулятор.
            </p>
            <p>
              Мы собираем актуальные условия по ставкам, суммам, срокам и полной стоимости кредита
              (ПСК), чтобы вы могли сделать осознанный выбор. Все предложения содержат прозрачную
              информацию о процентных ставках, беспроцентных периодах и категориях заёмщиков.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
