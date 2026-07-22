import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { normalizeMediaUrl } from "@/lib/utils";
import { autoLinkText } from "@/lib/autolinks";
import { getPublishedArticleBySlug } from "@/lib/cached-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return { title: "Статья не найдена" };
  }

  return {
    title: article.metaTitle || article.title + " | Космозайм",
    description: article.metaDescription || article.excerpt || "",
    openGraph: {
      title: article.title,
      description: article.excerpt || "",
      type: "article",
      publishedTime: article.createdAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: normalizeMediaUrl(article.coverImage) ? [normalizeMediaUrl(article.coverImage)] : [],
    },
  };
}

export const revalidate = 600;

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const a = await getPublishedArticleBySlug(slug);

  if (!a) {
    notFound();
  }

  const coverImage = normalizeMediaUrl(a.coverImage);

  // Разбиваем контент на параграфы для лучшего отображения
  const paragraphs = a.content.split("\n\n").filter(Boolean);

  return (
    <>
      <JsonLd type="article" article={a} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: "Главная", url: "/" },
            { name: "Статьи", url: "/articles" },
            { name: a.title, url: `/articles/${a.slug}` },
          ]}
        />

        {coverImage && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={coverImage}
              alt={a.title}
              className="w-full h-64 sm:h-80 object-cover"
            />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{a.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <time dateTime={a.createdAt.toISOString()}>
                📅{" "}
                {new Date(a.createdAt).toLocaleDateString("ru-RU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {a.updatedAt > a.createdAt && (
                <span>
                  (обновлено{" "}
                  {new Date(a.updatedAt).toLocaleDateString("ru-RU")})
                </span>
              )}
            </div>
          </header>

          {/* Содержание статьи с автоперелинковкой */}
          <div className="prose prose-lg max-w-none text-gray-700">
            {paragraphs.map((paragraph, index) => {
              const isHeading =
                paragraph.length < 100 &&
                !paragraph.includes(".") &&
                paragraph === paragraph.trim();

              if (isHeading && index > 0) {
                return (
                  <h2
                    key={index}
                    className="text-xl font-bold text-gray-900 mt-8 mb-4"
                  >
                    {paragraph}
                  </h2>
                );
              }

              if (paragraph.includes("\n-") || paragraph.includes("\n•")) {
                const lines = paragraph.split("\n");
                return (
                  <ul key={index} className="list-disc pl-5 space-y-2 my-4">
                    {lines.map((line, i) => {
                      const text = line.replace(/^[-•]\s*/, "").trim();
                      if (!text) return null;
                      return (
                        <li key={i} className="text-gray-700">
                          {autoLinkText(text)}
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              if (/^\d+\.\s/.test(paragraph) || paragraph.includes("\n1.")) {
                const lines = paragraph.split("\n");
                return (
                  <ol key={index} className="list-decimal pl-5 space-y-2 my-4">
                    {lines.map((line, i) => {
                      const text = line.replace(/^\d+\.\s*/, "").trim();
                      if (!text) return null;
                      return (
                        <li key={i} className="text-gray-700">
                          {autoLinkText(text)}
                        </li>
                      );
                    })}
                  </ol>
                );
              }

              return (
                <p key={index} className="my-4 leading-relaxed">
                  {autoLinkText(paragraph)}
                </p>
              );
            })}
          </div>

          {/* CTA блок */}
          <div className="mt-10 p-6 bg-gradient-to-r from-primary to-purple-600 rounded-xl text-white text-center">
            <h3 className="text-xl font-bold mb-2">
              Подберите лучшее предложение
            </h3>
            <p className="text-blue-100 mb-4">
              Воспользуйтесь нашим калькулятором для сравнения условий
            </p>
            <Link
              href="/calculator"
              className="inline-block bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Открыть калькулятор
            </Link>
          </div>
        </div>

        {/* Навигация */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/articles"
            className="text-primary hover:underline font-medium flex items-center gap-2"
          >
            ← Все статьи
          </Link>
          <Link
            href="/zajmy"
            className="text-gray-500 hover:text-primary transition-colors text-sm"
          >
            Смотреть займы →
          </Link>
        </div>
      </article>
    </>
  );
}
