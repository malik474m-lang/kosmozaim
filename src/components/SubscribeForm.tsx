"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("Вы успешно подписались!");
        setEmail("");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Ошибка подписки");
      }
    } catch {
      setStatus("error");
      setMessage("Ошибка соединения");
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 mt-6">
      <h3 className="text-white font-semibold mb-2 text-sm">📬 Подпишитесь на рассылку</h3>
      <p className="text-gray-400 text-xs mb-3">
        Получайте лучшие предложения
      </p>

      {status === "success" ? (
        <div className="bg-green-500/20 text-green-400 px-3 py-2 rounded-lg text-xs">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ваш email"
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary mb-2"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-primary hover:bg-primary-dark text-white px-3 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
          >
            {status === "loading" ? "Подписка..." : "Подписаться"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="text-red-400 text-xs mt-2">{message}</p>
      )}
    </div>
  );
}
