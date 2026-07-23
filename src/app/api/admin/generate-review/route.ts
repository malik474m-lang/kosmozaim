import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, offers } from "@/db/schema";
import { verifySession } from "@/lib/auth";
import { eq } from "drizzle-orm";

const YANDEX_API_KEY = process.env.YANDEX_GPT_API_KEY;
const YANDEX_FOLDER_ID = process.env.YANDEX_FOLDER_ID;

const MALE_NAMES = ["Александр","Дмитрий","Максим","Иван","Артём","Андрей","Михаил","Сергей","Николай","Евгений","Алексей","Владимир","Денис","Кирилл","Роман","Олег","Павел","Виктор","Антон","Игорь","Руслан","Тимур","Юрий","Вадим","Егор"];
const FEMALE_NAMES = ["Анна","Мария","Елена","Ольга","Наталья","Татьяна","Ирина","Светлана","Екатерина","Юлия","Дарья","Алина","Марина","Оксана","Виктория","Полина","Надежда","Людмила","Валентина","Кристина"];

function randomName(): string {
  const all = [...MALE_NAMES, ...FEMALE_NAMES];
  return all[Math.floor(Math.random() * all.length)];
}

function randomRating(): number {
  const w = [1, 2, 5, 25, 67];
  const t = w.reduce((a, b) => a + b, 0);
  let r = Math.random() * t;
  for (let i = 0; i < w.length; i++) {
    r -= w[i]; if (r <= 0) return i + 1;
  }
  return 5;
}

async function genText(title: string, rating: number): Promise<string | null> {
  if (!YANDEX_API_KEY || !YANDEX_FOLDER_ID) return null;
  try {
    const mood = rating >= 4 ? "положительный" : rating === 3 ? "нейтральный" : "негативный";
    const r = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Api-Key " + YANDEX_API_KEY,
        "x-folder-id": YANDEX_FOLDER_ID
      },
      body: JSON.stringify({
        modelUri: "gpt://" + YANDEX_FOLDER_ID + "/yandexgpt-lite/latest",
        completionOptions: { stream: false, temperature: 0.8, maxTokens: 200 },
        messages: [
          { role: "system", text: "Ты обычный человек из России. Пиши короткий отзыв 2-4 предложения. Живой разговорный стиль. Без markdown." },
          { role: "user", text: "Напиши " + mood + " отзыв на сервис " + title + ". Оценка " + rating + " из 5. Коротко, 2-4 предложения." }
        ]
      })
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d.result?.alternatives?.[0]?.message?.text?.replace(/\\*/g, "").trim() || null;
  } catch { return null; }
}

const FALLBACK = ["Оформил заявку, деньги пришли быстро.","Всё хорошо, одобрили сразу.","Пользуюсь не первый раз, без проблем.","Быстрое оформление, деньги через 10 минут.","Удобный сервис, понятные условия.","Нормальный сервис, без скрытых комиссий."];

export async function POST() {
  const valid = await verifySession();
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const active = await db.select().from(offers).where(eq(offers.isActive, true));
    if (active.length === 0) return NextResponse.json({ error: "Нет офферов" }, { status: 400 });
    const offer = active[Math.floor(Math.random() * active.length)];
    const name = randomName();
    const rating = randomRating();
    let comment = await genText(offer.title, rating);
    if (!comment) comment = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
    await db.insert(reviews).values({ offerId: offer.id, authorName: name, rating, comment, isApproved: true });
    return NextResponse.json({ success: true, review: { offer: offer.title, name, rating, comment } });
  } catch (e) {
    console.error("Generate review error:", e);
    return NextResponse.json({ error: "Ошибка генерации" }, { status: 500 });
  }
}
