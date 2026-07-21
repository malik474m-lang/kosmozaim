"use client";

import { useState, useEffect, useCallback } from "react";
import type { Article } from "@/db/schema";

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  coverImage: "",
  isPublished: false,
};

interface TopicCategory {
  category: string;
  themes: string[];
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // AI Generation
  const [showGenerator, setShowGenerator] = useState(false);
  const [topics, setTopics] = useState<TopicCategory[]>([]);
  const [aiStatus, setAiStatus] = useState<{ yandexGPT: boolean; gigaChat: boolean }>({ yandexGPT: false, gigaChat: false });
  const [generating, setGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/articles");
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const fetchTopics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/generate-article");
      if (res.ok) {
        const data = await res.json();
        setTopics(data.topics);
        setAiStatus(data.aiStatus || { yandexGPT: false, gigaChat: false });
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchArticles();
    fetchTopics();
  }, [fetchArticles, fetchTopics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingId ? `/api/admin/articles/${editingId}` : "/api/admin/articles";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        fetchArticles();
      }
    } catch {
      /* ignore */
    }
    setSaving(false);
  };

  const handleEdit = (article: Article) => {
    setForm({
      title: article.title,
      excerpt: article.excerpt || "",
      content: article.content,
      metaTitle: article.metaTitle || "",
      metaDescription: article.metaDescription || "",
      coverImage: article.coverImage || "",
      isPublished: article.isPublished,
    });
    setEditingId(article.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить статью?")) return;
    try {
      await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      fetchArticles();
    } catch {
      /* ignore */
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const topic = customTopic || selectedTopic;
      const res = await fetch("/api/admin/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic || null,
          category: selectedCategory || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowGenerator(false);
        setCustomTopic("");
        setSelectedTopic("");
        fetchArticles();
        alert(
          `Статья "${data.article.title}" создана!\n${
            data.usedAI ? "Использован AI" : "Использован шаблон"
          }\n\nПроверьте и опубликуйте в редакторе.`
        );
      } else {
        alert("Ошибка генерации статьи");
      }
    } catch {
      alert("Ошибка соединения");
    }
    setGenerating(false);
  };

  const updateField = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const filteredThemes = selectedCategory
    ? topics.find((t) => t.category === selectedCategory)?.themes || []
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Статьи ({articles.length})</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGenerator(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            🤖 Автогенерация
          </button>
          <button
            onClick={() => {
              setForm(emptyForm);
              setEditingId(null);
              setShowForm(true);
            }}
            className="btn-primary text-sm"
          >
            + Добавить статью
          </button>
        </div>
      </div>

      {/* AI Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                🤖 Автогенерация статьи
                {aiStatus.yandexGPT && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    YandexGPT
                  </span>
                )}
                {aiStatus.gigaChat && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    GigaChat
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowGenerator(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория
                </label>
                <select
                  className="select-field"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedTopic("");
                  }}
                >
                  <option value="">Случайная</option>
                  {topics.map((t) => (
                    <option key={t.category} value={t.category}>
                      {t.category.charAt(0).toUpperCase() + t.category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Готовая тема
                  </label>
                  <select
                    className="select-field"
                    value={selectedTopic}
                    onChange={(e) => {
                      setSelectedTopic(e.target.value);
                      setCustomTopic("");
                    }}
                  >
                    <option value="">Случайная из категории</option>
                    {filteredThemes.map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Или своя тема
                </label>
                <input
                  className="input-field"
                  value={customTopic}
                  onChange={(e) => {
                    setCustomTopic(e.target.value);
                    setSelectedTopic("");
                  }}
                  placeholder="Введите свою тему статьи"
                />
              </div>

              <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm">
                <p className="font-medium mb-1">ℹ️ Как это работает:</p>
                <ul className="text-xs space-y-1">
                  <li>• Статья генерируется {aiStatus.yandexGPT || aiStatus.gigaChat ? "с помощью AI" : "по качественному шаблону"}</li>
                  <li>• Автоматически создаются SEO-теги</li>
                  <li>• Статья сохраняется как черновик</li>
                  <li>• Проверьте и опубликуйте вручную</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowGenerator(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <span className="animate-spin">⏳</span> Генерация...
                  </>
                ) : (
                  <>✨ Сгенерировать</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl m-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">
                {editingId ? "Редактировать статью" : "Новая статья"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Заголовок
                </label>
                <input
                  className="input-field"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  required
                  placeholder="Заголовок статьи"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Краткое описание
                </label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => updateField("excerpt", e.target.value)}
                  placeholder="Краткое описание для списка статей"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Содержание
                </label>
                <textarea
                  className="input-field"
                  rows={12}
                  value={form.content}
                  onChange={(e) => updateField("content", e.target.value)}
                  required
                  placeholder="Текст статьи..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title (SEO)
                  </label>
                  <input
                    className="input-field"
                    value={form.metaTitle}
                    onChange={(e) => updateField("metaTitle", e.target.value)}
                    placeholder="SEO заголовок"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL обложки
                  </label>
                  <input
                    className="input-field"
                    value={form.coverImage}
                    onChange={(e) => updateField("coverImage", e.target.value)}
                    placeholder="/images/article.jpg или https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description (SEO)
                </label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={form.metaDescription}
                  onChange={(e) => updateField("metaDescription", e.target.value)}
                  placeholder="SEO описание для поисковых систем"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => updateField("isPublished", e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Опубликовать</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary disabled:opacity-50"
                >
                  {saving ? "Сохранение..." : editingId ? "Сохранить" : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Загрузка...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-3xl mb-3">📰</p>
          <p className="text-gray-500">Нет статей</p>
          <p className="text-gray-400 text-sm">
            Добавьте первую статью или используйте автогенерацию
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Заголовок</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Дата</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Статус</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Действия</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr
                    key={article.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">{article.title}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(article.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          article.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {article.isPublished ? "Опубликовано" : "Черновик"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <a
                        href={`/articles/${article.slug}`}
                        target="_blank"
                        className="text-gray-400 hover:text-gray-600 text-sm"
                      >
                        👁
                      </a>
                      <button
                        onClick={() => handleEdit(article)}
                        className="text-primary hover:underline text-sm"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-red-500 hover:underline text-sm"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
