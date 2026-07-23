"use client";

import { useState, useEffect } from "react";

interface GeoRedirect {
  id: number;
  countryCode: string;
  countryName: string;
  redirectUrl: string;
  isActive: boolean;
  createdAt: string;
}

const COUNTRY_PRESETS = [
  { code: "UA", name: "Украина" },
  { code: "BY", name: "Беларусь" },
  { code: "KZ", name: "Казахстан" },
  { code: "UZ", name: "Узбекистан" },
  { code: "AZ", name: "Азербайджан" },
  { code: "GE", name: "Грузия" },
  { code: "AM", name: "Армения" },
  { code: "MD", name: "Молдова" },
  { code: "KG", name: "Киргизия" },
  { code: "TJ", name: "Таджикистан" },
  { code: "DE", name: "Германия" },
  { code: "PL", name: "Польша" },
  { code: "US", name: "США" },
  { code: "GB", name: "Великобритания" },
];

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function AdminGeoRedirects() {
  const [redirects, setRedirects] = useState<GeoRedirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    countryCode: "",
    countryName: "",
    redirectUrl: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRedirects();
  }, []);

  async function loadRedirects() {
    try {
      const res = await fetch("/api/admin/geo-redirects");
      if (res.ok) {
        const data = await res.json();
        setRedirects(data);
      }
    } catch (error) {
      console.error("Error loading redirects:", error);
    } finally {
      setLoading(false);
    }
  }

  function handlePresetSelect(code: string) {
    const preset = COUNTRY_PRESETS.find((p) => p.code === code);
    if (preset) {
      setFormData((prev) => ({
        ...prev,
        countryCode: preset.code,
        countryName: preset.name,
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingId
        ? `/api/admin/geo-redirects/${editingId}`
        : "/api/admin/geo-redirects";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadRedirects();
        resetForm();
      } else {
        const error = await res.json();
        alert(error.error || "Ошибка сохранения");
      }
    } catch (error) {
      console.error("Error saving redirect:", error);
      alert("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить этот редирект?")) return;

    try {
      const res = await fetch(`/api/admin/geo-redirects/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadRedirects();
      }
    } catch (error) {
      console.error("Error deleting redirect:", error);
    }
  }

  async function handleToggleActive(redirect: GeoRedirect) {
    try {
      const res = await fetch(`/api/admin/geo-redirects/${redirect.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...redirect, isActive: !redirect.isActive }),
      });
      if (res.ok) {
        await loadRedirects();
      }
    } catch (error) {
      console.error("Error toggling redirect:", error);
    }
  }

  function handleEdit(redirect: GeoRedirect) {
    setEditingId(redirect.id);
    setFormData({
      countryCode: redirect.countryCode,
      countryName: redirect.countryName,
      redirectUrl: redirect.redirectUrl,
      isActive: redirect.isActive,
    });
    setShowForm(true);
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      countryCode: "",
      countryName: "",
      redirectUrl: "",
      isActive: true,
    });
  }

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Гео-редиректы</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm"
        >
          {showForm ? "Отмена" : "+ Добавить редирект"}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Как это работает:</strong> Когда пользователь из указанной
          страны заходит на сайт, он автоматически перенаправляется на указанный
          URL. Код страны — двухбуквенный ISO код (например: UA, BY, KZ).
        </p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4">
            {editingId ? "Редактировать редирект" : "Новый редирект"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Код страны *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.countryCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      countryCode: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="UA"
                  maxLength={2}
                  className="input-field w-20"
                  required
                />
                <select
                  onChange={(e) => handlePresetSelect(e.target.value)}
                  className="select-field flex-1"
                  value=""
                >
                  <option value="">Выбрать из списка...</option>
                  {COUNTRY_PRESETS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Название страны</label>
              <input
                type="text"
                value={formData.countryName}
                onChange={(e) =>
                  setFormData({ ...formData, countryName: e.target.value })
                }
                placeholder="Украина"
                className="input-field"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">URL для редиректа *</label>
            <input
              type="url"
              value={formData.redirectUrl}
              onChange={(e) =>
                setFormData({ ...formData, redirectUrl: e.target.value })
              }
              placeholder="https://example.com/ua/"
              className="input-field"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Полный URL, куда перенаправлять пользователей из этой страны
            </p>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm">Активен</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Сохранение..." : editingId ? "Сохранить" : "Добавить"}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Отмена
            </button>
          </div>
        </form>
      )}

      {redirects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Гео-редиректы не настроены</p>
          <p className="text-sm mt-1">
            Добавьте редирект, чтобы перенаправлять пользователей из других стран
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Страна</th>
                <th className="text-left py-3 px-2">URL редиректа</th>
                <th className="text-center py-3 px-2">Статус</th>
                <th className="text-right py-3 px-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {redirects.map((redirect) => (
                <tr key={redirect.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getFlagEmoji(redirect.countryCode)}</span>
                      <div>
                        <div className="font-medium">
                          {redirect.countryName || redirect.countryCode}
                        </div>
                        <div className="text-xs text-gray-500">{redirect.countryCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <a
                      href={redirect.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm break-all"
                    >
                      {redirect.redirectUrl}
                    </a>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => handleToggleActive(redirect)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        redirect.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {redirect.isActive ? "Активен" : "Выключен"}
                    </button>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => handleEdit(redirect)}
                      className="text-primary hover:underline text-sm mr-3"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDelete(redirect.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
