import Link from "next/link";
import SubscribeForm from "./SubscribeForm";
import { cities, getCityPreposition, getCityPrepositional } from "@/lib/cities";

// Топ-10 городов для футера
const topCities = cities.slice(0, 10);

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🚀</span>
              <span className="text-xl font-bold text-white">Космозайм</span>
            </Link>
            <p className="text-sm text-gray-400">
              Сервис подбора финансовых предложений. Сравнивайте условия и выбирайте лучшие займы,
              кредиты и банковские карты.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Продукты</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/zajmy" className="hover:text-white transition-colors text-sm">
                  Займы онлайн
                </Link>
              </li>
              <li>
                <Link href="/kredity" className="hover:text-white transition-colors text-sm">
                  Кредиты
                </Link>
              </li>
              <li>
                <Link href="/karty/kreditnye" className="hover:text-white transition-colors text-sm">
                  Кредитные карты
                </Link>
              </li>
              <li>
                <Link href="/karty/debetovye" className="hover:text-white transition-colors text-sm">
                  Дебетовые карты
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Инструменты</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/calculator" className="hover:text-white transition-colors text-sm">
                  Калькулятор займа
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors text-sm">
                  Сравнение предложений
                </Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-white transition-colors text-sm">
                  Полезные статьи
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors text-sm">
                  Частые вопросы
                </Link>
              </li>
              <li>
                <Link href="/glossary" className="hover:text-white transition-colors text-sm">
                  Глоссарий терминов
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Информация</h3>
            <p className="text-sm text-gray-400">
              Информация на сайте носит информационный характер и не является публичной офертой.
              Все условия уточняйте на сайтах партнёров.
            </p>
            <SubscribeForm />
          </div>
        </div>

        {/* Города для SEO перелинковки */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <p className="text-sm text-gray-400 mb-3">Займы по городам:</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {topCities.map((city) => (
              <Link
                key={city.slug}
                href={`/zajmy/${city.slug}`}
                className="text-gray-500 hover:text-white transition-colors"
              >
                {getCityPreposition(city.name)} {getCityPrepositional(city.name)}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Космозайм. Все права защищены.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Конфиденциальность
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Соглашение
            </Link>
            <Link href="/disclaimer" className="hover:text-white transition-colors">
              Отказ от ответственности
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
