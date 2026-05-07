"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket-client";

export type TransportationType = "OWN_CAR" | "PUBLIC_TRANSPORT" | "REQUESTING_VEHICLE";

export interface Group {
  id: string;
  name: string;
  nameEn: string | null;
  isDefault: boolean;
  order: number;
  createdAt: string;
}

export interface Organizer {
  id: string;
  name: string;
  token: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Guest {
  id: string;
  fullName: string;
  potentialCount: number;
  confirmedCount: number;
  transportation: TransportationType;
  groupId: string | null;
  organizerId: string | null;
  group: Group | null;
  organizer: Organizer | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: number;
  capacity: number;
  editingEnabled: boolean;
  eventName?: string | null;
  eventDescription?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  locale: string;
  timezone: string;
}

export interface Session {
  type: "admin" | "organizer";
  organizerId?: string;
  organizerName?: string;
  token?: string;
}

interface AppContextValue {
  session: Session | null;
  settings: Settings | null;
  groups: Group[];
  organizers: Organizer[];
  guests: Guest[];
  isLoading: boolean;
  refreshGuests: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children, initialSession }: { children: React.ReactNode; initialSession: Session | null }) {
  const [session] = useState<Session | null>(initialSession);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    if (res.ok) setSettings(await res.json());
  }, []);

  const fetchGroups = useCallback(async () => {
    const res = await fetch("/api/groups");
    if (res.ok) setGroups(await res.json());
  }, []);

  const fetchOrganizers = useCallback(async () => {
    const res = await fetch("/api/organizers");
    if (res.ok) setOrganizers(await res.json());
  }, []);

  const refreshGuests = useCallback(async () => {
    const res = await fetch("/api/guests");
    if (res.ok) setGuests(await res.json());
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchSettings(), fetchGroups(), fetchOrganizers(), refreshGuests()]);
    setIsLoading(false);
  }, [fetchSettings, fetchGroups, fetchOrganizers, refreshGuests]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Socket.io real-time updates
  useEffect(() => {
    const socket = getSocket();

    socket.on("guest:created", (guest: Guest) => {
      setGuests((prev) => [guest, ...prev]);
    });
    socket.on("guest:updated", (guest: Guest) => {
      setGuests((prev) => prev.map((g) => (g.id === guest.id ? guest : g)));
    });
    socket.on("guest:deleted", ({ id }: { id: string }) => {
      setGuests((prev) => prev.filter((g) => g.id !== id));
    });
    socket.on("settings:updated", (s: Settings) => setSettings(s));
    socket.on("group:created", (g: Group) => setGroups((prev) => [...prev, g]));
    socket.on("group:updated", (g: Group) => setGroups((prev) => prev.map((x) => (x.id === g.id ? g : x))));
    socket.on("group:deleted", ({ id }: { id: string }) => setGroups((prev) => prev.filter((x) => x.id !== id)));
    socket.on("organizer:created", (o: Organizer) => setOrganizers((prev) => [...prev, o]));
    socket.on("organizer:updated", (o: Organizer) => setOrganizers((prev) => prev.map((x) => (x.id === o.id ? o : x))));
    socket.on("organizer:deleted", ({ id }: { id: string }) => setOrganizers((prev) => prev.filter((x) => x.id !== id)));

    return () => {
      socket.off("guest:created");
      socket.off("guest:updated");
      socket.off("guest:deleted");
      socket.off("settings:updated");
      socket.off("group:created");
      socket.off("group:updated");
      socket.off("group:deleted");
      socket.off("organizer:created");
      socket.off("organizer:updated");
      socket.off("organizer:deleted");
    };
  }, []);

  return (
    <AppContext.Provider value={{ session, settings, groups, organizers, guests, isLoading, refreshGuests, refreshAll }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
