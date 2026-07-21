import Link from "next/link";
import { glossaryTerms } from "@/lib/glossary";
import Breadcrumbs from "@/components/Breadcrumbs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Глоссарий финансовых терминов — Словарь Космозайм",
  description:
    "Словарь финансовых терминов: ПСК, грейс-период, скоринг, кредитная история и другие понятия простым языком.",
  keywords: "финансовый словарь, что такое ПСК, глоссарий кредитных терминов, финансовая грамотность",
};

export default function GlossaryPage() {
  // Сортируем по алфавиту
  const sortedTerms = [...glossaryTerms].sort((a, b) => a.term.localeCompare(b.term, "ru"));

  // Группируем по первой букве
  const grouped = sortedTerms.reduce((acc, term) => {
    const letter = term.term[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {} as Record<string, typeof glossaryTerms>);

  const letters = Object.keys(grouped).sort((a, b) => a.localeCompare(b, "ru"));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { name: "Главная", url: "/" },
          { name: "Глоссарий", url: "/glossary" },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Глоссарий финансовых терминов
        </h1>
        <p className="text-gray-600 text-lg">
          Словарь основных понятий из мира кредитов, займов и банковских карт. 
          Объясняем сложные термины простым языком.
        </p>
      </div>

      {/* Навигация по буквам */}
      <div className="flex flex-wrap gap-2 mb-8 p-4 bg-white rounded-xl border border-gray-100">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-primary hover:text-white rounded font-semibold transition-colors"
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Список терминов */}
      <div className="space-y-8">
        {letters.map((letter) => (
          <div key={letter} id={`letter-${letter}`}>
            <h2 className="text-2xl font-bold text-primary mb-4 sticky top-16 bg-gray-50 py-2">
              {letter}
            </h2>
            <div className="grid gap-3">
              {grouped[letter].map((term) => (
                <Link
                  key={term.slug}
                  href={`/glossary/${term.slug}`}
                  className="bg-white rounded-xl border border-gray-100 p-4 hover:border-primary hover:shadow-sm transition-all block"
                >
                  <h3 className="font-bold text-gray-900 mb-1">{term.term}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{term.shortDefinition}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SEO текст */}
      <div className="mt-12 bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Зачем нужен финансовый словарь?
        </h2>
        <div className="prose prose-sm text-gray-600">
          <p>
            Понимание финансовых терминов — первый шаг к грамотному управлению деньгами. 
            В нашем глоссарии мы собрали основные понятия, которые встречаются при оформлении 
            займов, кредитов и банковских карт.
          </p>
          <p>
            Зная, что такое ПСК, грейс-период или скоринг, вы сможете лучше понимать условия 
            финансовых продуктов и выбирать действительно выгодные предложения.
          </p>
        </div>
      </div>
    </div>
  );
}
