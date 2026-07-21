"use client";

import { useState, useEffect, useCallback } from "react";
import type { Offer } from "@/db/schema";
import { categoryLabels, borrowerLabels } from "@/lib/utils";

const emptyForm = {
  title: "",
  category: "microloans" as string,
  amountMin: "1000",
  amountMax: "100000",
  termMinDays: "1",
  termMaxDays: "365",
  psk: "0",
  rate: "0",
  freeTermDays: "0",
  logoUrl: "",
  affiliateUrl: "",
  borrowerCategory: "any" as string,
  description: "",
  seoKeywords: "",
  regions: "",
  isActive: true,
  sortOrder: "0",
};

export default function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/offers");
      if (res.ok) {
        const data = await res.json();
        setOffers(data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingId
        ? `/api/admin/offers/${editingId}`
        : "/api/admin/offers";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        fetchOffers();
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleEdit = (offer: Offer) => {
    setForm({
      title: offer.title,
      category: offer.category,
      amountMin: String(offer.amountMin),
      amountMax: String(offer.amountMax),
      termMinDays: String(offer.termMinDays),
      termMaxDays: String(offer.termMaxDays),
      psk: String(offer.psk),
      rate: String(offer.rate),
      freeTermDays: String(offer.freeTermDays),
      logoUrl: offer.logoUrl || "",
      affiliateUrl: offer.affiliateUrl,
      borrowerCategory: offer.borrowerCategory,
      description: offer.description || "",
      seoKeywords: offer.seoKeywords || "",
      regions: offer.regions || "",
      isActive: offer.isActive,
      sortOrder: String(offer.sortOrder),
    });
    setEditingId(offer.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить предложение?")) return;
    try {
      await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
      fetchOffers();
    } catch { /* ignore */ }
  };

  const updateField = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Предложения партнёров ({offers.length})
        </h2>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(true);
          }}
          className="btn-primary text-sm"
        >
          + Добавить предложение
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl m-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">
                {editingId ? "Редактировать предложение" : "Новое предложение"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                  <input
                    className="input-field"
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    required
                    placeholder="Например: МигКредит"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                  <select
                    className="select-field"
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                  >
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Категория заёмщика</label>
                  <select
                    className="select-field"
                    value={form.borrowerCategory}
                    onChange={(e) => updateField("borrowerCategory", e.target.value)}
                  >
                    {Object.entries(borrowerLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Сумма от (₽)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.amountMin}
                    onChange={(e) => updateField("amountMin", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Сумма до (₽)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.amountMax}
                    onChange={(e) => updateField("amountMax", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Срок от (дней)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.termMinDays}
                    onChange={(e) => updateField("termMinDays", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Срок до (дней)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.termMaxDays}
                    onChange={(e) => updateField("termMaxDays", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ПСК (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={form.psk}
                    onChange={(e) => updateField("psk", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ставка (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={form.rate}
                    onChange={(e) => updateField("rate", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Срок без % (дней)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.freeTermDays}
                    onChange={(e) => updateField("freeTermDays", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Порядок сортировки</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.sortOrder}
                    onChange={(e) => updateField("sortOrder", e.target.value)}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL логотипа</label>
                  <input
                    className="input-field"
                    value={form.logoUrl}
                    onChange={(e) => updateField("logoUrl", e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Партнёрская ссылка</label>
                  <input
                    className="input-field"
                    value={form.affiliateUrl}
                    onChange={(e) => updateField("affiliateUrl", e.target.value)}
                    required
                    placeholder="https://partner.com/ref=123"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Краткое описание предложения"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO ключевые слова
                    <span className="text-gray-400 font-normal ml-1">(через запятую)</span>
                  </label>
                  <input
                    className="input-field"
                    value={form.seoKeywords}
                    onChange={(e) => updateField("seoKeywords", e.target.value)}
                    placeholder="займ онлайн, быстрый займ, деньги на карту"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Оставьте пустым для автоматической генерации
                  </p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Регионы
                    <span className="text-gray-400 font-normal ml-1">(через запятую, пусто = все регионы)</span>
                  </label>
                  <input
                    className="input-field"
                    value={form.regions}
                    onChange={(e) => updateField("regions", e.target.value)}
                    placeholder="Москва, Санкт-Петербург, Казань"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Оставьте пустым, если предложение работает по всей России
                  </p>
                </div>

                <div className="col-span-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => updateField("isActive", e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Активно</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Отмена
                </button>
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                  {saving ? "Сохранение..." : editingId ? "Сохранить" : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Загрузка...</div>
      ) : offers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-gray-500">Нет предложений</p>
          <p className="text-gray-400 text-sm">Добавьте первое предложение партнёра</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Название</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Категория</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Сумма</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ставка</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Рейтинг</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Статус</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Действия</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {offer.logoUrl ? (
                          <img src={offer.logoUrl} alt="" className="w-6 h-6 rounded object-contain" />
                        ) : (
                          <span>🏦</span>
                        )}
                        <span className="font-medium">{offer.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {categoryLabels[offer.category] || offer.category}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {offer.amountMin.toLocaleString()} — {offer.amountMax.toLocaleString()} ₽
                    </td>
                    <td className="px-4 py-3 text-gray-600">{offer.rate}%</td>
                    <td className="px-4 py-3">
                      {Number(offer.rating) > 0 ? (
                        <span className="text-yellow-600">★ {Number(offer.rating).toFixed(1)} <span className="text-gray-400">({offer.reviewCount})</span></span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          offer.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {offer.isActive ? "Активно" : "Выключено"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(offer)}
                        className="text-primary hover:underline text-sm"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(offer.id)}
                        className="text-red-500 hover:underline text-sm"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
