"use client";

import { useState, useEffect } from "react";

interface FavoriteButtonProps {
  offerId: number;
  size?: "sm" | "md";
}

export default function FavoriteButton({ offerId, size = "md" }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(offerId));
  }, [offerId]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    let newFavorites: number[];

    if (favorites.includes(offerId)) {
      newFavorites = favorites.filter((id: number) => id !== offerId);
    } else {
      newFavorites = [...favorites, offerId];
    }

    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent("favoritesUpdated"));
  };

  const sizeClasses = size === "sm" ? "w-8 h-8 text-lg" : "w-10 h-10 text-xl";

  return (
    <button
      onClick={toggleFavorite}
      className={`${sizeClasses} flex items-center justify-center rounded-full transition-all ${
        isFavorite
          ? "bg-red-100 text-red-500 hover:bg-red-200"
          : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400"
      }`}
      title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
      aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
    >
      {isFavorite ? "❤️" : "🤍"}
    </button>
  );
}
