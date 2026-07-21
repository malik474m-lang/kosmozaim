"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { borrowerLabels } from "@/lib/utils";

interface FilterProps {
  category: string;
}

export default function OfferFilter({ category }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const amount = searchParams.get("amount") || "";
  const term = searchParams.get("term") || "";
  const borrower = searchParams.get("borrower") || "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      let basePath = "/zajmy";
      if (category === "credits") basePath = "/kredity";
      if (category === "credit_cards") basePath = "/karty/kreditnye";
      if (category === "debit_cards") basePath = "/karty/debetovye";
      router.push(`${basePath}?${params.toString()}`);
    },
    [searchParams, router, category]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Фильтр подбора</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Сумма (₽)
          </label>
          <input
            type="number"
            className="input-field"
            placeholder="Например, 50000"
            value={amount}
            onChange={(e) => updateFilter("amount", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Срок (дней)
          </label>
          <input
            type="number"
            className="input-field"
            placeholder="Например, 30"
            value={term}
            onChange={(e) => updateFilter("term", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Категория заёмщика
          </label>
          <select
            className="select-field"
            value={borrower}
            onChange={(e) => updateFilter("borrower", e.target.value)}
          >
            <option value="">Все категории</option>
            {Object.entries(borrowerLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
