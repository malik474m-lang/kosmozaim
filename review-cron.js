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

const FALLBACKS = [
  "Оформил заявку, деньги пришли быстро. Всё прошло без проблем.",
  "Понравился сервис, условия понятные. Одобрение пришло достаточно быстро.",
  "Пользуюсь не первый раз, обычно всё проходит нормально.",
  "Деньги пришли на карту быстро, приложение удобное.",
  "Нормальный сервис, без лишних сложностей.",
  "Оформление простое, поддержка отвечает оперативно.",
  "Заявку заполнил быстро, решение пришло почти сразу.",
  "В целом доволен, условия оказались понятными и прозрачными."
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
    const mood =
      rating >= 5 ? "очень положительный" :
      rating === 4 ? "положительный" :
      rating === 3 ? "нейтральный" :
      "сдержанно-негативный";

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
            temperature: 0.8,
            maxTokens: 180,
          },
          messages: [
            {
              role: "system",
              text: "Ты обычный человек из России. Напиши короткий отзыв 2-4 предложения. Живой разговорный стиль. Без markdown, без звёздочек, без списков."
            },
            {
              role: "user",
              text: `Напиши ${mood} отзыв на финансовый сервис "${title}". Оценка ${rating} из 5. Коротко, естественно, как реальный пользователь.`
            }
          ]
        })
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const text = data.result?.alternatives?.[0]?.message?.text || null;
    if (!text) return null;

    return String(text)
      .replace(/\*/g, "")
      .replace(/\s+/g, " ")
      .trim();
  } catch (e) {
    console.error("[AI ERROR]", e.message);
    return null;
  }
}

async function updateOfferRating(pool, offerId) {
  await pool.query(
    `
    UPDATE offers
    SET
      rating = (
        SELECT COALESCE(ROUND(AVG(r.rating), 1), 0)
        FROM reviews r
        WHERE r.offer_id = ? AND r.is_approved = 1
      ),
      review_count = (
        SELECT COUNT(*)
        FROM reviews r
        WHERE r.offer_id = ? AND r.is_approved = 1
      )
    WHERE id = ?
    `,
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

    console.log(`[START] Генерация ${count} отзывов`);

    for (let i = 0; i < count; i++) {
      const offer = rnd(offers);
      const authorName = rnd(NAMES);
      const rating = randomRating();
      let comment = await generateReviewText(offer.title, rating);

      if (!comment) {
        comment = rnd(FALLBACKS);
      }

      await pool.query(
        `
        INSERT INTO reviews (offer_id, author_name, rating, comment, is_approved)
        VALUES (?, ?, ?, ?, 1)
        `,
        [offer.id, authorName, rating, comment]
      );

      await updateOfferRating(pool, offer.id);

      console.log(`[OK] ${authorName} -> ${offer.title} (${rating}/5)`);
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
