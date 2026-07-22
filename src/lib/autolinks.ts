import type { ReactNode } from "react";
import { createElement } from "react";

// Карта ключевых фраз → URL страниц сайта
// Фразы отсортированы от длинных к коротким, чтобы сначала матчились более точные
const linkMap: { phrase: string; url: string; title: string }[] = [
  // Типы займов
  { phrase: "займ без отказа", url: "/zajmy/type/bez-otkaza", title: "Займы без отказа" },
  { phrase: "займы без отказа", url: "/zajmy/type/bez-otkaza", title: "Займы без отказа" },
  { phrase: "плохая кредитная история", url: "/zajmy/type/s-plohoj-kreditnoj-istoriej", title: "Займы с плохой КИ" },
  { phrase: "плохой кредитной историей", url: "/zajmy/type/s-plohoj-kreditnoj-istoriej", title: "Займы с плохой КИ" },
  { phrase: "испорченная кредитная история", url: "/zajmy/type/s-plohoj-kreditnoj-istoriej", title: "Займы с плохой КИ" },
  { phrase: "займ без процентов", url: "/zajmy/type/bez-procentov", title: "Займы без процентов" },
  { phrase: "займы без процентов", url: "/zajmy/type/bez-procentov", title: "Займы без процентов" },
  { phrase: "первый займ под 0%", url: "/zajmy/type/bez-procentov", title: "Займы без процентов" },
  { phrase: "первый займ бесплатно", url: "/zajmy/type/bez-procentov", title: "Займы без процентов" },
  { phrase: "займ на киви", url: "/zajmy/type/na-kivi", title: "Займы на QIWI" },
  { phrase: "займ на qiwi", url: "/zajmy/type/na-kivi", title: "Займы на QIWI" },
  { phrase: "займы пенсионерам", url: "/zajmy/type/pensioneram", title: "Займы пенсионерам" },
  { phrase: "займ пенсионеру", url: "/zajmy/type/pensioneram", title: "Займы пенсионерам" },
  { phrase: "займы для пенсионеров", url: "/zajmy/type/pensioneram", title: "Займы пенсионерам" },
  { phrase: "займы без звонков", url: "/zajmy/type/bez-zvonkov", title: "Займы без звонков" },
  { phrase: "займ без звонка", url: "/zajmy/type/bez-zvonkov", title: "Займы без звонков" },
  { phrase: "займы студентам", url: "/zajmy/type/studentam", title: "Займы студентам" },
  { phrase: "займ студенту", url: "/zajmy/type/studentam", title: "Займы студентам" },
  { phrase: "займ на длительный срок", url: "/zajmy/type/na-dlitelnyj-srok", title: "Займы на длительный срок" },
  { phrase: "долгосрочный займ", url: "/zajmy/type/na-dlitelnyj-srok", title: "Займы на длительный срок" },

  // Категории
  { phrase: "микрозайм онлайн", url: "/zajmy", title: "Займы онлайн" },
  { phrase: "микрозаймы онлайн", url: "/zajmy", title: "Займы онлайн" },
  { phrase: "займ онлайн", url: "/zajmy", title: "Займы онлайн" },
  { phrase: "займы онлайн", url: "/zajmy", title: "Займы онлайн" },
  { phrase: "займ на карту", url: "/zajmy", title: "Займы на карту" },
  { phrase: "займы на карту", url: "/zajmy", title: "Займы на карту" },
  { phrase: "потребительский кредит", url: "/kredity", title: "Кредиты" },
  { phrase: "банковский кредит", url: "/kredity", title: "Кредиты" },
  { phrase: "кредит наличными", url: "/kredity", title: "Кредиты" },
  { phrase: "кредит онлайн", url: "/kredity", title: "Кредиты" },
  { phrase: "кредитная карта", url: "/karty/kreditnye", title: "Кредитные карты" },
  { phrase: "кредитные карты", url: "/karty/kreditnye", title: "Кредитные карты" },
  { phrase: "дебетовая карта", url: "/karty/debetovye", title: "Дебетовые карты" },
  { phrase: "дебетовые карты", url: "/karty/debetovye", title: "Дебетовые карты" },

  // Инструменты
  { phrase: "калькулятор займа", url: "/calculator", title: "Калькулятор займа" },
  { phrase: "калькулятор кредита", url: "/calculator", title: "Калькулятор" },
  { phrase: "сравнить предложения", url: "/compare", title: "Сравнение предложений" },
  { phrase: "сравнение предложений", url: "/compare", title: "Сравнение предложений" },

  // Глоссарий
  { phrase: "полная стоимость кредита", url: "/glossary/psk", title: "Что такое ПСК" },
  { phrase: "ПСК", url: "/glossary/psk", title: "Что такое ПСК" },
  { phrase: "грейс-период", url: "/glossary/grejs-period", title: "Что такое грейс-период" },
  { phrase: "льготный период", url: "/glossary/grejs-period", title: "Что такое грейс-период" },
  { phrase: "кредитная история", url: "/glossary/kreditnaya-istoriya", title: "Кредитная история" },
  { phrase: "кредитную историю", url: "/glossary/kreditnaya-istoriya", title: "Кредитная история" },
  { phrase: "кредитной истории", url: "/glossary/kreditnaya-istoriya", title: "Кредитная история" },
  { phrase: "микрофинансовая организация", url: "/glossary/mfo", title: "Что такое МФО" },
  { phrase: "МФО", url: "/glossary/mfo", title: "Что такое МФО" },
  { phrase: "скоринг", url: "/glossary/skoring", title: "Что такое скоринг" },
  { phrase: "рефинансирование", url: "/glossary/refinansirovanie", title: "Рефинансирование" },
  { phrase: "кэшбек", url: "/glossary/keshbek", title: "Что такое кэшбек" },
  { phrase: "кешбэк", url: "/glossary/keshbek", title: "Что такое кэшбек" },
  { phrase: "аннуитетный платёж", url: "/glossary/annuitetnyj-platezh", title: "Аннуитетный платёж" },
  { phrase: "досрочное погашение", url: "/glossary/dosrochnoe-pogashenie", title: "Досрочное погашение" },
  { phrase: "кредитный лимит", url: "/glossary/kreditnyj-limit", title: "Кредитный лимит" },
  { phrase: "просрочка по кредиту", url: "/glossary/prosrochka-po-kreditu", title: "Просрочка по кредиту" },
  { phrase: "БКИ", url: "/glossary/bki", title: "Что такое БКИ" },
  { phrase: "бюро кредитных историй", url: "/glossary/bki", title: "Что такое БКИ" },
];

// Максимальное количество ссылок на одной странице (чтобы не переспамить)
const MAX_LINKS_PER_PAGE = 8;

// Автоподстановка ссылок в текст
// Возвращает массив React-элементов (строки + <a>)
export function autoLinkText(text: string): ReactNode[] {
  // Создаём регулярку из всех фраз (от длинных к коротким)
  const sortedPhrases = [...linkMap].sort((a, b) => b.phrase.length - a.phrase.length);

  // Отслеживаем какие URL уже использовали (не ставить одну ссылку дважды)
  const usedUrls = new Set<string>();
  let linkCount = 0;

  // Строим объединённую регулярку
  const escapedPhrases = sortedPhrases.map((p) =>
    p.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const regex = new RegExp(`(${escapedPhrases.join("|")})`, "gi");

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchedText = match[0];
    const matchIndex = match.index;

    // Находим соответствующую запись в linkMap (регистронезависимо)
    const entry = sortedPhrases.find(
      (p) => p.phrase.toLowerCase() === matchedText.toLowerCase()
    );

    if (!entry || usedUrls.has(entry.url) || linkCount >= MAX_LINKS_PER_PAGE) {
      // Пропускаем — уже была такая ссылка или лимит достигнут
      continue;
    }

    // Добавляем текст до совпадения
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }

    // Добавляем ссылку
    parts.push(
      createElement(
        "a",
        {
          key: `autolink-${matchIndex}`,
          href: entry.url,
          className: "text-primary hover:underline font-medium",
          title: entry.title,
        },
        matchedText
      )
    );

    usedUrls.add(entry.url);
    linkCount++;
    lastIndex = matchIndex + matchedText.length;
  }

  // Добавляем оставшийся текст
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // Если совпадений не было — возвращаем исходный текст
  if (parts.length === 0) {
    return [text];
  }

  return parts;
}
