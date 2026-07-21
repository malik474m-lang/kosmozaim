import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { verifySession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { desc } from "drizzle-orm";

export async function GET() {
  const valid = await verifySession();
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = await db.select().from(articles).orderBy(desc(articles.createdAt));
  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  const valid = await verifySession();
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const slug = slugify(body.title || "article") + "-" + Date.now();

    const newArticle = await db
      .insert(articles)
      .values({
        title: body.title,
        slug,
        excerpt: body.excerpt || "",
        content: body.content,
        metaTitle: body.metaTitle || "",
        metaDescription: body.metaDescription || "",
        coverImage: body.coverImage || "",
        isPublished: body.isPublished || false,
      })
      .returning();

    return NextResponse.json(newArticle[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ошибка создания" }, { status: 500 });
  }
}
