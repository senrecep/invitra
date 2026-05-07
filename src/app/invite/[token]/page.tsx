"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 text-amber-400 mx-auto mb-3" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

export default function InvitePage() {
  const t = useTranslations("invite");
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [organizer, setOrganizer] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setOrganizer(data.organizer))
      .catch(() => setError(t("invalidLink")))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleJoin() {
    setJoining(true);
    const res = await fetch(`/api/invite/${token}`, { method: "POST" });
    if (res.ok) {
      router.push("/app");
      router.refresh();
    } else {
      setError(t("loginFailed"));
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <WarningIcon />
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-rose-50/30 to-stone-100 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/icon.png" alt="Invitra" className="w-16 h-16 rounded-2xl mb-4 shadow-lg shadow-slate-200" />
          <h1 className="text-2xl font-bold text-slate-900">Invitra</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 text-center">
          <p className="text-slate-500 text-sm mb-2">{t("welcomeAs")}</p>
          <p className="text-xl font-bold text-slate-900 mb-6">{organizer?.name}</p>
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full bg-slate-800 text-white py-3 px-4 rounded-xl font-medium hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
          >
            {joining ? "..." : t("continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
