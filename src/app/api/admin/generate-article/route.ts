import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { verifySession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { desc } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const YANDEX_API_KEY = process.env.YANDEX_GPT_API_KEY;
const YANDEX_FOLDER_ID = process.env.YANDEX_FOLDER_ID;
const GIGACHAT_AUTH = process.env.GIGACHAT_AUTH;

const topics = [
  {
    category: "займы",
    themes: [
      "Как получить займ без отказа",
      "Первый займ без процентов: условия и подводные камни",
      "Как улучшить шансы на одобрение займа",
      "Что делать при просрочке микрозайма",
      "Рефинансирование займов: когда это выгодно",
      "Займы для пенсионеров: особенности и условия",
      "Займы студентам: как получить деньги на учёбу",
      "Безопасность при оформлении онлайн-займа",
      "Как выбрать надёжную МФО",
      "Новые правила выдачи микрозаймов в России",
      "Займы на карту мгновенно: как это работает",
      "Чем отличается займ от кредита",
    ],
  },
  {
    category: "кредиты",
    themes: [
      "Потребительский кредит vs кредитная карта: что выбрать",
      "Как снизить процентную ставку по кредиту",
      "Досрочное погашение кредита: плюсы и минусы",
      "Кредитная история: как проверить и улучшить",
      "Кредит под залог недвижимости: условия и риски",
      "Автокредит или потребительский кредит на авто",
      "Кредитные каникулы: кому положены и как оформить",
      "Страхование кредита: обязательно или нет",
      "Созаёмщик и поручитель: в чём разница",
      "Как правильно читать кредитный договор",
      "Рефинансирование кредита: пошаговая инструкция",
      "Кредит для самозанятых: особенности получения",
    ],
  },
  {
    category: "карты",
    themes: [
      "Лучшие кредитные карты с кэшбеком",
      "Как пользоваться льготным периодом без процентов",
      "Дебетовые карты с процентом на остаток",
      "Виртуальные карты: безопасность онлайн-покупок",
      "Карты с бесплатным обслуживанием: сравнение",
      "Премиальные карты: стоят ли они своих денег",
      "Карты для путешествий: мили и бонусы",
      "Как защитить банковскую карту от мошенников",
      "Карты для детей и подростков: обзор предложений",
      "Кэшбек vs бонусы: что выгоднее",
      "Как выбрать карту для повседневных покупок",
    ],
  },
];

// =============================================
// Генерация текста через YandexGPT
// =============================================
async function generateWithYandexGPT(topic: string): Promise<string | null> {
  if (!YANDEX_API_KEY || !YANDEX_FOLDER_ID) return null;

  try {
    const response = await fetch(
      "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Api-Key ${YANDEX_API_KEY}`,
          "x-folder-id": YANDEX_FOLDER_ID,
        },
        body: JSON.stringify({
          modelUri: `gpt://${YANDEX_FOLDER_ID}/yandexgpt/latest`,
          completionOptions: {
            stream: false,
            temperature: 0.4,
            maxTokens: 8000,
          },
          messages: [
            {
              role: "system",
              text: `Ты — опытный финансовый журналист и SEO-копирайтер для сайта Космозайм (kosmozaim.ru). 
Твоя задача — писать развёрнутые, подробные, экспертные статьи на русском языке.

Правила написания:
- Объём статьи: минимум 1500 слов, максимум 3000 слов
- Пиши развёрнуто, с деталями и примерами
- Используй подзаголовки для структуры
- Добавляй конкретные цифры, факты и примеры
- Давай пошаговые инструкции где это уместно
- Упоминай актуальное законодательство РФ
- В конце статьи упомяни, что на сайте Космозайм можно сравнить предложения
- НЕ используй таблицы
- НЕ используй markdown разметку
- НЕ используй символы *, **, ***, #, ##, ###, -, • как элементы оформления текста
- НЕ выделяй слова звёздочками
- Пиши обычным текстом с переносами строк
- Подзаголовки пиши на отдельной строке без спецсимволов`,
            },
            {
              role: "user",
              text: `Напиши развёрнутую статью на тему "${topic}". 
Статья должна быть подробной, минимум 1500 слов. 
В статье не используй таблицы. 
Не используй звёздочки, markdown-разметку, маркеры списков и символы оформления.
Добавляй практические советы и конкретные примеры.
Статья для читателей из России.`, 
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("YandexGPT text error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.result?.alternatives?.[0]?.message?.text || null;
  } catch (e) {
    console.error("YandexGPT text exception:", e);
    return null;
  }
}

// =============================================
// Генерация изображения через YandexART
// =============================================
async function generateImageWithYandexART(topic: string): Promise<string | null> {
  if (!YANDEX_API_KEY || !YANDEX_FOLDER_ID) return null;

  try {
    // Шаг 1: отправляем запрос на генерацию
    const createResponse = await fetch(
      "https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Api-Key ${YANDEX_API_KEY}`,
        },
        body: JSON.stringify({
          modelUri: `art://${YANDEX_FOLDER_ID}/yandex-art/latest`,
          generationOptions: {
            seed: Math.floor(Math.random() * 1000000),
            aspectRatio: {
              widthRatio: "16",
              heightRatio: "9",
            },
          },
          messages: [
            {
              weight: "1",
              text: `Создай изображение на тему "${topic}". Профессиональная иллюстрация для финансовой статьи. Современный стиль, яркие цвета, без текста на изображении.`,
            },
          ],
        }),
      }
    );

    if (!createResponse.ok) {
      console.error("YandexART create error:", createResponse.status, await createResponse.text());
      return null;
    }

    const createData = await createResponse.json();
    const operationId = createData.id;

    if (!operationId) {
      console.error("YandexART: no operation id");
      return null;
    }

    // Шаг 2: ждём результат (до 60 секунд)
    for (let i = 0; i < 12; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const checkResponse = await fetch(
        `https://operation.api.cloud.yandex.net:443/operations/${operationId}`,
        {
          headers: {
            Authorization: `Api-Key ${YANDEX_API_KEY}`,
          },
        }
      );

      if (!checkResponse.ok) continue;

      const checkData = await checkResponse.json();

      if (checkData.done === true && checkData.response?.image) {
        // Шаг 3: сохраняем изображение
        const imageBuffer = Buffer.from(checkData.response.image, "base64");
        const fileName = `article-${Date.now()}.jpeg`;
        const dirPath = path.join(process.cwd(), "public", "images", "articles");
        const filePath = path.join(dirPath, fileName);

        await mkdir(dirPath, { recursive: true });
        await writeFile(filePath, imageBuffer);

        return `/images/articles/${fileName}`;
      }

      if (checkData.done === true && checkData.error) {
        console.error("YandexART generation error:", checkData.error);
        return null;
      }
    }

    console.error("YandexART: timeout waiting for image");
    return null;
  } catch (e) {
    console.error("YandexART exception:", e);
    return null;
  }
}

function sanitizeGeneratedArticle(content: string): string {
  return content
    // убираем markdown-заголовки
    .replace(/^#{1,6}\s*/gm, "")
    // убираем markdown-выделение
    .replace(/\*\*\*/g, "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/~~/g, "")
    // убираем одинарные звёздочки и обратные кавычки
    .replace(/\*/g, "")
    .replace(/`/g, "")
    // убираем markdown-маркеры списков в начале строки
    .replace(/^\s*[-•+]\s+/gm, "")
    // убираем лишние пробелы перед знаками препинания
    .replace(/\s+([.,!?;:])/g, "$1")
    // схлопываем слишком большие пустые блоки
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// =============================================
// Генерация через GigaChat
// =============================================
async function generateWithGigaChat(topic: string): Promise<string | null> {
  if (!GIGACHAT_AUTH) return null;

  try {
    const tokenResponse = await fetch("https://ngw.devices.sberbank.ru:9443/api/v2/oauth", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        RqUID: crypto.randomUUID(),
        Authorization: `Basic ${GIGACHAT_AUTH}`,
      },
      body: "scope=GIGACHAT_API_PERS",
    });

    if (!tokenResponse.ok) return null;

    const tokenData = await tokenResponse.json();

    const response = await fetch("https://gigachat.devices.sberbank.ru/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify({
        model: "GigaChat",
        messages: [
          {
            role: "system",
            content: `Ты — финансовый журналист для сайта Космозайм. 
Пиши развёрнутые статьи минимум 1500 слов. 
Без таблиц, без markdown. 
Не используй символы *, **, ***, #, -, • и другие элементы markdown-разметки.
Подзаголовки на отдельной строке.
Добавляй примеры и факты.`,
          },
          {
            role: "user",
            content: `Напиши развёрнутую статью на тему "${topic}". В статье не используй таблицы. Минимум 1500 слов. Не используй звёздочки, markdown-разметку и символы оформления. Практические советы и примеры для России.`, 
          },
        ],
        temperature: 0.4,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

// =============================================
// Шаблонная генерация (fallback)
// =============================================
function generateFromTemplate(
  title: string,
  category: string
): { content: string; excerpt: string } {
  const year = new Date().getFullYear();

  const intros: Record<string, string> = {
    займы: `В ${year} году микрозаймы остаются одним из самых доступных способов быстро получить деньги. Разберём подробно тему "${title}" и дадим практические рекомендации.`,
    кредиты: `Банковские кредиты в ${year} году предлагают разнообразные условия. Рассмотрим детально тему "${title}".`,
    карты: `Банковские карты в ${year} году — не просто платёжный инструмент, а способ экономить. Поговорим о: "${title}".`,
  };

  const intro = intros[category] || intros["займы"];

  const content = `${title}

${intro}

При выборе финансового продукта обращайте внимание на процентную ставку, полную стоимость кредита (ПСК) и наличие скрытых комиссий. Это основные параметры, которые определяют реальную переплату.

Основные рекомендации

Сравнивайте несколько предложений перед принятием решения. Не стоит соглашаться на первое попавшееся предложение — разница в условиях может быть значительной.

Читайте договор перед подписанием. Обратите особое внимание на разделы о штрафах за просрочку, комиссиях за досрочное погашение и обязательном страховании.

Не берите больше, чем можете вернуть. Финансовые эксперты рекомендуют, чтобы ежемесячный платёж по всем кредитам не превышал 30-40% от вашего дохода.

Проверяйте организацию в реестре ЦБ РФ. Все легальные банки и МФО зарегистрированы на сайте cbr.ru. Если организации нет в реестре — это мошенники.

Как выбрать лучшее предложение

Первый шаг — определите, какая сумма вам действительно необходима. Не стоит брать «с запасом» — каждый лишний рубль увеличивает переплату.

Второй шаг — сравните ПСК (полную стоимость кредита) у разных организаций. ПСК учитывает все расходы, включая комиссии и страховки, в отличие от рекламной ставки.

Третий шаг — обратите внимание на наличие акций. Многие МФО предлагают первый займ без процентов, а банки снижают ставку для зарплатных клиентов.

Что делать при возникновении проблем

Если вы понимаете, что не можете вернуть долг вовремя, не прячьтесь от кредитора. Свяжитесь с ним и обсудите варианты: реструктуризацию, кредитные каникулы или продление срока.

По закону максимальная неустойка по микрозаймам составляет 20% годовых от суммы просрочки. А общая сумма процентов и штрафов не может превышать 130% от суммы займа.

Выводы

Грамотный подход к выбору финансовых продуктов поможет сэкономить деньги и избежать проблем. Используйте сервис Космозайм для сравнения предложений от разных банков и МФО.

На нашем сайте вы можете воспользоваться удобным калькулятором, фильтрами подбора и сравнить условия в наглядной таблице. Все предложения содержат актуальную информацию о ставках, суммах и сроках.`;

  const excerpt = intro.slice(0, 200) + "...";

  return { content, excerpt };
}

// =============================================
// POST — генерация статьи
// =============================================
export async function POST(request: NextRequest) {
  const valid = await verifySession();
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { topic, category } = await request.json();

    // Выбираем тему
    let selectedTopic = topic;
    let selectedCategory = category || "займы";

    if (!selectedTopic) {
      const categoryData = topics[Math.floor(Math.random() * topics.length)];
      selectedCategory = categoryData.category;
      selectedTopic =
        categoryData.themes[Math.floor(Math.random() * categoryData.themes.length)];
    }

    // Генерируем текст
    let content: string | null = null;
    let excerpt: string;
    let aiProvider = "template";

    // Пробуем YandexGPT
    if (!content && YANDEX_API_KEY) {
      content = await generateWithYandexGPT(selectedTopic);
      if (content) aiProvider = "YandexGPT";
    }

    // Пробуем GigaChat
    if (!content && GIGACHAT_AUTH) {
      content = await generateWithGigaChat(selectedTopic);
      if (content) aiProvider = "GigaChat";
    }

    // Fallback на шаблоны
    if (!content) {
      const template = generateFromTemplate(selectedTopic, selectedCategory);
      content = template.content;
      excerpt = template.excerpt;
    } else {
      content = sanitizeGeneratedArticle(content);
      const paragraphs = content.split("\n\n").filter(Boolean);
      excerpt =
        paragraphs.length > 1
          ? paragraphs[1].slice(0, 200) + "..."
          : content.slice(0, 200) + "...";
    }

    content = sanitizeGeneratedArticle(content);

    // Генерируем картинку через YandexART
    let coverImage = "";
    if (YANDEX_API_KEY && YANDEX_FOLDER_ID) {
      const imagePath = await generateImageWithYandexART(selectedTopic);
      if (imagePath) {
        coverImage = imagePath;
      }
    }

    // Мета-данные
    const metaTitle = selectedTopic + " | Космозайм";
    const metaDescription = excerpt.slice(0, 155);
    const slug = slugify(selectedTopic) + "-" + Date.now();

    // Сохраняем в БД
    await db.insert(articles).values({
      title: selectedTopic,
      slug,
      excerpt,
      content,
      metaTitle,
      metaDescription,
      coverImage,
      isPublished: false,
    });

    const inserted = await db
      .select()
      .from(articles)
      .orderBy(desc(articles.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      article: inserted[0],
      aiProvider,
      hasImage: !!coverImage,
    });
  } catch (e) {
    console.error("Generate article error:", e);
    return NextResponse.json({ error: "Ошибка генерации" }, { status: 500 });
  }
}

// =============================================
// GET — список тем и статус AI
// =============================================
export async function GET() {
  const valid = await verifySession();
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const aiStatus = {
    yandexGPT: !!YANDEX_API_KEY && !!YANDEX_FOLDER_ID,
    gigaChat: !!GIGACHAT_AUTH,
    yandexART: !!YANDEX_API_KEY && !!YANDEX_FOLDER_ID,
  };

  return NextResponse.json({
    topics,
    aiStatus,
    hasAI: aiStatus.yandexGPT || aiStatus.gigaChat,
  });
}
