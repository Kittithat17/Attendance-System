//api/attendance/route.ts
import { createClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, period, latitude, longitude } = body;

    const { error } = await supabase.from("attendance").insert({
      user_id: user.id,
      type,
      period,
      latitude,
      longitude,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}