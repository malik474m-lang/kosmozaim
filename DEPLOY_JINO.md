# Инструкция по развёртыванию Космозайм на хостинге Jino.ru

## 1. Подготовка к развёртыванию

### 1.1 Требования
- Node.js 18+ (если поддерживается на jino.ru)
- MySQL 5.7+ или MariaDB 10+
- Доступ к SSH или панели управления

### 1.2 Настройка переменных окружения

Создайте файл `.env` на сервере:

```env
# База данных MySQL
DATABASE_URL=mysql://username:password@localhost:3306/kosmozaim_db

# URL сайта
NEXT_PUBLIC_SITE_URL=https://kosmozaim.ru

# Аналитика (опционально)
NEXT_PUBLIC_YANDEX_METRIKA_ID=ваш_id
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXX

# Секрет сессии (сгенерируйте случайную строку)
SESSION_SECRET=ваша_случайная_строка_32_символа

# AI для автогенерации статей (выберите один из вариантов)

# Вариант 1: YandexGPT (рекомендуется для РФ)
YANDEX_GPT_API_KEY=ваш_api_key
YANDEX_FOLDER_ID=ваш_folder_id

# Вариант 2: GigaChat (Сбер)
GIGACHAT_AUTH=base64_encoded_credentials
```

## 2. Адаптация под MySQL

Текущий проект использует PostgreSQL. Для MySQL нужно внести изменения:

### 2.1 Установка зависимостей MySQL

```bash
npm uninstall pg @types/pg
npm install mysql2
```

### 2.2 Изменение схемы базы данных

Замените содержимое `src/db/schema.ts`:

```typescript
import {
  mysqlTable,
  serial,
  varchar,
  text,
  int,
  decimal,
  boolean,
  timestamp,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const offerCategoryEnum = mysqlEnum("offer_category", [
  "microloans",
  "credits", 
  "credit_cards",
  "debit_cards",
]);

export const borrowerCategoryEnum = mysqlEnum("borrower_category", [
  "employed",
  "unemployed",
  "pensioner",
  "student",
  "self_employed",
  "any",
]);

export const offers = mysqlTable("offers", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  category: offerCategoryEnum.notNull(),
  amountMin: int("amount_min").notNull().default(1000),
  amountMax: int("amount_max").notNull().default(100000),
  termMinDays: int("term_min_days").notNull().default(1),
  termMaxDays: int("term_max_days").notNull().default(365),
  psk: decimal("psk", { precision: 6, scale: 2 }).notNull().default("0"),
  rate: decimal("rate", { precision: 6, scale: 2 }).notNull().default("0"),
  freeTermDays: int("free_term_days").notNull().default(0),
  logoUrl: text("logo_url"),
  affiliateUrl: text("affiliate_url").notNull(),
  borrowerCategory: borrowerCategoryEnum.notNull().default("any"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Аналогично для остальных таблиц...
```

### 2.3 Изменение подключения к БД

Замените `src/db/index.ts`:

```typescript
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __mysqlPool?: mysql.Pool;
};

export const pool =
  globalForDb.__mysqlPool ??
  mysql.createPool(databaseUrl);

if (process.env.NODE_ENV !== "production") {
  globalForDb.__mysqlPool = pool;
}

export const db = drizzle(pool);
```

### 2.4 Обновление drizzle.config.json

```json
{
  "dialect": "mysql",
  "schema": "./src/db/schema.ts",
  "dbCredentials": {
    "url": "mysql://username:password@localhost:3306/kosmozaim_db"
  }
}
```

## 3. Создание таблиц в MySQL

Выполните SQL-запросы в phpMyAdmin или через консоль:

```sql
CREATE TABLE offers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category ENUM('microloans', 'credits', 'credit_cards', 'debit_cards') NOT NULL,
  amount_min INT NOT NULL DEFAULT 1000,
  amount_max INT NOT NULL DEFAULT 100000,
  term_min_days INT NOT NULL DEFAULT 1,
  term_max_days INT NOT NULL DEFAULT 365,
  psk DECIMAL(6,2) NOT NULL DEFAULT 0,
  rate DECIMAL(6,2) NOT NULL DEFAULT 0,
  free_term_days INT NOT NULL DEFAULT 0,
  logo_url TEXT,
  affiliate_url TEXT NOT NULL,
  borrower_category ENUM('employed', 'unemployed', 'pensioner', 'student', 'self_employed', 'any') NOT NULL DEFAULT 'any',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  cover_image TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE click_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  offer_id INT NOT NULL,
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  referer TEXT,
  FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
);

CREATE TABLE subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  offer_id INT NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
);
```

## 4. Сборка и запуск

```bash
# Установка зависимостей
npm install

# Сборка проекта
npm run build

# Запуск (для Node.js хостинга)
npm start
```

## 5. Настройка Яндекс.Метрики

1. Зарегистрируйтесь на https://metrika.yandex.ru
2. Создайте счётчик для kosmozaim.ru
3. Скопируйте ID счётчика
4. Добавьте в `.env`: `NEXT_PUBLIC_YANDEX_METRIKA_ID=ваш_id`

## 6. Настройка Google Analytics

1. Зайдите на https://analytics.google.com
2. Создайте ресурс для kosmozaim.ru
3. Получите Measurement ID (G-XXXXXXXX)
4. Добавьте в `.env`: `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXX`

## 7. Вход в админ-панель

- URL: https://kosmozaim.ru/admin
- Логин по умолчанию: `admin`
- Пароль по умолчанию: `admin123`

**ВАЖНО:** Смените пароль после первого входа!

## 8. Настройка AI для автогенерации статей

### Вариант A: YandexGPT (рекомендуется)

1. Зарегистрируйтесь в Yandex Cloud: https://cloud.yandex.ru
2. Создайте платёжный аккаунт
3. Перейдите в раздел "Сервисные аккаунты" и создайте API-ключ
4. Скопируйте folder_id из настроек облака
5. Добавьте в `.env`:
```
YANDEX_GPT_API_KEY=ваш_api_key
YANDEX_FOLDER_ID=ваш_folder_id
```

Стоимость: ~0.2 ₽ за 1000 токенов (примерно 2-3 ₽ за статью)

### Вариант B: GigaChat (Сбер)

1. Зарегистрируйтесь: https://developers.sber.ru/portal/products/gigachat
2. Получите Client ID и Client Secret
3. Закодируйте в Base64: `echo -n "client_id:client_secret" | base64`
4. Добавьте в `.env`:
```
GIGACHAT_AUTH=полученная_base64_строка
```

Есть бесплатный лимит на тестирование.

### Без AI

Если не настраивать AI, система будет использовать качественные шаблоны статей.
Шаблоны содержат актуальную информацию и SEO-оптимизированы.

## 9. Альтернатива: Статический экспорт

Если jino.ru не поддерживает Node.js, можно использовать статический экспорт:

1. Добавьте в `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  output: 'export',
  // ...
};
```

2. Соберите статику:
```bash
npm run build
```

3. Загрузите папку `out/` на хостинг

**Примечание:** При статическом экспорте API-роуты и динамические страницы работать не будут. Потребуется настроить внешний бэкенд на PHP/Python.
