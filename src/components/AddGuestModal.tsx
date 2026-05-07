"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useTranslations } from "next-intl";
import { Guest, TransportationType } from "@/contexts/AppContext";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
    </svg>
  );
}

function BusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM18 11H6V6h12v5z" />
    </svg>
  );
}

function VanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M20 8h-3L15 4H9L7 8H4C2.9 8 2 8.9 2 10v5c0 .55.45 1 1 1h1c0 1.11.9 2 2 2s2-.89 2-2h8c0 1.11.9 2 2 2s2-.89 2-2h1c.55 0 1-.45 1-1v-4l-2-4zM6 16.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zm12 0c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM9 8l1.5-3h3L15 8H9z" />
    </svg>
  );
}

const TRANSPORT_OPTIONS: { type: TransportationType; icon: React.ReactNode; label: string }[] = [
  { type: "OWN_CAR", icon: <CarIcon />, label: "Kendi Aracı" },
  { type: "PUBLIC_TRANSPORT", icon: <BusIcon />, label: "Toplu Ulaşım" },
  { type: "REQUESTING_VEHICLE", icon: <VanIcon />, label: "Araç Talep" },
];

interface Props {
  guest?: Guest;
  onClose: () => void;
}

export default function AddGuestModal({ guest, onClose }: Props) {
  const { session, groups, organizers, refreshAll } = useApp();
  const t = useTranslations("guests");
  const tc = useTranslations("common");

  const isEdit = !!guest;

  const [fullName, setFullName] = useState(guest?.fullName ?? "");
  const [potentialCount, setPotentialCount] = useState(guest?.potentialCount ?? 1);
  const [confirmedCount, setConfirmedCount] = useState(guest?.confirmedCount ?? 0);
  const [groupId, setGroupId] = useState(guest?.groupId ?? "");
  const [organizerId, setOrganizerId] = useState(guest?.organizerId ?? "");
  const [transportation, setTransportation] = useState<TransportationType>(guest?.transportation ?? "OWN_CAR");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSaving(true);
    setError("");

    const body = {
      fullName: fullName.trim(),
      potentialCount: Number(potentialCount),
      confirmedCount: Number(confirmedCount),
      groupId: groupId || null,
      organizerId: organizerId || null,
      transportation,
    };

    try {
      const res = isEdit
        ? await fetch(`/api/guests/${guest.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/guests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const code = data?.error;
        setError(
          code === "EDITING_DISABLED" ? t("cannotEdit") :
          code === "FORBIDDEN" ? t("noPermission") :
          tc("error")
        );
        setSaving(false);
        return;
      }

      await refreshAll();
      onClose();
    } catch {
      setError(tc("error"));
      setSaving(false);
    }
  }

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200">
          <h2 className="text-base font-semibold text-slate-900">
            {isEdit ? tc("edit") : t("addGuest")}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer rounded-xl hover:bg-slate-100 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 pb-8">
          {/* Full name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">{t("fullName")}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("fullNamePlaceholder")}
              required
              className={inputCls}
            />
          </div>

          {/* Counts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">{t("potentialCount")}</label>
              <p className="text-xs text-slate-400">{t("potentialCountHelp")}</p>
              <input type="number" min={0} value={potentialCount} onChange={(e) => { const v = Number(e.target.value); setPotentialCount(v); if (confirmedCount > v) setConfirmedCount(v); }} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">{t("confirmedCount")}</label>
              <p className="text-xs text-slate-400">{t("confirmedCountHelp")}</p>
              <input type="number" min={0} max={potentialCount} value={confirmedCount} onChange={(e) => setConfirmedCount(Math.min(Number(e.target.value), potentialCount))} className={inputCls} />
            </div>
          </div>

          {/* Group */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">{t("group")}</label>
            <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className={inputCls}>
              <option value="">{t("noGroup")}</option>
              {groups.filter((g) => !g.isDefault).map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Organizer (admin only) */}
          {session?.type === "admin" && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">{t("organizer")}</label>
              <select value={organizerId} onChange={(e) => setOrganizerId(e.target.value)} className={inputCls}>
                <option value="">{t("noOrganizer")}</option>
                {organizers.filter((o) => !o.isDefault).map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Transportation */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">{t("transportation")}</label>
            <div className="grid grid-cols-3 gap-2">
              {TRANSPORT_OPTIONS.map(({ type, icon, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTransportation(type)}
                  className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 text-xs font-medium transition-all min-h-[72px] cursor-pointer ${
                    transportation === type
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-stone-200 bg-white text-slate-600 hover:border-rose-300"
                  }`}
                >
                  <span className={`mb-1.5 ${transportation === type ? "text-rose-600" : "text-slate-400"}`}>{icon}</span>
                  <span className="text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || !fullName.trim()}
            className="w-full py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-60 min-h-[52px] cursor-pointer shadow-sm shadow-orange-200"
          >
            {saving ? "..." : isEdit ? tc("save") : t("addGuest")}
          </button>
        </form>
      </div>
    </div>
  );
}
