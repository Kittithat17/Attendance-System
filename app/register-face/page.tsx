
//app/register-face/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { createClient } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function RegisterFace() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // โหลด model
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";

      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    };

    loadModels();
  }, []);

  // เปิดกล้อง
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });
  }, []);

  const handleCapture = async () => {
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

      const descriptor = Array.from(detection.descriptor);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("profiles")
        .update({
          face_descriptor: descriptor,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Face registered ✅");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <video
        ref={videoRef}
        autoPlay
        muted
        className="rounded-lg w-full max-w-md"
      />

      <button
        onClick={handleCapture}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Processing..." : "Capture Face"}
      </button>
    </div>
  );
}