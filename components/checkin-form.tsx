"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { createClient } from "@/lib/supabaseClient";
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // ✅ โหลด model
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";

      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    };

    loadModels();
  }, []);

  // ✅ เปิดกล้อง
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });
  }, []);

  // 🧠 compare function
  function euclideanDistance(a: number[], b: number[]) {
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0)
    );
  }

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // 🧠 detect face
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current!,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw new Error("No face detected");
      }

      const inputDescriptor = Array.from(detection.descriptor);

      // 🧠 ดึง face จาก DB
      const { data: profile } = await supabase
        .from("profiles")
        .select("face_descriptor")
        .single();

      if (!profile?.face_descriptor) {
        throw new Error("No registered face");
      }

      // 🧠 compare
      const distance = euclideanDistance(
        inputDescriptor,
        profile.face_descriptor
      );

      if (distance > 0.6) {
        throw new Error("Face not matched ❌");
      }

      // 📍 location
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

            toast.success("Check-in success ✅");
            router.refresh();
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
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 🎥 CAMERA */}
      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full max-w-xs rounded-lg"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {/* TYPE */}
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="check-in">Check-in</SelectItem>
            <SelectItem value="check-out">Check-out</SelectItem>
          </SelectContent>
        </Select>

        {/* PERIOD */}
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="morning">Morning</SelectItem>
            <SelectItem value="noon">Noon</SelectItem>
            <SelectItem value="afternoon">Afternoon</SelectItem>
            <SelectItem value="evening">Evening</SelectItem>
          </SelectContent>
        </Select>

        {/* BUTTON */}
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 w-4 h-4" />
              Scanning...
            </>
          ) : (
            "Scan & Submit"
          )}
        </Button>
      </div>
    </div>
  );
}