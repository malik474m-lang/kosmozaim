# 🚀 Установка Космозайм на хостинг Jino.ru

> Подробная пошаговая инструкция. Node.js доступен на хостинге.

---

## Оглавление

1. [Подготовка на хостинге](#1-подготовка-на-хостинге)
2. [Создание базы данных MySQL](#2-создание-базы-данных-mysql)
3. [Загрузка файлов проекта](#3-загрузка-файлов-проекта)
4. [Адаптация под MySQL](#4-адаптация-под-mysql)
5. [Настройка переменных окружения](#5-настройка-переменных-окружения)
6. [Создание таблиц в базе данных](#6-создание-таблиц-в-базе-данных)
7. [Установка зависимостей и сборка](#7-установка-зависимостей-и-сборка)
8. [Запуск приложения](#8-запуск-приложения)
9. [Настройка домена](#9-настройка-домена)
10. [Настройка аналитики](#10-настройка-аналитики)
11. [Первый вход в админку](#11-первый-вход-в-админку)
12. [Настройка автогенерации статей](#12-настройка-автогенерации-статей)
13. [Обслуживание и обновления](#13-обслуживание-и-обновления)
14. [Решение проблем](#14-решение-проблем)

---

## 1. Подготовка на хостинге

### 1.1 Войдите в панель управления Jino.ru

Откройте https://jino.ru и войдите в личный кабинет.

### 1.2 Проверьте доступность Node.js

Перейдите в раздел **«Хостинг»** → **«Управление»** → **«SSH-доступ»**.

Если SSH-доступ не включён — включите его в настройках.

### 1.3 Подключитесь по SSH

```bash
ssh ваш_логин@ваш_сервер.jino.ru
```

Или используйте PuTTY (Windows) / Terminal (Mac/Linux).

### 1.4 Проверьте версию Node.js

```bash
node -v
# Должна быть 18.x или выше

npm -v
# Должна быть 9.x или выше
```

Если Node.js не нужной версии, установите через nvm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
```

---

## 2. Создание базы данных MySQL

### 2.1 Через панель управления Jino.ru

1. Перейдите в **«Хостинг»** → **«Базы данных»** → **«MySQL»**
2. Нажмите **«Создать базу данных»**
3. Запишите данные:
   - **Имя базы:** `ваш_логин_kosmozaim` (например `u12345_kosmozaim`)
   - **Пользователь:** `u12345_kosmozaim` (обычно совпадает с именем базы)
   - **Пароль:** придумайте надёжный пароль
   - **Хост:** `localhost` (обычно на Jino.ru)

### 2.2 Запишите эти данные — они понадобятся позже

```
Хост: localhost
Порт: 3306
База: u12345_kosmozaim
Пользователь: u12345_kosmozaim
Пароль: ваш_пароль
```

---

## 3. Загрузка файлов проекта

### Вариант А: Через Git (рекомендуется)

```bash
# Подключитесь по SSH
ssh ваш_логин@ваш_сервер.jino.ru

# Перейдите в директорию сайта
cd ~/domains/kosmozaim.ru

# Клонируйте репозиторий (если есть)
git clone https://ваш_репозиторий.git .
```

### Вариант Б: Через FTP / файловый менеджер

1. Откройте любой FTP-клиент (FileZilla, WinSCP)
2. Подключитесь к серверу с вашими данными
3. Перейдите в папку `~/domains/kosmozaim.ru/`
4. Загрузите ВСЕ файлы проекта (кроме `node_modules/` и `.next/`)

### Вариант В: Через архив

```bash
# На локальном компьютере создайте архив (без node_modules):
tar --exclude='node_modules' --exclude='.next' -czf kosmozaim.tar.gz .

# Загрузите архив по SCP:
scp kosmozaim.tar.gz ваш_логин@ваш_сервер.jino.ru:~/domains/kosmozaim.ru/

# На сервере распакуйте:
ssh ваш_логин@ваш_сервер.jino.ru
cd ~/domains/kosmozaim.ru
tar -xzf kosmozaim.tar.gz
rm kosmozaim.tar.gz
```

---

## 4. Адаптация под MySQL

Текущий проект использует PostgreSQL. Для MySQL нужно изменить 3 файла.

### 4.1 Установите MySQL-драйвер

```bash
cd ~/domains/kosmozaim.ru
npm uninstall pg @types/pg
npm install mysql2
```

### 4.2 Замените файл `src/db/index.ts`

Откройте файл в редакторе (nano, vim или через файловый менеджер):

```bash
nano src/db/index.ts
```

Замените содержимое на:

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
  mysql.createPool({
    uri: databaseUrl,
    waitForConnections: true,
    connectionLimit: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__mysqlPool = pool;
}

export const db = drizzle(pool);
```

### 4.3 Замените файл `src/db/schema.ts`

```bash
nano src/db/schema.ts
```

Замените ПОЛНОСТЬЮ на:

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

export const offers = mysqlTable("offers", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  category: mysqlEnum("category", ["microloans", "credits", "credit_cards", "debit_cards"]).notNull(),
  amountMin: int("amount_min").notNull().default(1000),
  amountMax: int("amount_max").notNull().default(100000),
  termMinDays: int("term_min_days").notNull().default(1),
  termMaxDays: int("term_max_days").notNull().default(365),
  psk: decimal("psk", { precision: 6, scale: 2 }).notNull().default("0"),
  rate: decimal("rate", { precision: 6, scale: 2 }).notNull().default("0"),
  freeTermDays: int("free_term_days").notNull().default(0),
  logoUrl: text("logo_url"),
  affiliateUrl: text("affiliate_url").notNull(),
  borrowerCategory: mysqlEnum("borrower_category", ["employed", "unemployed", "pensioner", "student", "self_employed", "any"]).notNull().default("any"),
  description: text("description"),
  seoKeywords: text("seo_keywords"),
  regions: text("regions"),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull().default("0"),
  reviewCount: int("review_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const articles = mysqlTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  coverImage: text("cover_image"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminUsers = mysqlTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clickStats = mysqlTable("click_stats", {
  id: serial("id").primaryKey(),
  offerId: int("offer_id").notNull(),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
  userAgent: text("user_agent"),
  referer: text("referer"),
});

export const subscribers = mysqlTable("subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

export const reviews = mysqlTable("reviews", {
  id: serial("id").primaryKey(),
  offerId: int("offer_id").notNull(),
  authorName: varchar("author_name", { length: 100 }).notNull(),
  rating: int("rating").notNull().default(5),
  comment: text("comment").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type ClickStat = typeof clickStats.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
```

### 4.4 Замените файл `drizzle.config.json`

```bash
nano drizzle.config.json
```

```json
{
  "dialect": "mysql",
  "schema": "./src/db/schema.ts",
  "dbCredentials": {
    "url": "mysql://u12345_kosmozaim:ваш_пароль@localhost:3306/u12345_kosmozaim"
  }
}
```

### 4.5 Замените `ilike` на `like`

MySQL не поддерживает `ilike` (регистронезависимый поиск). Откройте:

```bash
nano src/app/search/page.tsx
```

Замените все `ilike` на `like`:

```typescript
// Было:
import { eq, or, ilike, and } from "drizzle-orm";
// Стало:
import { eq, or, like, and } from "drizzle-orm";

// Замените все вхождения ilike на like
// ilike(offers.title, searchPattern)  →  like(offers.title, searchPattern)
```

---

## 5. Настройка переменных окружения

### 5.1 Создайте файл `.env`

```bash
nano ~/domains/kosmozaim.ru/.env
```

Вставьте (подставьте свои значения):

```env
# База данных MySQL
DATABASE_URL=mysql://u12345_kosmozaim:ваш_пароль@localhost:3306/u12345_kosmozaim

# URL вашего сайта
NEXT_PUBLIC_SITE_URL=https://kosmozaim.ru

# Секрет сессии (замените на случайную строку!)
SESSION_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ123456

# Порт (обычно Jino выделяет конкретный порт)
PORT=3000

# Яндекс.Метрика (получите на metrika.yandex.ru)
# NEXT_PUBLIC_YANDEX_METRIKA_ID=12345678

# Google Analytics (получите на analytics.google.com)
# NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# YandexGPT для автогенерации статей (опционально)
# YANDEX_GPT_API_KEY=ваш_ключ
# YANDEX_FOLDER_ID=ваш_folder_id

# GigaChat для автогенерации статей (опционально)
# GIGACHAT_AUTH=base64_строка
```

### 5.2 Сгенерируйте надёжный SESSION_SECRET

```bash
openssl rand -hex 32
```

Скопируйте результат и вставьте как значение `SESSION_SECRET`.

---

## 6. Создание таблиц в базе данных

### Через phpMyAdmin (проще)

1. Войдите в phpMyAdmin на Jino.ru (обычно доступен в панели управления)
2. Выберите вашу базу данных
3. Перейдите во вкладку **«SQL»**
4. Вставьте и выполните этот SQL:

```sql
-- Таблица предложений
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
  seo_keywords TEXT,
  regions TEXT,
  rating DECIMAL(3,1) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица статей
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица администраторов
CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Статистика кликов
CREATE TABLE click_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  offer_id INT NOT NULL,
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  referer TEXT,
  INDEX idx_offer_id (offer_id),
  INDEX idx_clicked_at (clicked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Подписчики рассылки
CREATE TABLE subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Отзывы
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  offer_id INT NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_offer_id (offer_id),
  INDEX idx_approved (is_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Через SSH (альтернатива)

```bash
mysql -u u12345_kosmozaim -p u12345_kosmozaim < create_tables.sql
```

---

## 7. Установка зависимостей и сборка

### 7.1 Установите зависимости

```bash
cd ~/domains/kosmozaim.ru
npm install
```

Это займёт 2-5 минут. Дождитесь окончания.

### 7.2 Соберите проект

```bash
npm run build
```

Сборка занимает 1-3 минуты. Вы должны увидеть:

```
✓ Compiled successfully
✓ Generating static pages
```

Если есть ошибки — см. раздел «Решение проблем».

---

## 8. Запуск приложения

### Вариант А: Через PM2 (рекомендуется)

PM2 — менеджер процессов, который перезапустит приложение при сбое.

```bash
# Установите PM2 глобально
npm install -g pm2

# Запустите приложение
pm2 start npm --name "kosmozaim" -- start

# Проверьте статус
pm2 status

# Настройте автозапуск при перезагрузке сервера
pm2 save
pm2 startup
# PM2 выведет команду — выполните её
```

### Вариант Б: Через systemd (если есть root-доступ)

```bash
sudo nano /etc/systemd/system/kosmozaim.service
```

```ini
[Unit]
Description=Kosmozaim Next.js App
After=network.target

[Service]
Type=simple
User=ваш_пользователь
WorkingDirectory=/home/ваш_логин/domains/kosmozaim.ru
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable kosmozaim
sudo systemctl start kosmozaim
sudo systemctl status kosmozaim
```

### Вариант В: Простой запуск (для тестирования)

```bash
# Запуск в фоне
nohup npm start > ~/kosmozaim.log 2>&1 &

# Проверьте, что работает
curl http://localhost:3000
```

### 8.1 Проверьте работу

Откройте в браузере:

```
http://ваш_сервер:3000
```

Должна открыться главная страница сайта.

---

## 9. Настройка домена

### 9.1 Привяжите домен в панели Jino.ru

1. В панели управления → **«Домены»** → **«Добавить домен»**
2. Укажите `kosmozaim.ru`
3. Настройте DNS-записи:
   - **A-запись:** IP-адрес вашего сервера
   - **CNAME для www:** `kosmozaim.ru`

### 9.2 Настройте проксирование (Nginx)

Если Jino предоставляет Nginx, добавьте конфигурацию:

```bash
nano ~/domains/kosmozaim.ru/nginx.conf
```

```nginx
server {
    listen 80;
    server_name kosmozaim.ru www.kosmozaim.ru;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 9.3 Установите SSL-сертификат

На Jino.ru обычно есть бесплатный Let's Encrypt:

1. Панель управления → **«SSL-сертификаты»**
2. Выберите **«Let's Encrypt»**
3. Укажите домен `kosmozaim.ru`
4. Нажмите **«Установить»**

---

## 10. Настройка аналитики

### 10.1 Яндекс.Метрика

1. Перейдите на https://metrika.yandex.ru
2. Нажмите **«Добавить счётчик»**
3. Укажите адрес: `kosmozaim.ru`
4. Включите **Вебвизор**, **Карта кликов**, **Карта скроллинга**
5. Скопируйте **номер счётчика**
6. Добавьте в `.env`:
   ```
   NEXT_PUBLIC_YANDEX_METRIKA_ID=12345678
   ```
7. Пересоберите проект:
   ```bash
   npm run build
   pm2 restart kosmozaim
   ```

### 10.2 Google Analytics

1. Перейдите на https://analytics.google.com
2. Создайте **ресурс** для `kosmozaim.ru`
3. Получите **Measurement ID** (формат `G-XXXXXXXXXX`)
4. Добавьте в `.env`:
   ```
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```
5. Пересоберите и перезапустите.

### 10.3 Яндекс.Вебмастер

1. Перейдите на https://webmaster.yandex.ru
2. Добавьте сайт `kosmozaim.ru`
3. Подтвердите права (через мета-тег или DNS)
4. Отправьте sitemap: `https://kosmozaim.ru/sitemap.xml`

### 10.4 Google Search Console

1. Перейдите на https://search.google.com/search-console
2. Добавьте ресурс `kosmozaim.ru`
3. Подтвердите права
4. Отправьте sitemap: `https://kosmozaim.ru/sitemap.xml`

---

## 11. Первый вход в админку

### 11.1 Откройте админку

```
https://kosmozaim.ru/admin
```

### 11.2 Войдите с данными по умолчанию

- **Логин:** `admin`
- **Пароль:** `admin123`

> ⚠️ **Сразу смените пароль!** Для этого измените хеш в базе данных (пока интерфейса смены пароля нет).

### 11.3 Добавьте первые предложения

1. Перейдите во вкладку **«Предложения»**
2. Нажмите **«+ Добавить предложение»**
3. Заполните карточку:
   - Название, категория, суммы, сроки
   - Ставка, ПСК, беспроцентный период
   - Партнёрская ссылка
   - Регионы (пусто = вся Россия)
   - SEO-ключевые слова

### 11.4 Сгенерируйте статьи

1. Перейдите во вкладку **«Статьи»**
2. Нажмите **«🤖 Автогенерация»**
3. Выберите тему или оставьте случайную
4. Проверьте текст и нажмите **«Опубликовать»**

---

## 12. Настройка автогенерации статей

### Вариант А: YandexGPT (рекомендуется)

1. Зарегистрируйтесь на https://cloud.yandex.ru
2. Создайте платёжный аккаунт
3. Перейдите в **«Сервисные аккаунты»** → создайте API-ключ
4. Скопируйте `folder_id` из URL в консоли облака
5. Добавьте в `.env`:
   ```
   YANDEX_GPT_API_KEY=ваш_api_key
   YANDEX_FOLDER_ID=ваш_folder_id
   ```
6. Пересоберите и перезапустите

Стоимость: ~2-3 ₽ за статью.

### Вариант Б: GigaChat (Сбер)

1. Зарегистрируйтесь на https://developers.sber.ru/portal/products/gigachat
2. Создайте проект, получите `Client ID` и `Client Secret`
3. Закодируйте в Base64:
   ```bash
   echo -n "client_id:client_secret" | base64
   ```
4. Добавьте в `.env`:
   ```
   GIGACHAT_AUTH=полученная_base64_строка
   ```

### Без AI

Без подключения AI система генерирует статьи по качественным шаблонам — тоже работает хорошо для SEO.

---

## 13. Обслуживание и обновления

### 13.1 Обновление кода

```bash
cd ~/domains/kosmozaim.ru

# Если используете Git:
git pull origin main

# Если загружаете вручную — замените файлы

# Пересоберите
npm run build

# Перезапустите
pm2 restart kosmozaim
```

### 13.2 Просмотр логов

```bash
# Логи PM2
pm2 logs kosmozaim

# Последние 50 строк
pm2 logs kosmozaim --lines 50

# Ошибки
pm2 logs kosmozaim --err
```

### 13.3 Мониторинг

```bash
# Статус приложения
pm2 status

# Подробная информация
pm2 show kosmozaim

# Мониторинг в реальном времени
pm2 monit
```

### 13.4 Резервное копирование

```bash
# Бэкап базы данных
mysqldump -u u12345_kosmozaim -p u12345_kosmozaim > ~/backups/kosmozaim_$(date +%Y%m%d).sql

# Бэкап файлов
tar -czf ~/backups/kosmozaim_files_$(date +%Y%m%d).tar.gz ~/domains/kosmozaim.ru/
```

Рекомендуется делать бэкапы еженедельно.

---

## 14. Решение проблем

### Ошибка «Cannot find module 'mysql2'»

```bash
npm install mysql2
```

### Ошибка «ECONNREFUSED» к базе данных

Проверьте `DATABASE_URL` в `.env`. Убедитесь, что:
- Хост правильный (обычно `localhost`)
- Пароль правильный
- База данных существует

```bash
# Проверьте подключение
mysql -u u12345_kosmozaim -p -h localhost u12345_kosmozaim
```

### Ошибка «EACCES: permission denied»

```bash
# Дайте права на папку
chmod -R 755 ~/domains/kosmozaim.ru
chmod 600 ~/domains/kosmozaim.ru/.env
```

### Сайт не открывается по домену

1. Проверьте DNS: `dig kosmozaim.ru`
2. Проверьте что приложение запущено: `pm2 status`
3. Проверьте Nginx конфигурацию
4. Проверьте что порт не занят: `lsof -i :3000`

### Ошибка «ilike is not a function» (MySQL)

Замените `ilike` на `like` во всех файлах:

```bash
grep -r "ilike" src/ --include="*.ts" --include="*.tsx"
```

### Страницы возвращают 500 ошибку

```bash
# Проверьте логи
pm2 logs kosmozaim --err --lines 100

# Обычно проблема в переменных окружения или базе данных
```

### Как перезапустить после изменения .env

```bash
npm run build
pm2 restart kosmozaim
```

---

## Краткая шпаргалка команд

```bash
# Подключение к серверу
ssh логин@сервер.jino.ru

# Перейти в папку проекта
cd ~/domains/kosmozaim.ru

# Установить зависимости
npm install

# Собрать проект
npm run build

# Запустить
pm2 start npm --name "kosmozaim" -- start

# Перезапустить
pm2 restart kosmozaim

# Остановить
pm2 stop kosmozaim

# Посмотреть логи
pm2 logs kosmozaim

# Статус
pm2 status

# Бэкап БД
mysqldump -u user -p dbname > backup.sql
```

---

## Структура сайта после установки

```
https://kosmozaim.ru/                    — Главная
https://kosmozaim.ru/zajmy               — Займы
https://kosmozaim.ru/zajmy/moskva        — Займы в Москве
https://kosmozaim.ru/zajmy/type/bez-otkaza — Займы без отказа
https://kosmozaim.ru/kredity             — Кредиты
https://kosmozaim.ru/karty/kreditnye     — Кредитные карты
https://kosmozaim.ru/karty/debetovye     — Дебетовые карты
https://kosmozaim.ru/calculator          — Калькулятор
https://kosmozaim.ru/compare             — Сравнение
https://kosmozaim.ru/articles            — Статьи
https://kosmozaim.ru/glossary            — Глоссарий
https://kosmozaim.ru/faq                 — FAQ
https://kosmozaim.ru/favorites           — Избранное
https://kosmozaim.ru/offer/[slug]        — Страница предложения
https://kosmozaim.ru/admin               — Админ-панель
https://kosmozaim.ru/sitemap.xml         — Карта сайта
https://kosmozaim.ru/robots.txt          — Robots.txt
```

---

Готово! 🎉 Если что-то не работает — перечитайте раздел «Решение проблем» или свяжитесь с поддержкой хостинга.
