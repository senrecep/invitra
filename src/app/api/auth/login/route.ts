import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const hash = process.env.MASTER_PASSWORD_HASH;
  if (!hash) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const valid = await bcrypt.compare(password, hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await createSession({ type: "admin" });
  const response = NextResponse.json({ ok: true });
  await setSessionCookie(token);
  return response;
}
