"use client";

import { useState, useEffect } from "react";
import { formatMoney, formatDays, categoryLabels, normalizeMediaUrl } from "@/lib/utils";
import { useGeo } from "@/components/GeoProvider";
import type { Offer } from "@/db/schema";

export default function CompareClient() {
  const { geo } = useGeo();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    const cityParam = geo.city ? `?city=${encodeURIComponent(geo.city)}` : "";
    fetch(`/api/offers${cityParam}`)
      .then((res) => res.json())
      .then((data) => {
        setOffers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [geo.city]);

  const filteredOffers = category === "all" 
    ? offers 
    : offers.filter((o) => o.category === category);

  const selectedOffers = offers.filter((o) => selected.includes(o.id));

  const toggleSelect = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else if (selected.length < 4) {
      setSelected([...selected, id]);
    }
  };

  const clearSelection = () => setSelected([]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Загрузка предложений...</div>;
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left: Offer selection */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Выберите предложения</h2>
            <span className="text-sm text-gray-500">{selected.length}/4</span>
          </div>

          {/* Category filter */}
          <select
            className="select-field mb-4 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">Все категории</option>
            <option value="microloans">Займы</option>
            <option value="credits">Кредиты</option>
            <option value="credit_cards">Кредитные карты</option>
            <option value="debit_cards">Дебетовые карты</option>
          </select>

          {/* Offer list */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredOffers.map((offer) => (
              <label
                key={offer.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selected.includes(offer.id)
                    ? "bg-primary/10 border border-primary"
                    : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(offer.id)}
                  onChange={() => toggleSelect(offer.id)}
                  disabled={!selected.includes(offer.id) && selected.length >= 4}
                  className="w-4 h-4 rounded text-primary"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{offer.title}</p>
                  <p className="text-xs text-gray-500">{categoryLabels[offer.category]}</p>
                </div>
              </label>
            ))}
          </div>

          {selected.length > 0 && (
            <button
              onClick={clearSelection}
              className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              Очистить выбор
            </button>
          )}
        </div>
      </div>

      {/* Right: Comparison table */}
      <div className="lg:col-span-2">
        {selectedOffers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <p className="text-3xl mb-3">⚖️</p>
            <p className="text-gray-500 text-lg">Выберите предложения для сравнения</p>
            <p className="text-gray-400 text-sm mt-2">
              Отметьте до 4 предложений в списке слева
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 bg-gray-50 font-medium text-gray-600 w-32">
                      Параметр
                    </th>
                    {selectedOffers.map((offer) => (
                      <th key={offer.id} className="p-4 text-center min-w-[150px]">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {normalizeMediaUrl(offer.logoUrl) ? (
                              <img src={normalizeMediaUrl(offer.logoUrl)} alt="" className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="text-xl">🏦</span>
                            )}
                          </div>
                          <span className="font-bold text-gray-900 text-sm">{offer.title}</span>
                          <button
                            onClick={() => toggleSelect(offer.id)}
                            className="text-xs text-gray-400 hover:text-red-500"
                          >
                            ✕ Убрать
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 bg-gray-50 font-medium text-gray-600">Категория</td>
                    {selectedOffers.map((o) => (
                      <td key={o.id} className="p-4 text-center">
                        <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs">
                          {categoryLabels[o.category]}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 bg-gray-50 font-medium text-gray-600">Сумма</td>
                    {selectedOffers.map((o) => (
                      <td key={o.id} className="p-4 text-center font-semibold">
                        {formatMoney(o.amountMin)} — {formatMoney(o.amountMax)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 bg-gray-50 font-medium text-gray-600">Срок</td>
                    {selectedOffers.map((o) => (
                      <td key={o.id} className="p-4 text-center">
                        {formatDays(o.termMinDays)} — {formatDays(o.termMaxDays)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 bg-gray-50 font-medium text-gray-600">Ставка</td>
                    {selectedOffers.map((o) => (
                      <td key={o.id} className="p-4 text-center font-semibold text-primary">
                        от {o.rate}%
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 bg-gray-50 font-medium text-gray-600">ПСК</td>
                    {selectedOffers.map((o) => (
                      <td key={o.id} className="p-4 text-center">{o.psk}%</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 bg-gray-50 font-medium text-gray-600">Без %</td>
                    {selectedOffers.map((o) => (
                      <td key={o.id} className="p-4 text-center">
                        {o.freeTermDays > 0 ? (
                          <span className="text-green-600 font-semibold">
                            {formatDays(o.freeTermDays)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-gray-50 font-medium text-gray-600">Оформить</td>
                    {selectedOffers.map((o) => (
                      <td key={o.id} className="p-4 text-center">
                        <a
                          href={`/api/click/${o.id}`}
                          target="_blank"
                          rel="noopener noreferrer nofollow sponsored"
                          className="btn-accent text-xs px-4 py-2 inline-block"
                        >
                          Перейти →
                        </a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
