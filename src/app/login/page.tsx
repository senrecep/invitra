"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/app");
      router.refresh();
    } else {
      setError(t("wrongPassword"));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-rose-50/30 to-stone-100 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/icon.png" alt="Invitra" className="w-16 h-16 rounded-2xl mb-4 shadow-lg shadow-slate-200" />
          <h1 className="text-2xl font-bold text-slate-900">Invitra</h1>
          <p className="text-stone-400 mt-1 text-sm">Davet Yönetim Sistemi</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-5">{t("adminPanel")}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent text-sm bg-white"
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 text-white py-2.5 px-4 rounded-xl font-medium text-sm hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? "..." : t("login")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
