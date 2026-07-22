import { db } from "@/db";
import { offers } from "@/db/schema";
import { eq, and, or, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import OfferCard from "@/components/OfferCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cities, getCityBySlug, getCityPreposition, getCityPrepositional } from "@/lib/cities";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) {
    return { title: "Город не найден" };
  }

  const prep = getCityPreposition(city.name);
  const prepCase = getCityPrepositional(city.name);
  const currentYear = new Date().getFullYear();

  return {
    title: `Банковские карты ${prep} ${prepCase} — Оформить карту онлайн [${currentYear}] | Космозайм`,
    description: `Кредитные и дебетовые карты ${prep} ${prepCase}. Кэшбек до 30%, бесплатное обслуживание. Оформите карту онлайн с доставкой!`,
    keywords: `банковские карты ${prep} ${prepCase}, кредитная карта ${city.name}, дебетовая карта ${city.name}, карта с кэшбеком ${city.name}, оформить карту ${city.name}`,
  };
}

export const dynamic = "force-dynamic";

export default async function CityCardsPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) {
    notFound();
  }

  const prep = getCityPreposition(city.name);
  const prepCase = getCityPrepositional(city.name);
  const currentYear = new Date().getFullYear();

  const allOffers = await db
    .select()
    .from(offers)
    .where(
      and(
        eq(offers.isActive, true),
        or(eq(offers.category, "credit_cards"), eq(offers.category, "debit_cards"))
      )
    )
    .orderBy(asc(offers.sortOrder));

  const creditCards = allOffers.filter((o) => o.category === "credit_cards");
  const debitCards = allOffers.filter((o) => o.category === "debit_cards");

  const nearbyСities = cities
    .filter((c) => c.slug !== citySlug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { name: "Главная", url: "/" },
          { name: "Банковские карты", url: "/karty/kreditnye" },
          { name: `Карты ${prep} ${prepCase}`, url: `/karty/${citySlug}` },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Банковские карты {prep} {prepCase}
        </h1>
        <p className="text-gray-600 text-lg">
          Оформите кредитную или дебетовую карту {prep} {prepCase} с доставкой на дом.
          Кэшбек до 30%, бесплатное обслуживание, льготный период до 120 дней.
        </p>
      </div>

      {/* Преимущества */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <span className="text-2xl">💳</span>
          <p className="font-semibold mt-2">Доставка</p>
          <p className="text-xs text-gray-500">На дом {prep} {prepCase}</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <span className="text-2xl">🎁</span>
          <p className="font-semibold mt-2">до 30%</p>
          <p className="text-xs text-gray-500">Кэшбек</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <span className="text-2xl">🆓</span>
          <p className="font-semibold mt-2">0 ₽</p>
          <p className="text-xs text-gray-500">Обслуживание</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <span className="text-2xl">📅</span>
          <p className="font-semibold mt-2">до 120 дней</p>
          <p className="text-xs text-gray-500">Без процентов</p>
        </div>
      </div>

      {/* Кредитные карты */}
      {creditCards.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Кредитные карты {prep} {prepCase}
          </h2>
          <div className="grid gap-4 mb-8">
            {creditCards.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </>
      )}

      {/* Дебетовые карты */}
      {debitCards.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Дебетовые карты {prep} {prepCase}
          </h2>
          <div className="grid gap-4 mb-8">
            {debitCards.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </>
      )}

      {allOffers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">Предложения не найдены</p>
        </div>
      )}

      {/* SEO текст */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Как оформить банковскую карту {prep} {prepCase}?
        </h2>
        <div className="prose prose-sm text-gray-600 max-w-none">
          <p>
            Банки предлагают жителям {city.name} оформить карту онлайн с бесплатной доставкой.
            Вам не нужно посещать офис — курьер привезёт карту по указанному адресу.
          </p>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Кредитные карты {prep} {prepCase}</h3>
          <p>
            Кредитные карты позволяют пользоваться деньгами банка с льготным периодом до 120 дней.
            Это удобно для крупных покупок и непредвиденных расходов.
          </p>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Дебетовые карты {prep} {prepCase}</h3>
          <p>
            Дебетовые карты с кэшбеком позволяют возвращать до 30% от покупок. Многие банки
            предлагают бесплатное обслуживание и начисление процентов на остаток.
          </p>
        </div>
      </div>

      {/* Перелинковка */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Карты в других городах России</h2>
        <div className="flex flex-wrap gap-2">
          {nearbyСities.map((c) => (
            <Link
              key={c.slug}
              href={`/karty/${c.slug}`}
              className="inline-block bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:border-primary hover:text-primary transition-colors"
            >
              Карты {getCityPreposition(c.name)} {getCityPrepositional(c.name)}
            </Link>
          ))}
          <Link
            href="/karty/kreditnye"
            className="inline-block bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-dark transition-colors"
          >
            Все карты →
          </Link>
        </div>
      </div>
    </div>
  );
}
