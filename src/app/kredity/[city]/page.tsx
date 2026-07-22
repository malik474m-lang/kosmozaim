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
    title: `Кредиты ${prep} ${prepCase} — Взять кредит наличными онлайн [${currentYear}] | Космозайм`,
    description: `Кредиты ${prep} ${prepCase} от ведущих банков. Низкие ставки от 4.9%, быстрое одобрение. Сравните условия и оформите заявку онлайн!`,
    keywords: `кредит ${prep} ${prepCase}, взять кредит ${city.name}, кредит наличными ${city.name}, потребительский кредит ${city.name}, банки ${city.name}`,
  };
}

export const dynamic = "force-dynamic";

export default async function CityCreditPage({ params }: PageProps) {
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
    .where(and(eq(offers.isActive, true), eq(offers.category, "credits")))
    .orderBy(asc(offers.sortOrder));

  const nearbyСities = cities
    .filter((c) => c.slug !== citySlug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { name: "Главная", url: "/" },
          { name: "Кредиты", url: "/kredity" },
          { name: `Кредиты ${prep} ${prepCase}`, url: `/kredity/${citySlug}` },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Кредиты {prep} {prepCase} — лучшие предложения банков
        </h1>
        <p className="text-gray-600 text-lg">
          Сравните кредитные предложения банков {prep} {prepCase}. Ставки от 4.9% годовых,
          суммы до 5 000 000 ₽. Онлайн-заявка без визита в офис.
        </p>
      </div>

      {/* Преимущества */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <span className="text-2xl">📉</span>
          <p className="font-semibold mt-2">от 4.9%</p>
          <p className="text-xs text-gray-500">Годовых</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <span className="text-2xl">💰</span>
          <p className="font-semibold mt-2">до 5 млн ₽</p>
          <p className="text-xs text-gray-500">Сумма кредита</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <span className="text-2xl">📅</span>
          <p className="font-semibold mt-2">до 7 лет</p>
          <p className="text-xs text-gray-500">Срок кредита</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
          <span className="text-2xl">📱</span>
          <p className="font-semibold mt-2">Онлайн</p>
          <p className="text-xs text-gray-500">Заявка за 5 минут</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Банки, выдающие кредиты {prep} {prepCase}
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
          Как получить кредит {prep} {prepCase} в {currentYear} году?
        </h2>
        <div className="prose prose-sm text-gray-600 max-w-none">
          <p>
            Банки {prep} {prepCase} предлагают разнообразные кредитные программы для физических
            лиц. Жители {city.region} могут оформить заявку онлайн и получить решение за
            несколько минут.
          </p>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Требования банков {prep} {prepCase}:</h3>
          <ul>
            <li>Возраст от 21 года</li>
            <li>Регистрация {prep} {prepCase} или {city.region}</li>
            <li>Официальное трудоустройство от 3 месяцев</li>
            <li>Положительная кредитная история</li>
          </ul>
          <h3 className="text-lg font-semibold text-gray-900 mt-4">Виды кредитов {prep} {prepCase}:</h3>
          <ul>
            <li>Потребительский кредит — на любые цели</li>
            <li>Кредит наличными — без залога и поручителей</li>
            <li>Рефинансирование — для снижения платежей</li>
            <li>Кредит под залог — со сниженной ставкой</li>
          </ul>
        </div>
      </div>

      {/* Перелинковка */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Кредиты в других городах России</h2>
        <div className="flex flex-wrap gap-2">
          {nearbyСities.map((c) => (
            <Link
              key={c.slug}
              href={`/kredity/${c.slug}`}
              className="inline-block bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:border-primary hover:text-primary transition-colors"
            >
              Кредиты {getCityPreposition(c.name)} {getCityPrepositional(c.name)}
            </Link>
          ))}
          <Link
            href="/kredity"
            className="inline-block bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-dark transition-colors"
          >
            Все кредиты →
          </Link>
        </div>
      </div>
    </div>
  );
}
