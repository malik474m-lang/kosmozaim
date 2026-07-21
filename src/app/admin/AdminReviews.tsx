"use client";

import { useState, useEffect, useCallback } from "react";

interface ReviewWithOffer {
  id: number;
  offerId: number;
  offerTitle: string | null;
  authorName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewWithOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApprove = async (id: number, approve: boolean) => {
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: approve }),
      });
      fetchReviews();
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить отзыв?")) return;
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      fetchReviews();
    } catch {
      /* ignore */
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === "pending") return !r.isApproved;
    if (filter === "approved") return r.isApproved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">Отзывы ({reviews.length})</h2>
          {pendingCount > 0 && (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-sm font-semibold">
              {pendingCount} на модерации
            </span>
          )}
        </div>
        <select
          className="select-field w-auto text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
        >
          <option value="all">Все</option>
          <option value="pending">На модерации</option>
          <option value="approved">Одобренные</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Загрузка...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-3xl mb-3">⭐</p>
          <p className="text-gray-500">Нет отзывов</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white rounded-xl shadow-sm border p-5 ${
                review.isApproved ? "border-gray-100" : "border-yellow-200 bg-yellow-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">{review.authorName}</span>
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={s <= review.rating ? "" : "text-gray-300"}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Предложение: <span className="font-medium">{review.offerTitle || "—"}</span>
                  </p>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {!review.isApproved && (
                    <button
                      onClick={() => handleApprove(review.id, true)}
                      className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                    >
                      ✓ Одобрить
                    </button>
                  )}
                  {review.isApproved && (
                    <button
                      onClick={() => handleApprove(review.id, false)}
                      className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200"
                    >
                      Скрыть
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
