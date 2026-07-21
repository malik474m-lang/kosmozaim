import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const valid = await verifySession();
  if (!valid) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}
