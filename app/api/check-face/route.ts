// app/api/check-face/route.ts

import { createClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import * as faceapi from "face-api.js";

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const { descriptor } = body;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ ดึง face ของ user คนนี้เท่านั้น
  const { data: profile } = await supabase
    .from("profiles")
    .select("face_descriptor")
    .eq("id", user.id)
    .single();

  if (!profile?.face_descriptor) {
    return NextResponse.json({ error: "No face registered" });
  }
  if (!descriptor || !Array.isArray(descriptor)) {
    return NextResponse.json({ error: "Invalid descriptor" }, { status: 400 });
  }

  const distance = faceapi.euclideanDistance(
    new Float32Array(descriptor),
    new Float32Array(profile.face_descriptor)
  );

  

  const isMatch = distance < 0.5;

  return NextResponse.json({
    success: isMatch,
    distance,
  });
}