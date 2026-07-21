import { glossaryTerms, getTermBySlug } from "@/lib/glossary";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return glossaryTerms.map((term) => ({ slug: term.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const term = getTermBySlug(slug);

  if (!term) {
    return { title: "Термин не найден" };
  }

  return {
    title: `${term.term} — что это такое простыми словами | Космозайм`,
    description: term.shortDefinition,
    keywords: `${term.term}, что такое ${term.term.toLowerCase()}, ${term.term.toLowerCase()} простыми словами`,
  };
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const { slug } = await params;
  const term = getTermBySlug(slug);

  if (!term) {
    notFound();
  }

  // Находим связанные термины
  const relatedTerms = term.relatedTerms
    ?.map((name) => glossaryTerms.find((t) => t.term.toLowerCase().includes(name.toLowerCase())))
    .filter(Boolean)
    .slice(0, 4);

  // Другие термины из той же категории
  const categoryTerms = glossaryTerms
    .filter((t) => t.category === term.category && t.slug !== term.slug)
    .slice(0, 5);

  const paragraphs = term.fullDefinition.split("\n\n").filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { name: "Главная", url: "/" },
          { name: "Глоссарий", url: "/glossary" },
          { name: term.term, url: `/glossary/${term.slug}` },
        ]}
      />

      <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            {term.term}
          </h1>
          <p className="text-lg text-gray-600 bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
            {term.shortDefinition}
          </p>
        </header>

        <div className="prose prose-lg max-w-none text-gray-700">
          {paragraphs.map((para, index) => {
            // Заголовки
            if (para.endsWith(":") && para.length < 60) {
              return (
                <h2 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">
                  {para.replace(":", "")}
                </h2>
              );
            }
            // Списки
            if (para.includes("\n-")) {
              const lines = para.split("\n");
              const title = lines[0];
              const items = lines.slice(1).filter((l) => l.startsWith("-"));
              return (
                <div key={index}>
                  {title && <p className="font-medium text-gray-900">{title}</p>}
                  <ul className="list-disc pl-5 space-y-1">
                    {items.map((item, i) => (
                      <li key={i}>{item.replace(/^-\s*/, "")}</li>
                    ))}
                  </ul>
                </div>
              );
            }
            // Нумерованные списки
            if (/^\d+\./.test(para) || para.includes("\n1.")) {
              const lines = para.split("\n").filter(Boolean);
              return (
                <ol key={index} className="list-decimal pl-5 space-y-1">
                  {lines.map((line, i) => (
                    <li key={i}>{line.replace(/^\d+\.\s*/, "")}</li>
                  ))}
                </ol>
              );
            }
            // Обычный параграф
            return <p key={index} className="my-3 leading-relaxed">{para}</p>;
          })}
        </div>

        {/* Связанные термины */}
        {relatedTerms && relatedTerms.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h2 className="font-bold text-gray-900 mb-3">Связанные термины</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTerms.map((t) => t && (
                <Link
                  key={t.slug}
                  href={`/glossary/${t.slug}`}
                  className="inline-block bg-gray-100 hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  {t.term}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* CTA */}
      <div className="mt-8 bg-gradient-to-r from-primary to-purple-600 rounded-xl p-6 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Подберите выгодное предложение</h2>
        <p className="text-blue-100 mb-4">
          Сравните условия займов и кредитов на нашем сайте
        </p>
        <Link
          href="/zajmy"
          className="inline-block bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Смотреть предложения →
        </Link>
      </div>

      {/* Другие термины */}
      {categoryTerms.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Другие термины</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {categoryTerms.map((t) => (
              <Link
                key={t.slug}
                href={`/glossary/${t.slug}`}
                className="bg-white rounded-lg border border-gray-100 p-4 hover:border-primary transition-colors"
              >
                <h3 className="font-semibold text-gray-900 text-sm">{t.term}</h3>
                <p className="text-xs text-gray-500 line-clamp-1 mt-1">{t.shortDefinition}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/glossary" className="text-primary hover:underline font-medium">
          ← Все термины глоссария
        </Link>
      </div>
    </div>
  );
}
