import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { emit } from "@/lib/emit";

export async function GET() {
  const guests = await prisma.guest.findMany({
    include: { group: true, organizer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(guests);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if editing is enabled for non-admins
  if (!isAdmin(session)) {
    const settings = await prisma.eventSettings.findUnique({ where: { id: 1 } });
    if (settings && !settings.editingEnabled) {
      return NextResponse.json({ error: "EDITING_DISABLED" }, { status: 403 });
    }
  }

  const body = await req.json();
  const { fullName, potentialCount, confirmedCount, transportation, groupId, organizerId } = body;

  if (!fullName?.trim()) {
    return NextResponse.json({ error: "Full name required" }, { status: 400 });
  }

  // Determine organizer: admin can choose, organizer auto-assigned
  let resolvedOrganizerId: string | null = null;
  let actorId = "admin";
  let actorName = "Admin";

  if (isAdmin(session)) {
    resolvedOrganizerId = organizerId || null;
  } else if (session.type === "organizer") {
    resolvedOrganizerId = session.organizerId;
    actorId = session.organizerId;
    actorName = session.organizerName;
  }

  const guest = await prisma.guest.create({
    data: {
      fullName: fullName.trim(),
      potentialCount: potentialCount ?? 1,
      confirmedCount: confirmedCount ?? 0,
      transportation: transportation ?? "OWN_CAR",
      groupId: groupId || null,
      organizerId: resolvedOrganizerId,
      createdBy: actorId,
    },
    include: { group: true, organizer: true },
  });

  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      entityType: "GUEST",
      entityId: guest.id,
      actorId,
      actorName,
      diff: guest as object,
    },
  });

  emit("guest:created", guest);
  return NextResponse.json(guest, { status: 201 });
}
