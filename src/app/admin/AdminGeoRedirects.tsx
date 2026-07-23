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
  { code: "RU", name: "Россия" },
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

function getFlagEmoji(cc: string): string {
  if (cc === "*") return "🌍";
  return String.fromCodePoint(
    ...cc
      .toUpperCase()
      .split("")
      .map((c) => 127397 + c.charCodeAt(0))
  );
}

export default function AdminGeoRedirects() {
  const [redirects, setRedirects] = useState<GeoRedirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<
    "wildcard" | "exclude" | "specific"
  >("specific");
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
      if (res.ok) setRedirects(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handlePresetSelect(code: string) {
    const p = COUNTRY_PRESETS.find((x) => x.code === code);
    if (p)
      setFormData((prev) => ({
        ...prev,
        countryCode: p.code,
        countryName: p.name,
      }));
  }

  function handleModeChange(mode: "wildcard" | "exclude" | "specific") {
    setFormMode(mode);
    if (mode === "wildcard")
      setFormData((p) => ({
        ...p,
        countryCode: "*",
        countryName: "Все страны",
      }));
    else if (mode === "exclude")
      setFormData((p) => ({
        ...p,
        countryCode: "",
        countryName: "",
        redirectUrl: "",
      }));
    else setFormData((p) => ({ ...p, countryCode: "", countryName: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId
        ? "/api/admin/geo-redirects/" + editingId
        : "/api/admin/geo-redirects";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await loadRedirects();
        resetForm();
      } else {
        const err = await res.json();
        alert(err.error || "Ошибка");
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить?")) return;
    try {
      const res = await fetch("/api/admin/geo-redirects/" + id, {
        method: "DELETE",
      });
      if (res.ok) await loadRedirects();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleToggleActive(r: GeoRedirect) {
    try {
      const res = await fetch("/api/admin/geo-redirects/" + r.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...r, isActive: !r.isActive }),
      });
      if (res.ok) await loadRedirects();
    } catch (e) {
      console.error(e);
    }
  }

  function handleEdit(r: GeoRedirect) {
    setEditingId(r.id);
    setFormMode(
      r.countryCode === "*"
        ? "wildcard"
        : !r.redirectUrl || !r.redirectUrl.trim()
          ? "exclude"
          : "specific"
    );
    setFormData({
      countryCode: r.countryCode,
      countryName: r.countryName,
      redirectUrl: r.redirectUrl,
      isActive: r.isActive,
    });
    setShowForm(true);
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setFormMode("specific");
    setFormData({
      countryCode: "",
      countryName: "",
      redirectUrl: "",
      isActive: true,
    });
  }

  const wildcardRule = redirects.find((r) => r.countryCode === "*");
  const exceptions = redirects.filter(
    (r) => r.countryCode !== "*" && (!r.redirectUrl || !r.redirectUrl.trim())
  );
  const specificRules = redirects.filter(
    (r) => r.countryCode !== "*" && r.redirectUrl && r.redirectUrl.trim()
  );

  if (loading) return <div className="text-center py-8">Загрузка...</div>;

  const modeBtn = (
    m: "wildcard" | "exclude" | "specific",
    icon: string,
    label: string
  ) => (
    <button
      type="button"
      onClick={() => handleModeChange(m)}
      className={
        "px-4 py-2 rounded-lg text-sm font-medium " +
        (formMode === m
          ? "bg-primary text-white"
          : "bg-gray-200 text-gray-700")
      }
    >
      {icon} {label}
    </button>
  );

  const statusBtn = (r: GeoRedirect) => (
    <button
      onClick={() => handleToggleActive(r)}
      className={
        "px-3 py-1 rounded-full text-xs font-medium " +
        (r.isActive
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500")
      }
    >
      {r.isActive ? "Активен" : "Выключен"}
    </button>
  );

  const actionBtns = (r: GeoRedirect) => (
    <>
      <button
        onClick={() => handleEdit(r)}
        className="text-primary hover:underline text-sm mr-3"
      >
        Изменить
      </button>
      <button
        onClick={() => handleDelete(r.id)}
        className="text-red-600 hover:underline text-sm"
      >
        Удалить
      </button>
    </>
  );

  const countryCell = (r: GeoRedirect) => (
    <div className="flex items-center gap-2">
      <span className="text-xl">{getFlagEmoji(r.countryCode)}</span>
      <span className="font-medium">{r.countryName || r.countryCode}</span>
      <span className="text-xs text-gray-400">{r.countryCode}</span>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Гео-редиректы</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) resetForm();
          }}
          className="btn-primary text-sm"
        >
          {showForm ? "Отмена" : "+ Добавить правило"}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Как это работает:</strong>
        </p>
        <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
          <li>
            <strong>Все кроме исключений</strong> — все страны редиректятся,
            кроме исключений
          </li>
          <li>
            <strong>Исключение</strong> — страна НЕ редиректится (например RU)
          </li>
          <li>
            <strong>Конкретная страна</strong> — только эта страна редиректится
            на свой URL
          </li>
        </ul>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 rounded-lg p-6 mb-6"
        >
          <h3 className="font-semibold mb-4">
            {editingId ? "Редактировать" : "Новое правило"}
          </h3>
          <div className="flex gap-2 mb-4">
            {modeBtn("wildcard", "🌍", "Все кроме исключений")}
            {modeBtn("exclude", "🛡️", "Исключение")}
            {modeBtn("specific", "🎯", "Конкретная страна")}
          </div>

          {formMode !== "wildcard" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Код страны *
                </label>
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
                    placeholder="RU"
                    maxLength={2}
                    className="input-field w-20"
                    required
                  />
                  <select
                    onChange={(e) => handlePresetSelect(e.target.value)}
                    className="select-field flex-1"
                    value=""
                  >
                    <option value="">Выбрать...</option>
                    {COUNTRY_PRESETS.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Название страны
                </label>
                <input
                  type="text"
                  value={formData.countryName}
                  onChange={(e) =>
                    setFormData({ ...formData, countryName: e.target.value })
                  }
                  placeholder="Россия"
                  className="input-field"
                />
              </div>
            </div>
          )}

          {formMode !== "exclude" && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                URL для редиректа *
              </label>
              <input
                type="url"
                value={formData.redirectUrl}
                onChange={(e) =>
                  setFormData({ ...formData, redirectUrl: e.target.value })
                }
                placeholder="https://example.com/"
                className="input-field"
                required
              />
            </div>
          )}

          {formMode === "exclude" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                Пользователи из этой страны <strong>не будут</strong>{" "}
                перенаправлены
              </p>
            </div>
          )}

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
              <span className="text-sm">Активно</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "..." : editingId ? "Сохранить" : "Добавить"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {redirects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Гео-редиректы не настроены</p>
        </div>
      ) : (
        <div className="space-y-6">
          {wildcardRule && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Общее правило
              </h3>
              <div
                className={
                  "border rounded-lg p-4 " +
                  (wildcardRule.isActive
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200")
                }
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🌍</span>
                    <div>
                      <div className="font-semibold">
                        Все страны →{" "}
                        <a
                          href={wildcardRule.redirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {wildcardRule.redirectUrl}
                        </a>
                      </div>
                      <div className="text-xs text-gray-500">
                        Кроме исключений ({exceptions.length} шт.)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBtn(wildcardRule)}
                    {actionBtns(wildcardRule)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {exceptions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                🛡️ Исключения
              </h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Страна</th>
                    <th className="text-center py-2 px-2">Статус</th>
                    <th className="text-right py-2 px-2">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {exceptions.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{countryCell(r)}</td>
                      <td className="py-2 px-2 text-center">{statusBtn(r)}</td>
                      <td className="py-2 px-2 text-right">
                        {actionBtns(r)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {specificRules.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                🎯 Конкретные страны
              </h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Страна</th>
                    <th className="text-left py-2 px-2">URL</th>
                    <th className="text-center py-2 px-2">Статус</th>
                    <th className="text-right py-2 px-2">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {specificRules.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{countryCell(r)}</td>
                      <td className="py-2 px-2">
                        <a
                          href={r.redirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm break-all"
                        >
                          {r.redirectUrl}
                        </a>
                      </td>
                      <td className="py-2 px-2 text-center">{statusBtn(r)}</td>
                      <td className="py-2 px-2 text-right">
                        {actionBtns(r)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
