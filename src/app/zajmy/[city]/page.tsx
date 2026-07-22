import { db } from "@/db";
import { offers } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
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
    title: `Займы ${prep} ${prepCase} — Взять микрозайм онлайн на карту [${currentYear}] | Космозайм`,
    description: `Займы ${prep} ${prepCase} на карту онлайн. Быстрое одобрение, выдача за 15 минут. Сравните ${cities.length}+ предложений от МФО. Первый займ без процентов!`,
    keywords: `займ ${prep} ${prepCase}, микрозайм ${city.name}, деньги в долг ${city.name}, займ на карту ${city.name}, быстрый займ ${city.name}, займ онлайн ${city.name}`,
  };
}

export const dynamic = "force-dynamic";

export default async function CityLoansPage({ params }: PageProps) {
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
    .where(and(eq(offers.isActive, true), eq(offers.category, "microloans")))
    .orderBy(asc(offers.sortOrder));

  // Соседние города для перелинковки
  const nearbyСities = cities
    .filter((c) => c.slug !== citySlug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { name: "Главная", url: "/" },
          { name: "Займы", url: "/zajmy" },
          { name: `Займы ${prep} ${prepCase}`, url: `/zajmy/${citySlug}` },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Займы {prep} {prepCase} на карту онлайн
        </h1>
        <p className="text-gray-600 text-lg">
          Получите займ {prep} {prepCase} за 15 минут. Сравните {allOffers.length} предложений от
          проверенных МФО. Первый займ под 0% для новых клиентов!
        </p>
      </div>

      {/* Преимущества */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <span className="text-2xl">⚡</span>
          <p className="font-semibold mt-2">За 15 минут</p>
          <p className="text-xs text-gray-500">Быстрое решение</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <span className="text-2xl">💳</span>
          <p className="font-semibold mt-2">На карту</p>
          <p className="text-xs text-gray-500">Любой банк РФ</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <span className="text-2xl">🎁</span>
          <p className="font-semibold mt-2">Под 0%</p>
          <p className="text-xs text-gray-500">Первый займ</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <span className="text-2xl">✅</span>
          <p className="font-semibold mt-2">Без отказа</p>
          <p className="text-xs text-gray-500">Высокое одобрение</p>
        </div>
      </div>

      {/* Список предложений */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        МФО, выдающие займы {prep} {prepCase}
      </h2>

      {allOffers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">Предложения не найдены</p>
        </div>
      ) : (
        <div className="grid gap-4 mb-8">
          {allOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}

      {/* SEO текст */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Как получить займ {prep} {prepCase} в {currentYear} году?
        </h2>
        <div className="prose prose-sm text-gray-600 max-w-none">
          <p>
            Жители города {city.name} ({city.region}) могут получить микрозайм онлайн, не выходя из
            дома. Современные МФО работают круглосуточно и выдают деньги на карту любого банка РФ
            за несколько минут.
          </p>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Требования к заёмщикам {prep} {prepCase}:</h3>
          <ul>
            <li>Возраст от 18 лет</li>
            <li>Гражданство РФ и регистрация {prep} {prepCase} или {city.region}</li>
            <li>Действующий паспорт</li>
            <li>Банковская карта для получения денег</li>
          </ul>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Популярные суммы займов {prep} {prepCase}:</h3>
          <p>
            Чаще всего жители {city.name} берут займы на сумму от 5 000 до 30 000 рублей на срок
            до 30 дней. Для постоянных клиентов доступны суммы до 100 000 рублей.
          </p>
        </div>
      </div>

      {/* Перелинковка на другие города */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Займы в других городах России</h2>
        <div className="flex flex-wrap gap-2">
          {nearbyСities.map((c) => (
            <Link
              key={c.slug}
              href={`/zajmy/${c.slug}`}
              className="inline-block bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:border-primary hover:text-primary transition-colors"
            >
              Займы {getCityPreposition(c.name)} {getCityPrepositional(c.name)}
            </Link>
          ))}
          <Link
            href="/zajmy"
            className="inline-block bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-dark transition-colors"
          >
            Все займы →
          </Link>
        </div>
      </div>
    </div>
  );
}
