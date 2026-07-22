import { db } from "@/db";
import { offers } from "@/db/schema";
import { eq, and, gte, lte, or, asc } from "drizzle-orm";
import OfferCard from "@/components/OfferCard";
import OfferFilter from "@/components/OfferFilter";
import type { Metadata } from "next";
import { type SQL } from "drizzle-orm";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Займы онлайн — Подбор микрозаймов на карту | Космозайм",
  description:
    "Подберите выгодный микрозайм онлайн. Сравните ставки, суммы и сроки от проверенных МФО. Быстрое одобрение и перевод на карту.",
  keywords: "займы онлайн, микрозаймы, займ на карту, быстрый займ, МФО",
};

export const dynamic = "force-dynamic";

async function OffersList({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const amount = typeof sp.amount === "string" ? sp.amount : undefined;
  const term = typeof sp.term === "string" ? sp.term : undefined;
  const borrower = typeof sp.borrower === "string" ? sp.borrower : undefined;

  const conditions: SQL[] = [
    eq(offers.isActive, true),
    eq(offers.category, "microloans"),
  ];

  if (amount) {
    const n = parseInt(amount);
    if (!isNaN(n)) {
      conditions.push(lte(offers.amountMin, n));
      conditions.push(gte(offers.amountMax, n));
    }
  }
  if (term) {
    const n = parseInt(term);
    if (!isNaN(n)) {
      conditions.push(lte(offers.termMinDays, n));
      conditions.push(gte(offers.termMaxDays, n));
    }
  }
  if (borrower) {
    conditions.push(
      or(
        eq(offers.borrowerCategory, borrower as "employed" | "unemployed" | "pensioner" | "student" | "self_employed" | "any"),
        eq(offers.borrowerCategory, "any")
      )!
    );
  }

  const results = await db
    .select()
    .from(offers)
    .where(and(...conditions))
    .orderBy(asc(offers.sortOrder));

  if (results.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <p className="text-gray-500 text-lg">Предложения не найдены</p>
        <p className="text-gray-400 text-sm mt-2">Попробуйте изменить параметры фильтра</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {results.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}

export default async function ZajmyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Займы онлайн</h1>
        <p className="text-gray-600">
          Подберите выгодный микрозайм на карту. Сравните условия от надёжных МФО.
        </p>
      </div>

      <Suspense fallback={<div>Загрузка...</div>}>
        <OfferFilter category="microloans" />
      </Suspense>

      <Suspense fallback={<div className="text-center py-12">Загрузка предложений...</div>}>
        <OffersList searchParams={searchParams} />
      </Suspense>

      <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Как получить займ онлайн?</h2>
        <div className="prose prose-sm text-gray-600 max-w-none">
          <p>
            Микрозаймы — это быстрый способ получить деньги на короткий срок. Вы можете оформить займ
            онлайн не выходя из дома. Деньги поступят на вашу банковскую карту в течение нескольких
            минут после одобрения заявки.
          </p>
          <p>
            Используйте наши фильтры для подбора займа по нужной сумме, сроку и категории заёмщика.
            Обращайте внимание на ставку и полную стоимость кредита (ПСК).
          </p>
        </div>
      </div>
    </div>
  );
}
