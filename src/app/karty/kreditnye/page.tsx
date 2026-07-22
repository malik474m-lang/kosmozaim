import { db } from "@/db";
import { offers } from "@/db/schema";
import { eq, and, gte, lte, or, asc } from "drizzle-orm";
import OfferCard from "@/components/OfferCard";
import OfferFilter from "@/components/OfferFilter";
import type { Metadata } from "next";
import { type SQL } from "drizzle-orm";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Кредитные карты — Подбор кредитных карт с льготным периодом | Космозайм",
  description:
    "Сравните кредитные карты от ведущих банков. Льготный период, кэшбек и выгодные условия.",
  keywords: "кредитные карты, кредитная карта с кэшбеком, карта с льготным периодом",
};

export const dynamic = "force-dynamic";

async function OffersList({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const amount = typeof sp.amount === "string" ? sp.amount : undefined;
  const term = typeof sp.term === "string" ? sp.term : undefined;
  const borrower = typeof sp.borrower === "string" ? sp.borrower : undefined;

  const conditions: SQL[] = [
    eq(offers.isActive, true),
    eq(offers.category, "credit_cards"),
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

export default async function CreditCardsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Кредитные карты</h1>
        <p className="text-gray-600">
          Подберите кредитную карту с льготным периодом, кэшбеком и выгодными условиями.
        </p>
      </div>

      <Suspense fallback={<div>Загрузка...</div>}>
        <OfferFilter category="credit_cards" />
      </Suspense>

      <Suspense fallback={<div className="text-center py-12">Загрузка предложений...</div>}>
        <OffersList searchParams={searchParams} />
      </Suspense>

      <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Как выбрать кредитную карту?</h2>
        <div className="prose prose-sm text-gray-600 max-w-none">
          <p>
            Кредитные карты позволяют пользоваться заёмными средствами банка с льготным периодом без
            процентов. Обращайте внимание на длительность льготного периода, размер кредитного лимита,
            процентную ставку и наличие кэшбека.
          </p>
        </div>
      </div>
    </div>
  );
}
