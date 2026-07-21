"use client";

import { useState, useEffect } from "react";
import OfferCard from "@/components/OfferCard";
import type { Offer } from "@/db/schema";
import Link from "next/link";

export default function FavoritesPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      const ids = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavoriteIds(ids);

      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/offers");
        const allOffers = await res.json();
        const favoriteOffers = allOffers.filter((o: Offer) => ids.includes(o.id));
        setOffers(favoriteOffers);
      } catch {
        setOffers([]);
      }
      setLoading(false);
    };

    loadFavorites();

    // Listen for updates
    const handleUpdate = () => loadFavorites();
    window.addEventListener("favoritesUpdated", handleUpdate);
    return () => window.removeEventListener("favoritesUpdated", handleUpdate);
  }, []);

  const clearAll = () => {
    localStorage.setItem("favorites", "[]");
    setFavoriteIds([]);
    setOffers([]);
    window.dispatchEvent(new CustomEvent("favoritesUpdated"));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Избранное</h1>
          <p className="text-gray-600">
            {favoriteIds.length > 0
              ? `Сохранено предложений: ${favoriteIds.length}`
              : "Сохраняйте понравившиеся предложения"}
          </p>
        </div>
        {favoriteIds.length > 0 && (
          <button
            onClick={clearAll}
            className="text-gray-500 hover:text-red-500 text-sm transition-colors"
          >
            Очистить все
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Загрузка...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-4xl mb-4">💝</p>
          <p className="text-gray-500 text-lg mb-2">В избранном пока пусто</p>
          <p className="text-gray-400 text-sm mb-6">
            Нажмите на сердечко в карточке предложения, чтобы сохранить его
          </p>
          <Link href="/zajmy" className="btn-primary inline-block">
            Смотреть предложения
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-8 bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
        <p>
          💡 Избранное сохраняется в вашем браузере. При очистке данных браузера список будет удалён.
        </p>
      </div>
    </div>
  );
}
