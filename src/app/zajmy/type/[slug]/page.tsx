import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { loanTypes, getLoanTypeBySlug } from "@/lib/loanTypes";
import TypeOffersClient from "./TypeOffersClient";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const loanType = getLoanTypeBySlug(slug);

  if (!loanType) {
    return { title: "Страница не найдена" };
  }

  return {
    title: `${loanType.title} на карту онлайн | Космозайм`,
    description: loanType.metaDescription,
    keywords: loanType.keywords.join(", "),
  };
}

export const dynamic = "force-dynamic";

export default async function LoanTypePage({ params }: PageProps) {
  const { slug } = await params;
  const loanType = getLoanTypeBySlug(slug);

  if (!loanType) {
    notFound();
  }

  const otherTypes = loanTypes.filter((t) => t.slug !== slug).slice(0, 6);
  const paragraphs = loanType.content.split("\n\n").filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { name: "Главная", url: "/" },
          { name: "Займы", url: "/zajmy" },
          { name: loanType.title, url: `/zajmy/type/${slug}` },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{loanType.h1}</h1>
        <p className="text-gray-600 text-lg">{loanType.description}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {loanType.features.map((feature, index) => (
          <div key={index} className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <span className="text-2xl">{feature.icon}</span>
            <p className="font-semibold mt-2">{feature.title}</p>
            <p className="text-xs text-gray-500">{feature.text}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Лучшие предложения: {loanType.title.toLowerCase()}
      </h2>

      <TypeOffersClient filterParams={loanType.filterParams} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="prose prose-sm text-gray-600 max-w-none">
          {paragraphs.map((para, index) => {
            if (para.endsWith(":")) {
              return (
                <h3 key={index} className="text-lg font-bold text-gray-900 mt-4 mb-2">
                  {para.replace(":", "")}
                </h3>
              );
            }
            if (para.includes("\n-")) {
              const lines = para.split("\n");
              return (
                <div key={index}>
                  {lines[0] && <p className="font-medium">{lines[0]}</p>}
                  <ul className="list-disc pl-5">
                    {lines.slice(1).filter((l) => l.startsWith("-")).map((l, i) => (
                      <li key={i}>{l.replace(/^-\s*/, "")}</li>
                    ))}
                  </ul>
                </div>
              );
            }
            if (/^\d+\./.test(para)) {
              return (
                <ol key={index} className="list-decimal pl-5">
                  {para.split("\n").map((l, i) => (
                    <li key={i}>{l.replace(/^\d+\.\s*/,>
                  ))}
                </ol>
              );
            }
            return <p key={index}>{para}</p>;
          })}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Другие виды займов</h2>
        <div className="flex flex-wrap gap-2">
          {otherTypes.map((type) => (
            <Link
              key={type.slug}
              href={`/zajmy/type/${type.slug}`}
              className="inline-block bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:border-primary hover:text-primary transition-colors"
            >
              {type.title}
            </Link>
          ))}
          <Link
            href="/zajmy"
            className="inline-block bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-dark transition-colors"
          >
            Все займы →
          </Link>
        </div>
      </div>
    </div>
  );
}
