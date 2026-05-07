import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { emit } from "@/lib/emit";

export async function GET() {
  const organizers = await prisma.organizer.findMany({
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(organizers);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const organizer = await prisma.organizer.create({ data: { name: name.trim() } });
  emit("organizer:created", organizer);
  return NextResponse.json(organizer, { status: 201 });
}
