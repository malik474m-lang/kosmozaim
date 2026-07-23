"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminOffers from "./AdminOffers";
import AdminArticles from "./AdminArticles";
import AdminStats from "./AdminStats";
import AdminSubscribers from "./AdminSubscribers";
import AdminReviews from "./AdminReviews";
import AdminGeoRedirects from "./AdminGeoRedirects";

type Tab = "offers" | "articles" | "reviews" | "stats" | "subscribers" | "geo";

export default function AdminDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("offers");

  useEffect(() => {
    fetch("/api/admin/check")
      .then((res) => {
        if (!res.ok) {
          router.push("/admin/login");
        } else {
          setAuthenticated(true);
        }
      })
      .catch(() => router.push("/admin/login"))
      .finally(() => setChecking(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Проверка авторизации...</p>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚙️</span>
            <h1 className="text-lg font-bold">Админ-панель Космозайм</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-300 hover:text-white text-sm transition-colors"
          >
            Выйти →
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("offers")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === "offers"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📋 Предложения
            </button>
            <button
              onClick={() => setActiveTab("articles")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === "articles"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📰 Статьи
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === "reviews"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              ⭐ Отзывы
            </button>
            <button
              onClick={() => setActiveTab("geo")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === "geo"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              🌍 Гео-редиректы
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === "stats"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📊 Статистика
            </button>
            <button
              onClick={() => setActiveTab("subscribers")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === "subscribers"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📬 Подписчики
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "offers" && <AdminOffers />}
        {activeTab === "articles" && <AdminArticles />}
        {activeTab === "reviews" && <AdminReviews />}
        {activeTab === "geo" && <AdminGeoRedirects />}
        {activeTab === "stats" && <AdminStats />}
        {activeTab === "subscribers" && <AdminSubscribers />}
      </div>
    </div>
  );
}
