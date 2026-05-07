"use client";

import { useState } from "react";
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

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default function SettingsPanel() {
  const { settings, groups, organizers, refreshAll } = useApp();
  const t = useTranslations("settings");
  const tc = useTranslations("common");

  const [open, setOpen] = useState(false);

  const [eventName, setEventName] = useState(settings?.eventName ?? "");
  const [eventDescription, setEventDescription] = useState(settings?.eventDescription ?? "");
  const [eventDate, setEventDate] = useState(settings?.eventDate ?? "");
  const [eventTime, setEventTime] = useState(settings?.eventTime ?? "");
  const [locale, setLocale] = useState(settings?.locale ?? "tr-TR");
  const [timezone, setTimezone] = useState(settings?.timezone ?? "Europe/Istanbul");
  const [savingEvent, setSavingEvent] = useState(false);

  const [capacity, setCapacity] = useState(settings?.capacity ?? 150);
  const [savingCapacity, setSavingCapacity] = useState(false);
  const [togglingEditing, setTogglingEditing] = useState(false);

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupNameEn, setNewGroupNameEn] = useState("");
  const [addingGroup, setAddingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupNameEn, setEditGroupNameEn] = useState("");
  const [copiedGroupId, setCopiedGroupId] = useState<string | null>(null);

  const [newOrgName, setNewOrgName] = useState("");
  const [addingOrg, setAddingOrg] = useState(false);
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [editOrgName, setEditOrgName] = useState("");
  const [copiedOrgId, setCopiedOrgId] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "group" | "organizer"; id: string } | null>(null);

  async function saveEventInfo() {
    setSavingEvent(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: eventName.trim() || null,
        eventDescription: eventDescription.trim() || null,
        eventDate: eventDate || null,
        eventTime: eventTime || null,
        locale: locale || "tr-TR",
        timezone: timezone || "Europe/Istanbul",
      }),
    });
    await refreshAll();
    setSavingEvent(false);
  }

  async function saveCapacity() {
    setSavingCapacity(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ capacity: Number(capacity) }),
    });
    await refreshAll();
    setSavingCapacity(false);
  }

  async function toggleEditing() {
    setTogglingEditing(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editingEnabled: !settings?.editingEnabled }),
    });
    await refreshAll();
    setTogglingEditing(false);
  }

  async function addGroup() {
    if (!newGroupName.trim()) return;
    setAddingGroup(true);
    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName.trim(), nameEn: newGroupNameEn.trim() || null }),
    });
    setNewGroupName("");
    setNewGroupNameEn("");
    await refreshAll();
    setAddingGroup(false);
  }

  async function saveGroup(id: string) {
    await fetch(`/api/groups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editGroupName.trim(), nameEn: editGroupNameEn.trim() || null }),
    });
    setEditingGroupId(null);
    await refreshAll();
  }

  async function deleteGroup(id: string) {
    await fetch(`/api/groups/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    await refreshAll();
  }

  function copyGroupLink(groupId: string) {
    navigator.clipboard.writeText(`${window.location.origin}/app?group=${groupId}`);
    setCopiedGroupId(groupId);
    setTimeout(() => setCopiedGroupId(null), 2000);
  }

  async function addOrganizer() {
    if (!newOrgName.trim()) return;
    setAddingOrg(true);
    await fetch("/api/organizers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newOrgName.trim() }),
    });
    setNewOrgName("");
    await refreshAll();
    setAddingOrg(false);
  }

  async function saveOrganizer(id: string) {
    await fetch(`/api/organizers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editOrgName.trim() }),
    });
    setEditingOrgId(null);
    await refreshAll();
  }

  async function deleteOrganizer(id: string) {
    await fetch(`/api/organizers/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    await refreshAll();
  }

  function copyOrgLink(organizer: { id: string; token: string }) {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${organizer.token}`);
    setCopiedOrgId(organizer.id);
    setTimeout(() => setCopiedOrgId(null), 2000);
  }

  const inputCls = "w-full px-3 py-2 rounded-xl border border-violet-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white";
  const smallInputCls = "w-full px-2 py-1.5 rounded-lg border border-violet-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white";

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
        <div className="divide-y divide-violet-50">
          {/* Event Info */}
          <div className="px-4 py-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700">{t("eventInfo")}</p>
            <div className="space-y-2">
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder={t("eventName")}
                className={inputCls}
              />
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder={t("eventDescription")}
                rows={2}
                className={`${inputCls} resize-none`}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className={inputCls}
                />
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={locale} onChange={(e) => setLocale(e.target.value)} className={inputCls}>
                  <option value="tr-TR">Türkçe (tr-TR)</option>
                  <option value="en-US">English (en-US)</option>
                  <option value="en-GB">English UK (en-GB)</option>
                  <option value="de-DE">Deutsch (de-DE)</option>
                  <option value="fr-FR">Français (fr-FR)</option>
                  <option value="ar-SA">العربية (ar-SA)</option>
                </select>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputCls}>
                  <option value="Europe/Istanbul">Istanbul</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Berlin">Berlin</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="America/New_York">New York</option>
                  <option value="America/Los_Angeles">Los Angeles</option>
                  <option value="Asia/Dubai">Dubai</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
            </div>
            <button
              onClick={saveEventInfo}
              disabled={savingEvent}
              className="w-full py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-60 min-h-[44px] cursor-pointer"
            >
              {savingEvent ? "..." : tc("save")}
            </button>
          </div>

          {/* Capacity */}
          <div className="px-4 py-4 space-y-2">
            <p className="text-sm font-semibold text-slate-700">{t("capacity")}</p>
            <p className="text-xs text-slate-400">{t("capacityHelp")}</p>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className={inputCls}
              />
              <button
                onClick={saveCapacity}
                disabled={savingCapacity}
                className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-60 min-h-[44px] cursor-pointer"
              >
                {savingCapacity ? "..." : tc("save")}
              </button>
            </div>
          </div>

          {/* Editing Toggle */}
          <div className="px-4 py-4 space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              {settings?.editingEnabled ? t("editingEnabled") : t("editingDisabled")}
            </p>
            <p className="text-xs text-slate-400">{t("editingToggleHelp")}</p>
            <button
              onClick={toggleEditing}
              disabled={togglingEditing}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-60 min-h-[44px] cursor-pointer ${
                settings?.editingEnabled
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              {togglingEditing
                ? "..."
                : settings?.editingEnabled
                ? t("editingEnabled")
                : t("editingDisabled")}
            </button>
          </div>

          {/* Groups */}
          <div className="px-4 py-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700">{t("groups")}</p>
            <div className="space-y-2">
              {groups.map((group) => (
                <div key={group.id} className="flex items-center gap-2 bg-violet-50/50 rounded-xl px-3 py-2">
                  {editingGroupId === group.id ? (
                    <div className="flex-1 space-y-1">
                      <input value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)} className={smallInputCls} placeholder={t("groupName")} />
                      <input value={editGroupNameEn} onChange={(e) => setEditGroupNameEn(e.target.value)} className={smallInputCls} placeholder={t("groupNameEn")} />
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => saveGroup(group.id)} className="flex-1 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 min-h-[36px] cursor-pointer">{tc("save")}</button>
                        <button onClick={() => setEditingGroupId(null)} className="flex-1 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300 min-h-[36px] cursor-pointer">{tc("cancel")}</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{group.name}</p>
                        {group.isDefault && <p className="text-xs text-slate-400">{t("defaultGroup")}</p>}
                      </div>
                      <button
                        onClick={() => copyGroupLink(group.id)}
                        className="flex items-center justify-center text-violet-500 hover:text-violet-700 min-h-[36px] w-8 cursor-pointer"
                        title={t("linkCopied")}
                      >
                        {copiedGroupId === group.id ? <CheckIcon /> : <LinkIcon />}
                      </button>
                      {!group.isDefault && (
                        <>
                          <button onClick={() => { setEditingGroupId(group.id); setEditGroupName(group.name); setEditGroupNameEn(group.nameEn ?? ""); }} className="text-xs text-slate-500 hover:text-slate-700 min-h-[36px] px-2 cursor-pointer">{tc("edit")}</button>
                          <button onClick={() => setDeleteConfirm({ type: "group", id: group.id })} className="text-xs text-red-500 hover:text-red-700 min-h-[36px] px-2 cursor-pointer">{tc("delete")}</button>
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder={t("groupName")} className={inputCls} />
              <input value={newGroupNameEn} onChange={(e) => setNewGroupNameEn(e.target.value)} placeholder={t("groupNameEn")} className={inputCls} />
              <button onClick={addGroup} disabled={addingGroup || !newGroupName.trim()} className="w-full py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-60 min-h-[44px] cursor-pointer">
                {addingGroup ? "..." : t("addGroup")}
              </button>
            </div>
          </div>

          {/* Organizers */}
          <div className="px-4 py-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700">{t("organizers")}</p>
            <div className="space-y-2">
              {organizers.map((org) => (
                <div key={org.id} className="flex items-center gap-2 bg-violet-50/50 rounded-xl px-3 py-2">
                  {editingOrgId === org.id ? (
                    <div className="flex-1 space-y-1">
                      <input value={editOrgName} onChange={(e) => setEditOrgName(e.target.value)} className={smallInputCls} placeholder={t("organizerName")} />
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => saveOrganizer(org.id)} className="flex-1 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 min-h-[36px] cursor-pointer">{tc("save")}</button>
                        <button onClick={() => setEditingOrgId(null)} className="flex-1 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300 min-h-[36px] cursor-pointer">{tc("cancel")}</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{org.name}</p>
                        {org.isDefault && <p className="text-xs text-slate-400">{t("defaultOrganizer")}</p>}
                      </div>
                      <button
                        onClick={() => copyOrgLink(org)}
                        className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 min-h-[36px] px-1 cursor-pointer"
                      >
                        {copiedOrgId === org.id ? <CheckIcon /> : <LinkIcon />}
                        <span className="hidden sm:inline">{copiedOrgId === org.id ? t("linkCopied") : t("copyLink")}</span>
                      </button>
                      {!org.isDefault && (
                        <>
                          <button onClick={() => { setEditingOrgId(org.id); setEditOrgName(org.name); }} className="text-xs text-slate-500 hover:text-slate-700 min-h-[36px] px-2 cursor-pointer">{tc("edit")}</button>
                          <button onClick={() => setDeleteConfirm({ type: "organizer", id: org.id })} className="text-xs text-red-500 hover:text-red-700 min-h-[36px] px-2 cursor-pointer">{tc("delete")}</button>
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <input value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder={t("organizerName")} className={inputCls} />
              <button onClick={addOrganizer} disabled={addingOrg || !newOrgName.trim()} className="w-full py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-60 min-h-[44px] cursor-pointer">
                {addingOrg ? "..." : t("addOrganizer")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 pb-6">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-violet-100 p-5 space-y-4">
            <p className="text-sm text-slate-700 text-center">{t("deleteConfirm")}</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteConfirm.type === "group" ? deleteGroup(deleteConfirm.id) : deleteOrganizer(deleteConfirm.id)}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 min-h-[44px] cursor-pointer"
              >
                {tc("delete")}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 min-h-[44px] cursor-pointer"
              >
                {tc("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
