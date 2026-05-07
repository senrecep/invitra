import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [settings, guests, groups, organizers] = await Promise.all([
    prisma.eventSettings.findUnique({ where: { id: 1 } }),
    prisma.guest.findMany({ include: { group: true, organizer: true } }),
    prisma.group.findMany({ orderBy: [{ isDefault: "desc" }, { order: "asc" }] }),
    prisma.organizer.findMany({ orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] }),
  ]);

  const capacity = settings?.capacity ?? 150;
  const totalPotential = guests.reduce((sum, g) => sum + g.potentialCount, 0);
  const totalConfirmed = guests.reduce((sum, g) => sum + g.confirmedCount, 0);

  // By group
  const byGroup = groups.map((group) => {
    const groupGuests = guests.filter((g) => g.groupId === group.id);
    return {
      id: group.id,
      name: group.name,
      nameEn: group.nameEn,
      isDefault: group.isDefault,
      guestCount: groupGuests.length,
      potentialCount: groupGuests.reduce((s, g) => s + g.potentialCount, 0),
      confirmedCount: groupGuests.reduce((s, g) => s + g.confirmedCount, 0),
    };
  });

  // Ungrouped guests
  const ungroupedGuests = guests.filter((g) => !g.groupId);
  if (ungroupedGuests.length > 0) {
    byGroup.push({
      id: "none",
      name: "Varsayılan",
      nameEn: "Default",
      isDefault: true,
      guestCount: ungroupedGuests.length,
      potentialCount: ungroupedGuests.reduce((s, g) => s + g.potentialCount, 0),
      confirmedCount: ungroupedGuests.reduce((s, g) => s + g.confirmedCount, 0),
    });
  }

  // By organizer
  const byOrganizer = organizers.map((org) => {
    const orgGuests = guests.filter((g) => g.organizerId === org.id);
    return {
      id: org.id,
      name: org.name,
      isDefault: org.isDefault,
      guestCount: orgGuests.length,
      potentialCount: orgGuests.reduce((s, g) => s + g.potentialCount, 0),
      confirmedCount: orgGuests.reduce((s, g) => s + g.confirmedCount, 0),
    };
  });

  // Unassigned guests
  const unassignedGuests = guests.filter((g) => !g.organizerId);
  if (unassignedGuests.length > 0) {
    byOrganizer.push({
      id: "none",
      name: "Genel",
      isDefault: true,
      guestCount: unassignedGuests.length,
      potentialCount: unassignedGuests.reduce((s, g) => s + g.potentialCount, 0),
      confirmedCount: unassignedGuests.reduce((s, g) => s + g.confirmedCount, 0),
    });
  }

  return NextResponse.json({
    capacity,
    totalGuests: guests.length,
    totalPotential,
    totalConfirmed,
    byGroup,
    byOrganizer,
  });
}
