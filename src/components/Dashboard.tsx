"use client";

import { useState, useMemo } from "react";
import { formatDate } from "@/lib/locale";
import { useApp } from "@/contexts/AppContext";
import { useTranslations } from "next-intl";

function ChevronUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

export default function Dashboard() {
  const { settings, guests, groups, organizers, isLoading } = useApp();
  const t = useTranslations("dashboard");
  const [open, setOpen] = useState(true);

  const stats = useMemo(() => {
    const totalGuests = guests.length;
    const totalPotential = guests.reduce((sum, g) => sum + g.potentialCount, 0);
    const totalConfirmed = guests.reduce((sum, g) => sum + g.confirmedCount, 0);
    const capacity = settings?.capacity ?? 150;

    const byGroup = groups
      .filter((grp) => !grp.isDefault)
      .map((grp) => {
        const grpGuests = guests.filter((g) => g.groupId === grp.id);
        return {
          id: grp.id,
          name: grp.name,
          guestCount: grpGuests.length,
          potentialCount: grpGuests.reduce((s, g) => s + g.potentialCount, 0),
          confirmedCount: grpGuests.reduce((s, g) => s + g.confirmedCount, 0),
        };
      })
      .filter((g) => g.guestCount > 0);

    const byOrganizer = organizers
      .filter((org) => !org.isDefault)
      .map((org) => {
        const orgGuests = guests.filter((g) => g.organizerId === org.id);
        return {
          id: org.id,
          name: org.name,
          guestCount: orgGuests.length,
          potentialCount: orgGuests.reduce((s, g) => s + g.potentialCount, 0),
          confirmedCount: orgGuests.reduce((s, g) => s + g.confirmedCount, 0),
        };
      })
      .filter((o) => o.guestCount > 0);

    const transportationMap: Record<string, { label: string; count: number; potentialCount: number }> = {
      OWN_CAR:            { label: "Kendi Aracı",  count: 0, potentialCount: 0 },
      PUBLIC_TRANSPORT:   { label: "Toplu Ulaşım", count: 0, potentialCount: 0 },
      REQUESTING_VEHICLE: { label: "Araç Talep",   count: 0, potentialCount: 0 },
    };
    for (const g of guests) {
      const key = g.transportation ?? "OWN_CAR";
      if (transportationMap[key]) {
        transportationMap[key].count += 1;
        transportationMap[key].potentialCount += g.potentialCount;
      }
    }
    const byTransportation = Object.entries(transportationMap).filter(([, v]) => v.count > 0);

    return { totalGuests, totalPotential, totalConfirmed, capacity, byGroup, byOrganizer, byTransportation };
  }, [guests, groups, organizers, settings]);

  const fillPercent = Math.min(100, Math.round((stats.totalPotential / stats.capacity) * 100));

  const barColor =
    fillPercent >= 90 ? "bg-red-500" : fillPercent >= 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_6px_rgba(124,58,237,0.08)] border border-violet-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-700 to-purple-600 text-white min-h-[52px] cursor-pointer"
      >
        <span className="font-semibold text-sm">{t("title")}</span>
        {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      {open && (
        <div className="px-4 py-4 space-y-4">
          {/* Event info banner */}
          {settings?.eventName && (
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl px-4 py-3 border border-violet-100 space-y-1">
              <p className="text-base font-bold text-violet-800 leading-tight">{settings.eventName}</p>
              {settings.eventDescription && (
                <p className="text-xs text-slate-500 leading-snug">{settings.eventDescription}</p>
              )}
              {(settings.eventDate || settings.eventTime) && (
                <div className="flex items-center gap-2 pt-0.5">
                  {settings.eventDate && (
                    <span className="text-xs font-semibold text-violet-600">
                      {formatDate(settings.eventDate, { day: "numeric", month: "long", year: "numeric" }, settings.locale, settings.timezone)}
                    </span>
                  )}
                  {settings.eventDate && settings.eventTime && <span className="text-violet-300">·</span>}
                  {settings.eventTime && (
                    <span className="text-xs font-semibold text-violet-600">{settings.eventTime}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-violet-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-violet-700">{stats.totalGuests}</p>
                  <p className="text-xs text-violet-500 mt-0.5 leading-tight">{t("totalGuests")}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-amber-700">{stats.totalPotential}</p>
                  <p className="text-xs text-amber-500 mt-0.5 leading-tight">{t("totalPotential")}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{stats.totalConfirmed}</p>
                  <p className="text-xs text-emerald-500 mt-0.5 leading-tight">{t("totalConfirmed")}</p>
                </div>
              </div>

              {/* Capacity bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-600">{t("capacityUsage")}</p>
                  <p className="text-xs text-slate-400">
                    {stats.totalPotential} {t("of")} {stats.capacity} ({fillPercent}%)
                  </p>
                </div>
                <div className="h-2.5 bg-violet-50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
              </div>

              {/* By Group */}
              {stats.byGroup.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide">{t("byGroup")}</p>
                  <div className="space-y-1.5">
                    {stats.byGroup.map((g) => (
                      <div key={g.id} className="flex items-center gap-2 bg-violet-50/50 rounded-xl px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{g.name}</p>
                        </div>
                        <div className="flex gap-3 text-xs text-slate-500 shrink-0">
                          <span className="text-violet-600 font-medium">{g.guestCount} {t("guests")}</span>
                          <span>{g.potentialCount} {t("potential")}</span>
                          <span className="text-emerald-600">{g.confirmedCount} {t("confirmed")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* By Organizer */}
              {stats.byOrganizer.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide">{t("byOrganizer")}</p>
                  <div className="space-y-1.5">
                    {stats.byOrganizer.map((o) => (
                      <div key={o.id} className="flex items-center gap-2 bg-violet-50/50 rounded-xl px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{o.name}</p>
                        </div>
                        <div className="flex gap-3 text-xs text-slate-500 shrink-0">
                          <span className="text-violet-600 font-medium">{o.guestCount} {t("guests")}</span>
                          <span>{o.potentialCount} {t("potential")}</span>
                          <span className="text-emerald-600">{o.confirmedCount} {t("confirmed")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* By Transportation */}
              {stats.byTransportation.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide">{t("byTransportation")}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {stats.byTransportation.map(([key, { label, count, potentialCount }]) => {
                      const colors: Record<string, { bg: string; text: string; sub: string; dot: string }> = {
                        OWN_CAR:            { bg: "bg-sky-50",    text: "text-sky-700",    sub: "text-sky-500",    dot: "bg-sky-400" },
                        PUBLIC_TRANSPORT:   { bg: "bg-amber-50",  text: "text-amber-700",  sub: "text-amber-500",  dot: "bg-amber-400" },
                        REQUESTING_VEHICLE: { bg: "bg-rose-50",   text: "text-rose-700",   sub: "text-rose-500",   dot: "bg-rose-400" },
                      };
                      const c = colors[key] ?? { bg: "bg-slate-50", text: "text-slate-700", sub: "text-slate-500", dot: "bg-slate-400" };
                      return (
                        <div key={key} className={`${c.bg} rounded-xl p-3 text-center`}>
                          <p className={`text-xl font-bold ${c.text}`}>{count}</p>
                          <p className={`text-xs mt-0.5 leading-tight font-medium ${c.sub}`}>{label}</p>
                          <p className={`text-xs mt-1 ${c.sub} opacity-70`}>{potentialCount} kişi</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
