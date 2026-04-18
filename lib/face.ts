// import * as faceapi from "face-api.js";

// export async function loadModels() {
//   await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
//   await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
//   await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
// }

// export async function getDescriptor(video: HTMLVideoElement) {
//   const detection = await faceapi
//     .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
//     .withFaceLandmarks()
//     .withFaceDescriptor();

//   if (!detection) throw new Error("Face not detected");

//   return Array.from(detection.descriptor); // Float32Array → number[]
// }