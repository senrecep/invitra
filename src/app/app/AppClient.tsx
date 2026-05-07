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

function EnvelopeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
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
    <header className="sticky top-0 z-30 bg-white border-b border-violet-100 shadow-[0_1px_4px_rgba(124,58,237,0.06)]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 text-white">
            <EnvelopeIcon />
          </div>
          <span className="text-base font-bold text-violet-950">Invitra</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 truncate max-w-[130px]">{displayName}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-violet-600 font-medium hover:text-violet-800 transition-colors min-h-[44px] px-2 cursor-pointer"
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
