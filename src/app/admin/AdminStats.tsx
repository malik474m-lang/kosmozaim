"use client";

import { useState, useEffect, useCallback } from "react";

interface OfferStat {
  offerId: number;
  offerTitle: string;
  clickCount: number;
  lastClick: string | null;
}

interface Stats {
  byOffer: OfferStat[];
  today: number;
  week: number;
  total: number;
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Загрузка статистики...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-500">Ошибка загрузки</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Статистика кликов</h2>
        <button onClick={fetchStats} className="text-primary hover:underline text-sm">
          Обновить
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 uppercase tracking-wide">Сегодня</p>
          <p className="text-3xl font-bold text-primary mt-2">{stats.today}</p>
          <p className="text-xs text-gray-400 mt-1">кликов</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 uppercase tracking-wide">За неделю</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.week}</p>
          <p className="text-xs text-gray-400 mt-1">кликов</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 uppercase tracking-wide">Всего</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">кликов</p>
        </div>
      </div>

      {/* Table */}
      {stats.byOffer.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-3xl mb-3">📊</p>
          <p className="text-gray-500">Пока нет данных о кликах</p>
          <p className="text-gray-400 text-sm">Статистика появится после первых переходов</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Предложение</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Клики</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Последний клик
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.byOffer.map((row) => (
                  <tr key={row.offerId} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.offerTitle}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                        {row.clickCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {row.lastClick
                        ? new Date(row.lastClick).toLocaleString("ru-RU")
                        : "—"}
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
