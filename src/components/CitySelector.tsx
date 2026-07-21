"use client";

import { useState } from "react";
import { useGeo } from "./GeoProvider";
import { cities, getCityPrepositional, getCityPreposition } from "@/lib/cities";

export default function CitySelector() {
  const { geo, setCity } = useGeo();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search
    ? cities.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : cities;

  const handleSelect = (name: string, region: string) => {
    setCity(name, region);
    setOpen(false);
    setSearch("");
  };

  if (geo.loading) {
    return (
      <span className="text-xs text-gray-400 animate-pulse">📍 ...</span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors"
      >
        <span>📍</span>
        <span className="underline decoration-dotted">{geo.city || "Выбрать город"}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 bg-white shadow-xl rounded-xl border border-gray-200 w-64 z-50">
            <div className="p-3 border-b">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск города..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>
            <div className="max-h-64 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-4 text-sm">Не найдено</p>
              ) : (
                filtered.map((city) => (
                  <button
                    key={city.slug}
                    onClick={() => handleSelect(city.name, city.region)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      geo.city === city.name
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {city.name}
                    <span className="text-xs text-gray-400 ml-1">{city.region}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
