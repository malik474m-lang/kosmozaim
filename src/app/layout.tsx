import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import GeoProvider from "@/components/GeoProvider";

export const metadata: Metadata = {
  title: "Космозайм — Подбор займов, кредитов и банковских карт онлайн",
  description:
    "Сравните лучшие предложения по займам, кредитам, кредитным и дебетовым картам. Удобный калькулятор, фильтры подбора и актуальные условия от проверенных партнёров.",
  keywords:
    "займы онлайн, кредиты, микрозаймы, кредитные карты, дебетовые карты, калькулятор займа, подбор кредита, космозайм",
  openGraph: {
    title: "Космозайм — Подбор займов, кредитов и банковских карт",
    description:
      "Сравните лучшие финансовые предложения. Калькулятор займа, фильтры подбора, актуальные условия.",
    type: "website",
    siteName: "Космозайм",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://kosmozaim.ru"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col">
        <GeoProvider>
          <Analytics />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </GeoProvider>
      </body>
    </html>
  );
}
