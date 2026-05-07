import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const organizer = await prisma.organizer.findUnique({ where: { token } });
  if (!organizer) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }

  return NextResponse.json({ organizer: { id: organizer.id, name: organizer.name } });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const organizer = await prisma.organizer.findUnique({ where: { token } });
  if (!organizer) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }

  const session = await createSession({
    type: "organizer",
    organizerId: organizer.id,
    organizerName: organizer.name,
    token,
  });

  const response = NextResponse.json({ ok: true, organizer: { id: organizer.id, name: organizer.name } });
  await setSessionCookie(session);
  return response;
}
