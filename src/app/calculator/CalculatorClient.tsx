"use client";

import { useState, useEffect } from "react";
import { formatMoney, formatDays, categoryLabels, normalizeMediaUrl } from "@/lib/utils";
import { useGeo } from "@/components/GeoProvider";
import type { Offer } from "@/db/schema";

export default function CalculatorClient() {
  const { geo } = useGeo();
  const [amount, setAmount] = useState(30000);
  const [termDays, setTermDays] = useState(30);
  const [rate, setRate] = useState(1);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);

  const totalInterest = (amount * rate * termDays) / 100;
  const totalPayment = amount + totalInterest;
  const dailyPayment = termDays > 0 ? totalPayment / termDays : 0;

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const cityParam = geo.city ? `&city=${encodeURIComponent(geo.city)}` : "";
        const res = await fetch(`/api/offers?amount=${amount}&term=${termDays}${cityParam}`);
        const data = await res.json();
        setOffers(data);
      } catch {
        setOffers([]);
      }
      setLoading(false);
    };

    const timer = setTimeout(fetchOffers, 300);
    return () => clearTimeout(timer);
  }, [amount, termDays, geo.city]);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Calculator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Параметры займа</h2>

        {/* Amount slider */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Сумма займа</label>
            <span className="text-lg font-bold text-primary">{formatMoney(amount)}</span>
          </div>
          <input
            type="range"
            min={1000}
            max={1000000}
            step={1000}
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 000 ₽</span>
            <span>1 000 000 ₽</span>
          </div>
        </div>

        {/* Term slider */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Срок</label>
            <span className="text-lg font-bold text-primary">{formatDays(termDays)}</span>
          </div>
          <input
            type="range"
            min={1}
            max={365}
            step={1}
            value={termDays}
            onChange={(e) => setTermDays(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 день</span>
            <span>365 дней</span>
          </div>
        </div>

        {/* Rate input */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Ставка (% в день)</label>
            <span className="text-lg font-bold text-primary">{rate}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={0.01}
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>5%</span>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">Результат расчёта</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Сумма к возврату</p>
              <p className="text-xl font-bold text-gray-900">{formatMoney(totalPayment)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Переплата</p>
              <p className="text-xl font-bold text-danger">{formatMoney(totalInterest)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Ежедневный платёж</p>
              <p className="text-lg font-bold text-gray-900">{formatMoney(dailyPayment)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Ставка годовая</p>
              <p className="text-lg font-bold text-gray-900">{(rate * 365).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Matching Offers */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Подходящие предложения
          {offers.length > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">({offers.length})</span>
          )}
        </h2>

        {loading && (
          <div className="text-center py-8 text-gray-500">Поиск предложений...</div>
        )}

        {!loading && offers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-gray-500">Предложения не найдены</p>
            <p className="text-gray-400 text-sm mt-1">Попробуйте изменить параметры</p>
          </div>
        )}

        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 card-hover"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {normalizeMediaUrl(offer.logoUrl) ? (
                    <img src={normalizeMediaUrl(offer.logoUrl)} alt={offer.title} className="w-full h-full object-contain p-0.5" />
                  ) : (
                    <span className="text-xl">🏦</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm">{offer.title}</h3>
                  <p className="text-xs text-gray-500">
                    {categoryLabels[offer.category] || offer.category}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Ставка:</span>{" "}
                  <span className="font-semibold">от {offer.rate}%</span>
                </div>
                <div>
                  <span className="text-gray-500">ПСК:</span>{" "}
                  <span className="font-semibold">{offer.psk}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Сумма:</span>{" "}
                  <span className="font-semibold">до {formatMoney(offer.amountMax)}</span>
                </div>
                {offer.freeTermDays > 0 && (
                  <div>
                    <span className="text-green-600 font-semibold">
                      Без % {formatDays(offer.freeTermDays)}
                    </span>
                  </div>
                )}
              </div>
              <a
                href={`/api/click/${offer.id}`}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="block w-full text-center btn-accent text-sm py-2"
              >
                Оформить →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
