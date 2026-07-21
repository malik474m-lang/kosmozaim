"use client";

import { useState, useEffect, useCallback } from "react";
import type { Subscriber } from "@/db/schema";

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscribers");
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const exportCSV = () => {
    const csv = [
      "Email,Дата подписки,Статус",
      ...subscribers.map(
        (s) =>
          `${s.email},${new Date(s.subscribedAt).toLocaleDateString("ru-RU")},${
            s.isActive ? "Активен" : "Отписан"
          }`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Подписчики ({subscribers.length})
        </h2>
        {subscribers.length > 0 && (
          <button onClick={exportCSV} className="btn-primary text-sm">
            📥 Экспорт CSV
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Загрузка...</div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-3xl mb-3">📬</p>
          <p className="text-gray-500">Пока нет подписчиков</p>
          <p className="text-gray-400 text-sm">
            Подписчики появятся после заполнения формы в футере
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Дата подписки
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Статус</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{sub.email}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(sub.subscribedAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          sub.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {sub.isActive ? "Активен" : "Отписан"}
                      </span>
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
