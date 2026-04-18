"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CheckinForm() {
  const [type, setType] = useState("check-in");
  const [period, setPeriod] = useState("morning");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async () => {
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/attendance", {
            method: "POST",
            body: JSON.stringify({
              type,
              period,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          toast.success("Attendance recorded ✅");
          router.refresh();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.error("Location permission denied");
        setLoading(false);
      }
    );
  };

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {/* TYPE */}
      <Select value={type} onValueChange={setType}>
        <SelectTrigger>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="check-in">Check-in</SelectItem>
          <SelectItem value="check-out">Check-out</SelectItem>
        </SelectContent>
      </Select>

      {/* PERIOD */}
      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger>
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="morning">Morning</SelectItem>
          <SelectItem value="noon">Noon</SelectItem>
          <SelectItem value="afternoon">Afternoon</SelectItem>
          <SelectItem value="evening">Evening</SelectItem>
        </SelectContent>
      </Select>

      {/* BUTTON */}
      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 w-4 h-4" />
            Processing...
          </>
        ) : (
          "Submit"
        )}
      </Button>
    </div>
  );
}