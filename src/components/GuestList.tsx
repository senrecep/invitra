"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { useTranslations } from "next-intl";
import { Guest } from "@/contexts/AppContext";
import GuestCard from "@/components/GuestCard";
import AddGuestModal from "@/components/AddGuestModal";
import { formatDateLabel } from "@/lib/locale";

type ViewMode = "all" | "byGroup" | "byOrganizer" | "byDate";

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

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

interface CollapsibleSectionProps {
  sectionKey: string;
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  label,
  count,
  open,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between cursor-pointer py-1"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-800">{label}</span>
          <span className="bg-stone-100 text-stone-600 text-xs rounded-full px-2 py-0.5 font-medium">
            {count}
          </span>
        </div>
        <span className="text-slate-400">{open ? <ChevronUpIcon /> : <ChevronDownIcon />}</span>
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}

export default function GuestList() {
  const { guests, settings, isLoading } = useApp();
  const t = useTranslations("guests");
  const tc = useTranslations("common");

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const filtered = useMemo(
    () =>
      guests.filter((g) =>
        g.fullName.toLowerCase().includes(search.toLowerCase())
      ),
    [guests, search]
  );

  const sortedFiltered = useMemo(
    () => [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [filtered]
  );

  const groupedByGroup = useMemo(() => {
    const map = new Map<string, { label: string; guests: Guest[] }>();
    for (const g of sortedFiltered) {
      const key = g.groupId ?? "__ungrouped__";
      const label = g.group?.name ?? "Grupsuz";
      if (!map.has(key)) map.set(key, { label, guests: [] });
      map.get(key)!.guests.push(g);
    }
    const entries = [...map.entries()];
    const ungroupedIdx = entries.findIndex(([k]) => k === "__ungrouped__");
    if (ungroupedIdx > 0) {
      const [removed] = entries.splice(ungroupedIdx, 1);
      entries.push(removed);
    }
    return entries;
  }, [sortedFiltered]);

  const groupedByOrganizer = useMemo(() => {
    const map = new Map<string, { label: string; guests: Guest[] }>();
    for (const g of sortedFiltered) {
      const key = g.organizerId ?? "__unassigned__";
      const label = g.organizer?.name ?? "Organizatörsüz";
      if (!map.has(key)) map.set(key, { label, guests: [] });
      map.get(key)!.guests.push(g);
    }
    const entries = [...map.entries()];
    const unassignedIdx = entries.findIndex(([k]) => k === "__unassigned__");
    if (unassignedIdx > 0) {
      const [removed] = entries.splice(unassignedIdx, 1);
      entries.push(removed);
    }
    return entries;
  }, [sortedFiltered]);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, Guest[]>();
    for (const g of sortedFiltered) {
      const dateKey = g.createdAt.slice(0, 10);
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(g);
    }
    return [...map.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [sortedFiltered]);

  function toggleSection(key: string) {
    setOpenSections((prev) => ({
      ...prev,
      [key]: key in prev ? !prev[key] : false,
    }));
  }

  function isSectionOpen(key: string): boolean {
    return key in openSections ? openSections[key] : true;
  }

  const viewModes: { key: ViewMode; label: string }[] = [
    { key: "all", label: "Tümü" },
    { key: "byGroup", label: "Gruba Göre" },
    { key: "byOrganizer", label: "Organizatöre Göre" },
    { key: "byDate", label: "Tarihe Göre" },
  ];

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">
          {t("title")} <span className="text-slate-400 font-normal">({guests.length})</span>
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 active:scale-95 transition-all min-h-[44px] cursor-pointer shadow-sm shadow-orange-200"
        >
          <PlusIcon />
          {t("addGuest")}
        </button>
      </div>

      {/* View mode tabs */}
      <div className="bg-stone-100 rounded-xl p-1 flex gap-1 overflow-x-auto scrollbar-none">
        {viewModes.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setViewMode(key)}
            className={`shrink-0 sm:flex-1 text-xs font-medium px-3 py-1.5 sm:py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
              viewMode === key
                ? "bg-white text-slate-800 font-semibold shadow-sm shadow-stone-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={tc("search")}
        className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white placeholder:text-slate-400"
      />

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">{tc("noData")}</div>
      ) : viewMode === "all" ? (
        <div className="space-y-2">
          {sortedFiltered.map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onEdit={() => setEditGuest(guest)}
            />
          ))}
        </div>
      ) : viewMode === "byGroup" ? (
        <div className="space-y-4">
          {groupedByGroup.map(([key, { label, guests: sectionGuests }]) => (
            <CollapsibleSection
              key={key}
              sectionKey={key}
              label={label}
              count={sectionGuests.length}
              open={isSectionOpen(key)}
              onToggle={() => toggleSection(key)}
            >
              {sectionGuests.map((guest) => (
                <GuestCard
                  key={guest.id}
                  guest={guest}
                  onEdit={() => setEditGuest(guest)}
                />
              ))}
            </CollapsibleSection>
          ))}
        </div>
      ) : viewMode === "byOrganizer" ? (
        <div className="space-y-4">
          {groupedByOrganizer.map(([key, { label, guests: sectionGuests }]) => (
            <CollapsibleSection
              key={key}
              sectionKey={key}
              label={label}
              count={sectionGuests.length}
              open={isSectionOpen(key)}
              onToggle={() => toggleSection(key)}
            >
              {sectionGuests.map((guest) => (
                <GuestCard
                  key={guest.id}
                  guest={guest}
                  onEdit={() => setEditGuest(guest)}
                />
              ))}
            </CollapsibleSection>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map(([dateKey, sectionGuests]) => (
            <CollapsibleSection
              key={dateKey}
              sectionKey={dateKey}
              label={formatDateLabel(dateKey, settings?.locale, settings?.timezone)}
              count={sectionGuests.length}
              open={isSectionOpen(dateKey)}
              onToggle={() => toggleSection(dateKey)}
            >
              {sectionGuests.map((guest) => (
                <GuestCard
                  key={guest.id}
                  guest={guest}
                  onEdit={() => setEditGuest(guest)}
                />
              ))}
            </CollapsibleSection>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddGuestModal onClose={() => setShowAddModal(false)} />
      )}

      {editGuest && (
        <AddGuestModal
          guest={editGuest}
          onClose={() => setEditGuest(null)}
        />
      )}
    </div>
  );
}
