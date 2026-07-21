import type { Metadata } from "next";
import CalculatorClient from "./CalculatorClient";

export const metadata: Metadata = {
  title: "Калькулятор займа — Рассчитайте стоимость кредита | Космозайм",
  description:
    "Бесплатный калькулятор займа и кредита. Рассчитайте ежемесячный платёж, переплату и подберите лучшее предложение.",
  keywords: "калькулятор займа, калькулятор кредита, расчёт кредита, ежемесячный платёж",
};

export default function CalculatorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Калькулятор займа</h1>
        <p className="text-gray-600">
          Рассчитайте стоимость займа и подберите подходящие предложения по вашим параметрам
        </p>
      </div>
      <CalculatorClient />
    </div>
  );
}
