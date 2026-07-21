import type { Offer, Article } from "@/db/schema";
import { normalizeMediaUrl } from "@/lib/utils";

interface OrganizationSchemaProps {
  type: "organization";
}

interface WebsiteSchemaProps {
  type: "website";
}

interface OfferSchemaProps {
  type: "offer";
  offer: Offer;
}

interface ArticleSchemaProps {
  type: "article";
  article: Article;
}

interface FAQSchemaProps {
  type: "faq";
  questions: { question: string; answer: string }[];
}

interface BreadcrumbSchemaProps {
  type: "breadcrumb";
  items: { name: string; url: string }[];
}

type JsonLdProps =
  | OrganizationSchemaProps
  | WebsiteSchemaProps
  | OfferSchemaProps
  | ArticleSchemaProps
  | FAQSchemaProps
  | BreadcrumbSchemaProps;

export default function JsonLd(props: JsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kosmozaim.ru";

  let schema: object;

  switch (props.type) {
    case "organization":
      schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Космозайм",
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: "Сервис подбора займов, кредитов и банковских карт",
        sameAs: [],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: "Russian",
        },
      };
      break;

    case "website":
      schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Космозайм",
        url: baseUrl,
        description: "Подбор займов, кредитов и банковских карт онлайн",
        potentialAction: {
          "@type": "SearchAction",
          target: `${baseUrl}/zajmy?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      };
      break;

    case "offer":
      schema = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        name: props.offer.title,
        description: props.offer.description || `Финансовое предложение от ${props.offer.title}`,
        provider: {
          "@type": "FinancialService",
          name: props.offer.title,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "RUB",
          price: "0",
          availability: "https://schema.org/InStock",
        },
        interestRate: {
          "@type": "QuantitativeValue",
          value: props.offer.rate,
          unitText: "percent per day",
        },
        amount: {
          "@type": "MonetaryAmount",
          minValue: props.offer.amountMin,
          maxValue: props.offer.amountMax,
          currency: "RUB",
        },
      };
      break;

    case "article":
      schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: props.article.title,
        description: props.article.excerpt || props.article.metaDescription || "",
        image: normalizeMediaUrl(props.article.coverImage) || `${baseUrl}/og-image.png`,
        datePublished: props.article.createdAt,
        dateModified: props.article.updatedAt,
        author: {
          "@type": "Organization",
          name: "Космозайм",
        },
        publisher: {
          "@type": "Organization",
          name: "Космозайм",
          logo: {
            "@type": "ImageObject",
            url: `${baseUrl}/logo.png`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${baseUrl}/articles/${props.article.slug}`,
        },
      };
      break;

    case "faq":
      schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: props.questions.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer,
          },
        })),
      };
      break;

    case "breadcrumb":
      schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: props.items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
        })),
      };
      break;

    default:
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
