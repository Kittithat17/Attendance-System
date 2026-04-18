// import { createClient } from "@/lib/supabaseClient";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   const supabase = createClient();
//   const { descriptor } = await req.json();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const { error } = await supabase
//     .from("profiles")
//     .upsert({
//       id: user.id,
//       face_descriptor: descriptor,
//     });

//   if (error) throw error;

//   return NextResponse.json({ success: true });
// }