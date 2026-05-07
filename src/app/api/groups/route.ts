import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { emit } from "@/lib/emit";

export async function GET() {
  const groups = await prisma.group.findMany({ orderBy: [{ isDefault: "desc" }, { order: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, nameEn } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const count = await prisma.group.count();
  const group = await prisma.group.create({ data: { name: name.trim(), nameEn: nameEn?.trim() || null, order: count } });

  emit("group:created", group);
  return NextResponse.json(group, { status: 201 });
}
