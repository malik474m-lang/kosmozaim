// Список крупных городов России для SEO
export interface City {
  name: string;
  slug: string;
  region: string;
  population: number; // для приоритета в sitemap
}

export const cities: City[] = [
  { name: "Москва", slug: "moskva", region: "Московская область", population: 12600000 },
  { name: "Санкт-Петербург", slug: "sankt-peterburg", region: "Ленинградская область", population: 5400000 },
  { name: "Новосибирск", slug: "novosibirsk", region: "Новосибирская область", population: 1620000 },
  { name: "Екатеринбург", slug: "ekaterinburg", region: "Свердловская область", population: 1490000 },
  { name: "Казань", slug: "kazan", region: "Республика Татарстан", population: 1260000 },
  { name: "Нижний Новгород", slug: "nizhnij-novgorod", region: "Нижегородская область", population: 1250000 },
  { name: "Челябинск", slug: "chelyabinsk", region: "Челябинская область", population: 1190000 },
  { name: "Самара", slug: "samara", region: "Самарская область", population: 1160000 },
  { name: "Омск", slug: "omsk", region: "Омская область", population: 1140000 },
  { name: "Ростов-на-Дону", slug: "rostov-na-donu", region: "Ростовская область", population: 1130000 },
  { name: "Уфа", slug: "ufa", region: "Республика Башкортостан", population: 1120000 },
  { name: "Красноярск", slug: "krasnoyarsk", region: "Красноярский край", population: 1090000 },
  { name: "Воронеж", slug: "voronezh", region: "Воронежская область", population: 1050000 },
  { name: "Пермь", slug: "perm", region: "Пермский край", population: 1050000 },
  { name: "Волгоград", slug: "volgograd", region: "Волгоградская область", population: 1010000 },
  { name: "Краснодар", slug: "krasnodar", region: "Краснодарский край", population: 930000 },
  { name: "Саратов", slug: "saratov", region: "Саратовская область", population: 830000 },
  { name: "Тюмень", slug: "tyumen", region: "Тюменская область", population: 810000 },
  { name: "Тольятти", slug: "tolyatti", region: "Самарская область", population: 700000 },
  { name: "Ижевск", slug: "izhevsk", region: "Удмуртская Республика", population: 650000 },
  { name: "Барнаул", slug: "barnaul", region: "Алтайский край", population: 630000 },
  { name: "Ульяновск", slug: "ulyanovsk", region: "Ульяновская область", population: 620000 },
  { name: "Иркутск", slug: "irkutsk", region: "Иркутская область", population: 620000 },
  { name: "Хабаровск", slug: "habarovsk", region: "Хабаровский край", population: 610000 },
  { name: "Ярославль", slug: "yaroslavl", region: "Ярославская область", population: 600000 },
  { name: "Владивосток", slug: "vladivostok", region: "Приморский край", population: 600000 },
  { name: "Махачкала", slug: "mahachkala", region: "Республика Дагестан", population: 600000 },
  { name: "Томск", slug: "tomsk", region: "Томская область", population: 570000 },
  { name: "Оренбург", slug: "orenburg", region: "Оренбургская область", population: 560000 },
  { name: "Кемерово", slug: "kemerovo", region: "Кемеровская область", population: 550000 },
  { name: "Новокузнецк", slug: "novokuznetsk", region: "Кемеровская область", population: 550000 },
  { name: "Рязань", slug: "ryazan", region: "Рязанская область", population: 530000 },
  { name: "Астрахань", slug: "astrahan", region: "Астраханская область", population: 520000 },
  { name: "Набережные Челны", slug: "naberezhnye-chelny", region: "Республика Татарстан", population: 530000 },
  { name: "Пенза", slug: "penza", region: "Пензенская область", population: 520000 },
  { name: "Киров", slug: "kirov", region: "Кировская область", population: 500000 },
  { name: "Липецк", slug: "lipetsk", region: "Липецкая область", population: 500000 },
  { name: "Калининград", slug: "kaliningrad", region: "Калининградская область", population: 490000 },
  { name: "Тула", slug: "tula", region: "Тульская область", population: 470000 },
  { name: "Чебоксары", slug: "cheboksary", region: "Чувашская Республика", population: 470000 },
  { name: "Сочи", slug: "sochi", region: "Краснодарский край", population: 440000 },
  { name: "Курск", slug: "kursk", region: "Курская область", population: 450000 },
  { name: "Ставрополь", slug: "stavropol", region: "Ставропольский край", population: 450000 },
  { name: "Улан-Удэ", slug: "ulan-ude", region: "Республика Бурятия", population: 440000 },
  { name: "Тверь", slug: "tver", region: "Тверская область", population: 420000 },
  { name: "Магнитогорск", slug: "magnitogorsk", region: "Челябинская область", population: 410000 },
  { name: "Брянск", slug: "bryansk", region: "Брянская область", population: 400000 },
  { name: "Иваново", slug: "ivanovo", region: "Ивановская область", population: 400000 },
  { name: "Белгород", slug: "belgorod", region: "Белгородская область", population: 390000 },
  { name: "Сургут", slug: "surgut", region: "Ханты-Мансийский АО", population: 380000 },
];

export function getCityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}

// Предлоги для разных городов
export function getCityPreposition(cityName: string): string {
  // Города на согласную обычно "в", на гласную иногда "во"
  const voPrefix = ["Владивосток", "Владимир"];
  if (voPrefix.includes(cityName)) return "во";
  return "в";
}

// Склонение города в предложном падеже
export function getCityPrepositional(cityName: string): string {
  const exceptions: Record<string, string> = {
    "Москва": "Москве",
    "Санкт-Петербург": "Санкт-Петербурге",
    "Тула": "Туле",
    "Уфа": "Уфе",
    "Пенза": "Пензе",
    "Самара": "Самаре",
    "Казань": "Казани",
    "Пермь": "Перми",
    "Тверь": "Твери",
    "Рязань": "Рязани",
    "Астрахань": "Астрахани",
    "Тюмень": "Тюмени",
  };
  
  if (exceptions[cityName]) return exceptions[cityName];
  
  // Базовые правила склонения
  if (cityName.endsWith("а")) {
    return cityName.slice(0, -1) + "е";
  }
  if (cityName.endsWith("ь")) {
    return cityName.slice(0, -1) + "и";
  }
  if (cityName.endsWith("й")) {
    return cityName.slice(0, -1) + "е";
  }
  
  return cityName + "е";
}
