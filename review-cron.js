const mysql = require("mysql2/promise");

const YA_KEY = process.env.YANDEX_GPT_API_KEY;
const YA_FOLDER = process.env.YANDEX_FOLDER_ID;
const DB_URL = process.env.DATABASE_URL;

const NAMES = [
  "Александр","Дмитрий","Максим","Иван","Артём","Андрей","Михаил","Сергей",
  "Николай","Евгений","Алексей","Владимир","Денис","Кирилл","Роман","Олег",
  "Павел","Виктор","Антон","Игорь","Руслан","Тимур","Юрий","Егор",
  "Анна","Мария","Елена","Ольга","Наталья","Татьяна","Ирина","Светлана",
  "Екатерина","Юлия","Дарья","Алина","Марина","Оксана","Виктория","Полина"
];

const SITUATIONS = [
  "срочно понадобились деньги до зарплаты",
  "нужно было оплатить ремонт машины",
  "неожиданные расходы на лечение",
  "нужны были деньги на день рождения ребёнка",
  "надо было срочно оплатить коммуналку",
  "закончились деньги перед отпуском",
  "пришлось чинить стиральную машину",
  "нужно было заплатить за курсы",
  "попал в сложную ситуацию с деньгами",
  "не хватало на покупку телефона",
  "понадобилось заплатить за страховку",
  "потребовались деньги на переезд",
  "нужно было срочно купить лекарства",
  "не дотягивал до аванса",
  "решил попробовать первый раз взять займ",
  "подруга посоветовала этот сервис",
  "нашёл через интернет, решил попробовать",
  "раньше пользовался другим сервисом, перешёл сюда",
  "коллега на работе порекомендовал",
  "увидел рекламу, оформил заявку"
];

const STYLES = [
  "коротко и по делу, 2 предложения",
  "эмоционально и живо, 3 предложения",
  "спокойно и рассудительно, 2-3 предложения",
  "с конкретными деталями про скорость и удобство, 3 предложения",
  "как будто рассказываешь другу, 2-3 предложения",
  "сдержанно, отмечая плюсы и минусы, 3 предложения"
];

const FALLBACKS = [
  "Срочно нужны были деньги, оформил за пару минут. Перевели быстро, доволен.",
  "Подавал заявку поздно вечером, одобрили почти сразу. На карту пришло минут через 15.",
  "Брал первый раз, переживал. Но всё прошло нормально, условия понятные.",
  "Коллега посоветовал, попробовал. Действительно удобно и без лишней бюрократии.",
  "Не хватало до зарплаты, выручили. Погасил вовремя, никаких проблем.",
  "Оформление простое, без кучи документов. Деньги на карте быстро.",
  "Процент конечно не маленький, но когда срочно нужно — выручает.",
  "Второй раз обращаюсь, в первый раз тоже всё было нормально.",
  "Удобно что всё онлайн, никуда ходить не надо. Одобрили за минуты.",
  "Подала заявку с телефона, пока ехала в автобусе. Деньги уже были на карте когда приехала.",
  "Нормальный сервис, без сюрпризов. Главное вовремя погасить.",
  "Друг брал тут раньше, порекомендовал. Я тоже оформил, всё ок."
];

function rnd(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomRating() {
  const weights = [1, 2, 5, 25, 67];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i + 1;
  }
  return 5;
}

async function generateReviewText(title, rating) {
  if (!YA_KEY || !YA_FOLDER) return null;

  try {
    const situation = rnd(SITUATIONS);
    const style = rnd(STYLES);

    const mood =
      rating === 5 ? "восторженный" :
      rating === 4 ? "положительный, но сдержанный" :
      rating === 3 ? "нейтральный, есть замечания" :
      "недовольный, но вежливый";

    const res = await fetch(
      "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Api-Key " + YA_KEY,
          "x-folder-id": YA_FOLDER,
        },
        body: JSON.stringify({
          modelUri: "gpt://" + YA_FOLDER + "/yandexgpt-lite/latest",
          completionOptions: {
            stream: false,
            temperature: 0.9,
            maxTokens: 150,
          },
          messages: [
            {
              role: "system",
              text: `Ты пишешь отзыв от лица реального человека из России.
Правила:
- Пиши ${style}
- Тон: ${mood}
- Ситуация: ${situation}
- НЕ начинай с фразы "Пользуюсь ... несколько месяцев"
- НЕ начинай с названия сервиса
- Начни с описания ситуации или действия
- Пиши живым разговорным языком, как в отзывах на Яндекс.Картах
- Без markdown, без звёздочек, без кавычек вокруг всего текста`
            },
            {
              role: "user",
              text: `Напиши отзыв на сервис "${title}". Оценка ${rating} из 5.`
            }
          ]
        })
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    let text = data.result?.alternatives?.[0]?.message?.text || null;
    if (!text) return null;

    text = String(text)
      .replace(/\*/g, "")
      .replace(/^["«]|["»]$/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (text.length < 20) return null;

    return text;
  } catch (e) {
    console.error("[AI ERROR]", e.message);
    return null;
  }
}

async function updateOfferRating(pool, offerId) {
  await pool.query(
    `UPDATE offers SET
      rating = (SELECT COALESCE(ROUND(AVG(r.rating), 1), 0) FROM reviews r WHERE r.offer_id = ? AND r.is_approved = 1),
      review_count = (SELECT COUNT(*) FROM reviews r WHERE r.offer_id = ? AND r.is_approved = 1)
    WHERE id = ?`,
    [offerId, offerId, offerId]
  );
}

async function run() {
  if (!DB_URL) {
    console.error("[ERROR] DATABASE_URL not set");
    process.exit(1);
  }

  const count = parseInt(process.argv[2] || process.env.REVIEW_COUNT || "2", 10);
  const pool = mysql.createPool(DB_URL);

  try {
    const [offers] = await pool.query(
      "SELECT id, title FROM offers WHERE is_active = 1 ORDER BY id ASC"
    );

    if (!offers.length) {
      console.error("[ERROR] Нет активных офферов");
      process.exit(1);
    }

    console.log("[START] Генерация " + count + " отзывов");

    for (let i = 0; i < count; i++) {
      const offer = rnd(offers);
      const authorName = rnd(NAMES);
      const rating = randomRating();
      let comment = await generateReviewText(offer.title, rating);

      if (!comment) {
        comment = rnd(FALLBACKS);
      }

      await pool.query(
        "INSERT INTO reviews (offer_id, author_name, rating, comment, is_approved) VALUES (?, ?, ?, ?, 1)",
        [offer.id, authorName, rating, comment]
      );

      await updateOfferRating(pool, offer.id);
      console.log("[OK] " + authorName + " -> " + offer.title + " (" + rating + "/5)");
    }

    console.log("[DONE] Отзывы созданы");
  } catch (e) {
    console.error("[FATAL]", e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
