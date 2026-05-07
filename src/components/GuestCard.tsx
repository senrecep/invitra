"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useTranslations } from "next-intl";
import { Guest, TransportationType } from "@/contexts/AppContext";

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
    </svg>
  );
}

function BusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM18 11H6V6h12v5z" />
    </svg>
  );
}

function VanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M20 8h-3L15 4H9L7 8H4C2.9 8 2 8.9 2 10v5c0 .55.45 1 1 1h1c0 1.11.9 2 2 2s2-.89 2-2h8c0 1.11.9 2 2 2s2-.89 2-2h1c.55 0 1-.45 1-1v-4l-2-4zM6 16.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zm12 0c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM9 8l1.5-3h3L15 8H9z" />
    </svg>
  );
}

import { formatRelativeDate } from "@/lib/locale";

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 shrink-0" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 shrink-0" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
    </svg>
  );
}


const TRANSPORT_META: Record<TransportationType, { icon: React.ReactNode; label: string; color: string }> = {
  OWN_CAR: { icon: <CarIcon />, label: "Kendi Aracı", color: "text-blue-600 bg-blue-50" },
  PUBLIC_TRANSPORT: { icon: <BusIcon />, label: "Toplu Ulaşım", color: "text-teal-600 bg-teal-50" },
  REQUESTING_VEHICLE: { icon: <VanIcon />, label: "Araç Talep", color: "text-orange-600 bg-orange-50" },
};

const GROUP_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-purple-100 text-purple-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-pink-100 text-pink-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-teal-100 text-teal-700",
  "bg-sky-100 text-sky-700",
];

function groupColor(groupId: string | null): string {
  if (!groupId) return "bg-slate-100 text-slate-600";
  let hash = 0;
  for (let i = 0; i < groupId.length; i++) hash = (hash * 31 + groupId.charCodeAt(i)) | 0;
  return GROUP_COLORS[Math.abs(hash) % GROUP_COLORS.length];
}

interface GuestCardProps {
  guest: Guest;
  onEdit: () => void;
}

export default function GuestCard({ guest, onEdit }: GuestCardProps) {
  const { session, settings, refreshAll } = useApp();
  const tc = useTranslations("common");
  const t = useTranslations("settings");

  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canEdit =
    session?.type === "admin" ||
    (session?.type === "organizer" && guest.createdBy === session.organizerId);

  const transport = TRANSPORT_META[guest.transportation];

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/guests/${guest.id}`, { method: "DELETE" });
    setShowDeleteConfirm(false);
    await refreshAll();
    setDeleting(false);
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(124,58,237,0.07)] border border-violet-100 px-4 py-3 space-y-2">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-base font-semibold text-slate-900 leading-tight">{guest.fullName}</p>
          <span
            className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${groupColor(guest.groupId)}`}
          >
            {guest.group?.name ?? "Varsayılan"}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          {guest.organizer && (
            <span className="text-xs text-slate-400">{guest.organizer.name}</span>
          )}
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${transport.color}`}>
            {transport.icon}
            {transport.label}
          </span>
        </div>

        {/* Count row */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Potansiyel</span>
            <span className="text-sm font-bold text-amber-600">{guest.potentialCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Kesin</span>
            <span className="text-sm font-bold text-emerald-600">{guest.confirmedCount}</span>
          </div>

          {/* Actions */}
          {canEdit && (
            <div className="ml-auto flex gap-2">
              <button
                onClick={onEdit}
                className="text-xs text-violet-600 hover:text-violet-800 font-medium min-h-[36px] px-2 cursor-pointer"
              >
                {tc("edit")}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-red-500 hover:text-red-700 font-medium min-h-[36px] px-2 cursor-pointer"
              >
                {tc("delete")}
              </button>
            </div>
          )}
        </div>

        {/* Date footer */}
        {(() => {
          const isEdited = new Date(guest.updatedAt).getTime() - new Date(guest.createdAt).getTime() > 60000;
          return (
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-violet-50 text-slate-400">
              <ClockIcon />
              <span className="text-xs">{formatRelativeDate(guest.createdAt, settings?.locale, settings?.timezone)}</span>
              {isEdited && (
                <>
                  <span className="text-xs text-slate-300 mx-0.5">·</span>
                  <PencilIcon />
                  <span className="text-xs text-violet-400">{formatRelativeDate(guest.updatedAt, settings?.locale, settings?.timezone)}</span>
                </>
              )}
            </div>
          );
        })()}
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 pb-6">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-violet-100 p-5 space-y-4">
            <p className="text-sm text-slate-700 text-center">{t("deleteConfirm")}</p>
            <p className="text-center font-semibold text-slate-900">{guest.fullName}</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-60 min-h-[44px] cursor-pointer"
              >
                {deleting ? "..." : tc("delete")}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 min-h-[44px] cursor-pointer"
              >
                {tc("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
