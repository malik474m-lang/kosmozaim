"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CitySelector from "./CitySelector";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Космозайм
              </span>
            </Link>
            <CitySelector />
          </div>

          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              href="/zajmy"
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Займы
            </Link>
            <Link
              href="/kredity"
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Кредиты
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-primary font-medium transition-colors flex items-center">
                Банковские карты
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-lg py-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link
                  href="/karty/kreditnye"
                  className="block px-4 py-2 text-gray-700 hover:bg-primary-light hover:text-primary"
                >
                  Кредитные карты
                </Link>
                <Link
                  href="/karty/debetovye"
                  className="block px-4 py-2 text-gray-700 hover:bg-primary-light hover:text-primary"
                >
                  Дебетовые карты
                </Link>
              </div>
            </div>
            <Link
              href="/compare"
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Сравнение
            </Link>
            <Link
              href="/calculator"
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Калькулятор
            </Link>
            <Link
              href="/articles"
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Статьи
            </Link>
            <Link
              href="/faq"
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/favorites"
              className="text-gray-700 hover:text-primary font-medium transition-colors"
              title="Избранное"
            >
              ❤️
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-500 hover:text-primary transition-colors"
              aria-label="Поиск"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Меню"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="pb-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск предложений..."
                className="flex-1 input-field"
                autoFocus
              />
              <button type="submit" className="btn-primary">
                Найти
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="lg:hidden pb-4 space-y-2">
            <Link href="/zajmy" className="block py-2 text-gray-700 hover:text-primary font-medium" onClick={() => setMenuOpen(false)}>
              Займы
            </Link>
            <Link href="/kredity" className="block py-2 text-gray-700 hover:text-primary font-medium" onClick={() => setMenuOpen(false)}>
              Кредиты
            </Link>
            <Link href="/karty/kreditnye" className="block py-2 text-gray-700 hover:text-primary font-medium" onClick={() => setMenuOpen(false)}>
              Кредитные карты
            </Link>
            <Link href="/karty/debetovye" className="block py-2 text-gray-700 hover:text-primary font-medium" onClick={() => setMenuOpen(false)}>
              Дебетовые карты
            </Link>
            <Link href="/compare" className="block py-2 text-gray-700 hover:text-primary font-medium" onClick={() => setMenuOpen(false)}>
              Сравнение
            </Link>
            <Link href="/calculator" className="block py-2 text-gray-700 hover:text-primary font-medium" onClick={() => setMenuOpen(false)}>
              Калькулятор
            </Link>
            <Link href="/articles" className="block py-2 text-gray-700 hover:text-primary font-medium" onClick={() => setMenuOpen(false)}>
              Статьи
            </Link>
            <Link href="/faq" className="block py-2 text-gray-700 hover:text-primary font-medium" onClick={() => setMenuOpen(false)}>
              FAQ
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
