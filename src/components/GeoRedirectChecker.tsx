"use client";

import { useEffect, useState } from "react";

export default function GeoRedirectChecker() {
  const [showBanner, setShowBanner] = useState(false);
  const [redirectInfo, setRedirectInfo] = useState<{
    url: string;
    countryName: string;
  } | null>(null);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("geo_redirect_dismissed");
    if (dismissed) return;

    fetch("/api/geo-redirect")
      .then((res) => res.json())
      .then((data) => {
        if (data.redirect) {
          setRedirectInfo({
            url: data.redirect,
            countryName: data.countryName || data.country,
          });
          setShowBanner(true);
        }
      })
      .catch((err) => {
        console.error("Geo redirect check error:", err);
      });
  }, []);

  const handleRedirect = () => {
    if (redirectInfo) {
      window.location.href = redirectInfo.url;
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("geo_redirect_dismissed", "true");
    setShowBanner(false);
  };

  if (!showBanner || !redirectInfo) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg z-50 animate-slide-up">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌍</span>
          <div>
            <p className="font-semibold">
              Мы определили, что вы из {redirectInfo.countryName}
            </p>
            <p className="text-sm text-blue-100">
              У нас есть специальная версия сайта для вашего региона
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRedirect}
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Перейти →
          </button>
          <button
            onClick={handleDismiss}
            className="text-blue-100 hover:text-white transition-colors text-sm underline"
          >
            Остаться здесь
          </button>
        </div>
      </div>
    </div>
  );
}
