//app/components/checkin-form.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

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
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(true);
  const router = useRouter();
  useEffect(() => {
    let stream: MediaStream;

    navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
      stream = s;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // โหลด model
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";

      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

      setModelsLoaded(true); 
    };

    loadModels();
  }, []);

  function getLocation() {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 15000,
      });
    });
  }

  const handleSubmit = async () => {
    setLoading(true);

    try {
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

      const resCheck = await fetch("/api/check-face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ descriptor: inputDescriptor }),
      });
      
      if (!resCheck.ok) {
        throw new Error("Face verification failed");
      }
      const checkData = await resCheck.json();

      if (!checkData.success) {
        throw new Error("Face not matched ❌");
      }
      
      // 📍 location
      try {
        const pos = await getLocation();
      
        const res = await fetch("/api/attendance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
        setReady(false);
        setTimeout(() => {
            setReady(true);
          }, 1500);
      
      } catch (err: any) {
        toast.error(err.message || "Location failed");
      } finally {
        setLoading(false);
      }
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
        <Button onClick={handleSubmit} disabled={loading || !modelsLoaded || !ready}>
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
