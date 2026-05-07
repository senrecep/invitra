import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { emit } from "@/lib/emit";

async function getOrCreateSettings() {
  return prisma.eventSettings.upsert({
    where: { id: 1 },
    create: { id: 1, capacity: 150, editingEnabled: true },
    update: {},
  });
}

export async function GET() {
  const settings = await getOrCreateSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const settings = await prisma.eventSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...body },
    update: body,
  });

  emit("settings:updated", settings);
  return NextResponse.json(settings);
}
