import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kosmozaim.ru";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/api/click/*",
          "/search",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
