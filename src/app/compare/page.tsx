import type { Metadata } from "next";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
  title: "Сравнение предложений — Космозайм",
  description:
    "Сравните условия займов, кредитов и карт в удобной таблице. Выберите лучшее предложение по ставке, сумме и сроку.",
  keywords: "сравнение займов, сравнение кредитов, сравнение карт",
};

export default function ComparePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Сравнение предложений</h1>
        <p className="text-gray-600">
          Выберите до 4 предложений для сравнения условий в удобной таблице
        </p>
      </div>
      <CompareClient />
    </div>
  );
}
