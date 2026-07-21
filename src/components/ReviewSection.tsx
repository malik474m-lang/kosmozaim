"use client";

import { useState, useEffect } from "react";
import type { Review } from "@/db/schema";

interface ReviewSectionProps {
  offerId: number;
  offerTitle: string;
}

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          disabled={!onChange}
          className={`text-xl transition-colors ${
            star <= (hover || rating)
              ? "text-yellow-400"
              : "text-gray-300"
          } ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ offerId, offerTitle }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ authorName: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetch(`/api/reviews?offerId=${offerId}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [offerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId, ...form }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Отзыв отправлен на модерацию!" });
        setForm({ authorName: "", rating: 5, comment: "" });
        setShowForm(false);
      } else {
        setMessage({ type: "error", text: data.error || "Ошибка" });
      }
    } catch {
      setMessage({ type: "error", text: "Ошибка соединения" });
    }
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Отзывы о {offerTitle}</h3>
          {avgRating && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Math.round(parseFloat(avgRating))} />
              <span className="text-sm text-gray-500">
                {avgRating} из 5 ({reviews.length} отзывов)
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm"
        >
          {showForm ? "Отмена" : "Оставить отзыв"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ваше имя</label>
              <input
                className="input-field"
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                required
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Оценка</label>
              <StarRating rating={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ваш отзыв</label>
              <textarea
                className="input-field"
                rows={4}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                required
                maxLength={2000}
                placeholder="Расскажите о вашем опыте..."
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-accent disabled:opacity-50">
              {submitting ? "Отправка..." : "Отправить отзыв"}
            </button>
          </div>
        </form>
      )}

      {message.text && (
        <div
          className={`mb-4 px-4 py-2 rounded-lg text-sm ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <p className="text-gray-500 text-center py-4">Загрузка отзывов...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          Пока нет отзывов. Будьте первым!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{review.authorName}</span>
                  <StarRating rating={review.rating} />
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
