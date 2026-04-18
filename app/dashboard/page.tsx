//app/dashboard/page.tsx
import { createClient } from "@/lib/supabaseServer";
import LogoutButton from "@/components/logout-button";
import CheckinForm from "@/components/checkin-form";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { MapPin, Camera } from "lucide-react";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const name = user?.user_metadata?.full_name || "User";
  const now = new Date();
  const startOfDay = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" })
  );
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  // แปลงเป็น ISO String เพื่อให้ Supabase อ่านค่าได้ถูกต้อง
  const startIso = startOfDay.toISOString();
  const endIso = endOfDay.toISOString();

  const { data: history } = await supabase
    .from("attendance")
    .select("*")
    .gte("created_at", startIso) // ใช้ค่าที่คำนวณจาก Timezone ไทย
    .lte("created_at", endIso)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome, {name} 👋
            </h1>
            <p className="text-muted-foreground text-sm">
              Track your attendance
            </p>
          </div>

          <LogoutButton />
        </div>

        {/* STATUS */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-500" />
              <div>
                <CardTitle>Location</CardTitle>
                <CardDescription>Will be checked on submit</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Camera className="w-5 h-5 text-pink-500" />
              <div>
                <CardTitle>Face Recognition</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* ACTION */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in / Check-out</CardTitle>
            <CardDescription>Select type and submit attendance</CardDescription>
          </CardHeader>

          <CardContent>
            <CheckinForm />
          </CardContent>
        </Card>

        {/* HISTORY */}
        <Card>
          <CardHeader>
            <CardTitle>Today History</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {!history || history.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                No data yet
              </p>
            ) : (
              history.map((item) => {
                const isCheckIn = item.type === "check-in";
                const date = new Date(item.created_at);
                const bangkokTime = new Date(
                  date.getTime() + 7 * 60 * 60 * 1000
                );
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border rounded-lg p-3"
                  >
                    <div>
                      <p
                        className={`font-medium ${
                          isCheckIn ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isCheckIn ? "🟢 Check-in" : "🔴 Check-out"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                       
                        {bangkokTime.toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </p>
                    </div>

                    <span className="text-xs px-2 py-1 bg-muted rounded">
                      {item.period}
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
