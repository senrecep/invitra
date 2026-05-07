import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { emit } from "@/lib/emit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const guest = await prisma.guest.findUnique({ where: { id } });
  if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Permission check
  if (!isAdmin(session)) {
    const settings = await prisma.eventSettings.findUnique({ where: { id: 1 } });
    if (settings && !settings.editingEnabled) {
      return NextResponse.json({ error: "EDITING_DISABLED" }, { status: 403 });
    }
    if (session.type === "organizer" && guest.createdBy !== session.organizerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const body = await req.json();
  const updated = await prisma.guest.update({
    where: { id },
    data: body,
    include: { group: true, organizer: true },
  });

  const actorId = isAdmin(session) ? "admin" : (session.type === "organizer" ? session.organizerId : "unknown");
  const actorName = isAdmin(session) ? "Admin" : (session.type === "organizer" ? session.organizerName : "Unknown");

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      entityType: "GUEST",
      entityId: id,
      actorId,
      actorName,
      diff: body,
    },
  });

  emit("guest:updated", updated);
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const guest = await prisma.guest.findUnique({ where: { id } });
  if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Permission check
  if (!isAdmin(session)) {
    const settings = await prisma.eventSettings.findUnique({ where: { id: 1 } });
    if (settings && !settings.editingEnabled) {
      return NextResponse.json({ error: "EDITING_DISABLED" }, { status: 403 });
    }
    if (session.type === "organizer" && guest.createdBy !== session.organizerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const actorId = isAdmin(session) ? "admin" : (session.type === "organizer" ? session.organizerId : "unknown");
  const actorName = isAdmin(session) ? "Admin" : (session.type === "organizer" ? session.organizerName : "Unknown");

  await prisma.guest.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      action: "DELETE",
      entityType: "GUEST",
      entityId: id,
      actorId,
      actorName,
    },
  });

  emit("guest:deleted", { id });
  return NextResponse.json({ ok: true });
}
