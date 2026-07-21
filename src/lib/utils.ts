export function slugify(text: string): string {
  const translitMap: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
    ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
    я: "ya",
  };

  return text
    .toLowerCase()
    .split("")
    .map((char) => translitMap[char] || char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDays(days: number): string {
  if (days <= 0) return "0 дней";
  if (days % 365 === 0) {
    const years = days / 365;
    if (years === 1) return "1 год";
    if (years < 5) return `${years} года`;
    return `${years} лет`;
  }
  if (days % 30 === 0) {
    const months = days / 30;
    if (months === 1) return "1 месяц";
    if (months < 5) return `${months} месяца`;
    return `${months} месяцев`;
  }
  if (days === 1) return "1 день";
  if (days < 5) return `${days} дня`;
  return `${days} дней`;
}

export const categoryLabels: Record<string, string> = {
  microloans: "Займы",
  credits: "Кредиты",
  credit_cards: "Кредитные карты",
  debit_cards: "Дебетовые карты",
};

export const borrowerLabels: Record<string, string> = {
  employed: "Работающий",
  unemployed: "Безработный",
  pensioner: "Пенсионер",
  student: "Студент",
  self_employed: "Самозанятый",
  any: "Любой",
};

// SEO ключевые слова по категориям
export const seoKeywordsByCategory: Record<string, string[]> = {
  microloans: [
    "займ онлайн",
    "займ на карту",
    "быстрый займ",
    "микрозайм",
    "деньги в долг",
    "займ без отказа",
    "срочный займ",
    "займ мгновенно",
    "деньги на карту",
    "онлайн заявка на займ",
    "первый займ без процентов",
    "займ 24 часа",
  ],
  credits: [
    "кредит онлайн",
    "потребительский кредит",
    "кредит наличными",
    "взять кредит",
    "кредит без справок",
    "низкая ставка по кредиту",
    "кредит в банке",
    "одобрение кредита",
    "заявка на кредит",
    "выгодный кредит",
  ],
  credit_cards: [
    "кредитная карта",
    "кредитка онлайн",
    "карта с лимитом",
    "льготный период",
    "кредитная карта без процентов",
    "карта рассрочки",
    "кредитная карта с кэшбеком",
    "оформить кредитную карту",
    "карта с грейс периодом",
  ],
  debit_cards: [
    "дебетовая карта",
    "карта с кэшбеком",
    "банковская карта",
    "карта бесплатно",
    "карта с процентом на остаток",
    "оформить карту онлайн",
    "дебетовая карта с доставкой",
    "карта для покупок",
  ],
};

// Генерация SEO-тегов для предложения
export function generateSeoTags(
  category: string,
  title: string,
  amountMax: number,
  freeTermDays: number
): string[] {
  const baseTags = seoKeywordsByCategory[category] || seoKeywordsByCategory["microloans"];
  const tags = baseTags.slice(0, 5); // Берём 5 базовых тегов
  
  // Добавляем специфичные теги
  if (amountMax >= 100000) {
    tags.push("крупный займ", "большая сумма");
  }
  if (amountMax <= 30000) {
    tags.push("небольшой займ", "до зарплаты");
  }
  if (freeTermDays > 0) {
    tags.push("без процентов", "0%", "первый займ бесплатно");
  }
  
  // Добавляем название
  tags.push(title.toLowerCase());
  
  return [...new Set(tags)].slice(0, 8); // Уникальные, максимум 8
}
