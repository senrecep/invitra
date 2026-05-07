"use client";

import { AppProvider, Session, useApp } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import SettingsPanel from "@/components/SettingsPanel";
import Dashboard from "@/components/Dashboard";
import GuestList from "@/components/GuestList";

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function AppHeader({ session }: { session: Session }) {
  const t = useTranslations("auth");
  const ts = useTranslations("settings");
  const { settings } = useApp();
  const router = useRouter();

  const displayName =
    session.type === "admin" ? t("adminPanel") : (session.organizerName ?? "");

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-stone-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <img src="/icon.png" alt="Invitra" className="w-8 h-8 rounded-lg" />
          <span className="text-base font-bold text-slate-900">Invitra</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 truncate max-w-[130px]">{displayName}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-600 font-medium hover:text-slate-800 transition-colors min-h-[44px] px-2 cursor-pointer"
          >
            {t("logout")}
          </button>
        </div>
      </div>
      {settings?.editingEnabled === false && (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center gap-2 text-sm font-medium">
          <LockIcon />
          <span>{ts("editingDisabled")} — {ts("editingToggleHelp")}</span>
        </div>
      )}
    </header>
  );
}

function AppContent({ session }: { session: Session }) {
  return (
    <div className="max-w-2xl mx-auto pb-20">
      <AppHeader session={session} />
      <div className="px-4 pt-4 space-y-4">
        {session.type === "admin" && <SettingsPanel />}
        <Dashboard />
        <GuestList />
      </div>
    </div>
  );
}

export default function AppClient({ session }: { session: Session }) {
  return (
    <AppProvider initialSession={session}>
      <AppContent session={session} />
    </AppProvider>
  );
}
