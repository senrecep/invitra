import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { emit } from "@/lib/emit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const organizer = await prisma.organizer.update({ where: { id }, data: body });
  emit("organizer:updated", organizer);
  return NextResponse.json(organizer);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const organizer = await prisma.organizer.findUnique({ where: { id } });
  if (!organizer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (organizer.isDefault) return NextResponse.json({ error: "Cannot delete default organizer" }, { status: 400 });

  await prisma.organizer.delete({ where: { id } });
  emit("organizer:deleted", { id });
  return NextResponse.json({ ok: true });
}
