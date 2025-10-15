"use client";

import { CheatingAlert } from "@/app/(home)/(dashboard)/[universityId]/[role]/[userId]/lib/types";
import { useRef, useState, useEffect, useCallback } from "react";
import * as blazeface from "@tensorflow-models/blazeface";
import * as cocossd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs-backend-webgl";
import '@tensorflow/tfjs-backend-cpu';
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);

/* ------------------------------------------------------------------ */
/* Types & Constants                                                   */
/* ------------------------------------------------------------------ */

export interface DetectionStats {
  totalFramesAnalyzed: number;
  faceDetections: number;
  phoneDetections: number;
  lookingAwayCount: number;
  multiplePersonDetections: number;
  noFaceDetections: number;
}

type CheatingAlertInput = Omit<CheatingAlert, "_id" | "_creationTime" | "studentName" | "resolvedBy" | "proctoringSessionId">;

interface Options {
  onCheatingAlert: (alert: CheatingAlertInput) => void;
  studentId: Id<"users">;
  examId: Id<"exams">;
  isInvigilatorView?: boolean;
  invigilatorId?: Id<"users">;
}

const ALERT_COOLDOWN = 300000; // 5 minutes
const PHONE_CONFIDENCE = 0.45; // Lowered confidence threshold
const CONSECUTIVE_NO_FACE_THRESHOLD = 10; // 1 second at 10fps
const LOOKING_AWAY_THRESHOLD = 20; // Degrees threshold

// --- WebRTC Integration: ICE servers configuration ---
const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    // For production, you MUST add a TURN server here for reliability
    // { urls: "turn:your-turn-server.com", username: "user", credential: "password" }
  ],
};

/* ------------------------------------------------------------------ */
/* Hook Implementation                                                 */
/* ------------------------------------------------------------------ */

export function useWebcamMonitoring({
  onCheatingAlert,
  studentId,
  examId,
  isInvigilatorView = false,
  invigilatorId,
}: Options) {
  /* ------------------------------------------------------------------ */
  /* Refs & State                                                        */
  /* ------------------------------------------------------------------ */
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  const faceModelRef = useRef<blazeface.BlazeFaceModel | null>(null);
  const objectModelRef = useRef<cocossd.ObjectDetection | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const candidateQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const lastAlertTimeRef = useRef<Record<string, number>>({});
  const sessionIdRef = useRef<Id<"proctoringSessions"> | null>(null);
  const connectionIdRef = useRef<string | null>(null);
  const lastRestartTimestampRef = useRef(0);
  const consecutiveNoFaceRef = useRef(0);
  const consecutiveLookingAwayRef = useRef(0);
  const isWebRTCSetupRef = useRef(false);
  const detectionLogRef = useRef<string[]>([]);

  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionStats, setDetectionStats] = useState<DetectionStats>({
    totalFramesAnalyzed: 0,
    faceDetections: 0,
    phoneDetections: 0,
    lookingAwayCount: 0,
    multiplePersonDetections: 0,
    noFaceDetections: 0,
  });

  // --- WebRTC Integration: Add Convex hooks ---
  const sendSignal = useMutation(api.proctoring.sendProctoringSignal);
  const startSession = useMutation(api.proctoring.startProctoringSession);
  const endSession = useMutation(api.proctoring.endProctoringSession);
  const signals = useQuery(
    api.proctoring.getSignalForRecipient,
    // Only fetch signals if we are the student, not the invigilator
    isInvigilatorView ? ({ examId, skip: true } as any) : { examId }
  );

  /* ------------------------------------------------------------------ */
  /* Model Loading                                                       */
  /* ------------------------------------------------------------------ */
  const loadModels = useCallback(async () => {
    if (modelsLoaded || modelsLoading) return;
    setModelsLoading(true);

    try {
      const [faceModel, objectModel] = await Promise.all([
        blazeface.load({ maxFaces: 3 }),
        cocossd.load(),
      ]);

      faceModelRef.current = faceModel;
      objectModelRef.current = objectModel;
      setModelsLoaded(true);
      console.log("AI models loaded successfully");
    } catch (err) {
      console.error("Model loading failed:", err);
      setWebcamError("AI models failed to load. Monitoring limited.");
    } finally {
      setModelsLoading(false);
    }
  }, [modelsLoaded, modelsLoading]);

  /* ------------------------------------------------------------------ */
  /* Camera Handling                                                     */
  /* ------------------------------------------------------------------ */
  const getCameraStream = useCallback(async () => {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 15 },
        },
        audio: false,
      });
    } catch (err) {
      return navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* Alert Management                                                    */
  /* ------------------------------------------------------------------ */
  const canTriggerAlert = useCallback((alertType: string) => {
    const now = Date.now();
    const lastAlert = lastAlertTimeRef.current[alertType] || 0;
    return now - lastAlert > ALERT_COOLDOWN;
  }, []);

  const triggerAlert = useCallback(
    (
      alertType:  CheatingAlert["type"],
      description: string,
      severity: "low" | "medium" | "high"
    ) => {
      if (!canTriggerAlert(alertType)) return;

      lastAlertTimeRef.current[alertType] = Date.now();

      onCheatingAlert({
        type: alertType,
        severity,
        description,
        confidence: 0.85,
        timestamp: Date.now(),
        examId,
        studentId,
        resolved: false,
      });
    },
    [onCheatingAlert, examId, studentId, canTriggerAlert]
  );

  /* ------------------------------------------------------------------ */
  /* Detection Logic                                                     */
  /* ------------------------------------------------------------------ */
  const detectFaces = useCallback(async (): Promise<
    blazeface.NormalizedFace[]
  > => {
    if (!faceModelRef.current || !videoRef.current) return [];

    try {
      return await faceModelRef.current.estimateFaces(
        videoRef.current,
        false, // Return tensors
        false, // Flip horizontal
        false // Annotate bounding boxes
      );
    } catch (err) {
      console.error("Face detection error:", err);
      return [];
    }
  }, []);

  const detectObjects = useCallback(async () => {
    if (!objectModelRef.current || !videoRef.current) return [];

    try {
      return await objectModelRef.current.detect(videoRef.current);
    } catch (err) {
      console.error("Object detection error:", err);
      return [];
    }
  }, []);

  // Calculate head pose using facial landmarks
  const calculateHeadPose = useCallback((face: blazeface.NormalizedFace) => {
    if (
      !face.landmarks ||
      (Array.isArray(face.landmarks) && face.landmarks.length < 3)
    )
      return { yaw: 0, pitch: 0 };

    const landmarks = face.landmarks;
    const leftEye = Array.isArray(landmarks)
      ? landmarks[0]
      : landmarks.arraySync()[0];
    const rightEye = Array.isArray(landmarks)
      ? landmarks[1]
      : landmarks.arraySync()[1];
    const nose = Array.isArray(landmarks)
      ? landmarks[2]
      : landmarks.arraySync()[2];

    // Calculate eye midpoint
    const eyeMidpoint = [
      (leftEye[0] + rightEye[0]) / 2,
      (leftEye[1] + rightEye[1]) / 2,
    ];

    // Calculate vector from eye midpoint to nose
    const vector = [nose[0] - eyeMidpoint[0], nose[1] - eyeMidpoint[1]];

    // Calculate distance between eyes for normalization
    const eyeDistance = Math.sqrt(
      Math.pow(rightEye[0] - leftEye[0], 2) +
        Math.pow(rightEye[1] - leftEye[1], 2)
    );

    if (eyeDistance < 0.01) return { yaw: 0, pitch: 0 }; // Prevent division by zero

    // Normalize vector
    const normalizedVector = [vector[0] / eyeDistance, vector[1] / eyeDistance];

    // Convert to angles (simplified approximation)
    const yaw = Math.atan(normalizedVector[0]) * (180 / Math.PI);
    const pitch = Math.atan(normalizedVector[1]) * (180 / Math.PI);

    return { yaw, pitch };
  }, []);

  // New: Enhanced looking away detection using face position
  const isLookingAwayByPosition = useCallback(
    (face: blazeface.NormalizedFace, canvas: HTMLCanvasElement) => {
      if (!face.topLeft || !face.bottomRight) return false;

      const topLeft = face.topLeft;
      const [topLeftX, topLeftY] = Array.isArray(topLeft)
        ? topLeft
        : topLeft.arraySync();
      const bottomRight = face.bottomRight;
      const [bottomRightX, bottomRightY] = Array.isArray(bottomRight)
        ? bottomRight
        : bottomRight.arraySync();

      // Calculate face center
      const faceCenterX = (topLeftX + bottomRightX) / 2;
      const faceCenterY = (topLeftY + bottomRightY) / 2;

      // Calculate frame center
      const frameCenterX = canvas.width / 2;
      const frameCenterY = canvas.height / 2;

      // Calculate offset as percentage of frame size
      const xOffset = Math.abs(faceCenterX - frameCenterX) / frameCenterX;
      const yOffset = Math.abs(faceCenterY - frameCenterY) / frameCenterY;

      return xOffset > 0.35 || yOffset > 0.35;
    },
    []
  );

  const analyzeFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isInvigilatorView) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;

    // Update canvas dimensions
    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Update frame counter
    setDetectionStats((prev) => ({
      ...prev,
      totalFramesAnalyzed: prev.totalFramesAnalyzed + 1,
    }));

    // Skip if models not ready
    if (!modelsLoaded) {
      animationRef.current = requestAnimationFrame(analyzeFrame);
      return;
    }

    /* ------------------- Face Detection ------------------- */
    const faces = await detectFaces();
    const faceCount = faces.length;

    // Update face stats
    setDetectionStats((prev) => ({
      ...prev,
      faceDetections: prev.faceDetections + (faceCount > 0 ? 1 : 0),
      noFaceDetections: prev.noFaceDetections + (faceCount === 0 ? 1 : 0),
    }));

    /* ------------------- No Face Detection ------------------- */
    if (faceCount === 0) {
      consecutiveNoFaceRef.current += 1;

      // Trigger alert after consecutive missing frames
      if (consecutiveNoFaceRef.current >= CONSECUTIVE_NO_FACE_THRESHOLD) {
        const lastAlert = lastAlertTimeRef.current["no_face"] || 0;
        if (Date.now() - lastAlert > 30000) {
          triggerAlert("no_face", "No face detected in webcam feed", "high");
        }
      }
    } else {
      consecutiveNoFaceRef.current = 0;
    }

    /* ------------------- Multiple Person Detection ------------------- */
    if (faceCount > 1) {
      setDetectionStats((prev) => ({
        ...prev,
        multiplePersonDetections: prev.multiplePersonDetections + 1,
      }));

      triggerAlert(
        "multiple_faces",
        "Multiple faces detected in webcam feed",
        "high"
      );
    }

    /* ------------------- Phone Detection (Enhanced) ------------------- */
    if (detectionStats.totalFramesAnalyzed % 3 === 0) {
      try {
        const objects = await detectObjects();

        // Log detected objects for debugging
        if (objects.length > 0) {
          const logEntry = `Frame ${detectionStats.totalFramesAnalyzed}: ${objects
            .map((o) => `${o.class} (${Math.round(o.score * 100)}%)`)
            .join(", ")}`;

          detectionLogRef.current.push(logEntry);
          if (detectionLogRef.current.length > 20)
            detectionLogRef.current.shift();

          console.log(logEntry);
        }

        // Check for electronic devices
        const deviceDetected = objects.some((obj) => {
          const normalizedClass = obj.class.toLowerCase();

          return (
            (normalizedClass.includes("phone") ||
              normalizedClass.includes("cell") ||
              normalizedClass.includes("mobile") ||
              normalizedClass.includes("electronic") ||
              normalizedClass.includes("device") ||
              normalizedClass.includes("laptop") ||
              normalizedClass.includes("tablet") ||
              normalizedClass.includes("remote") ||
            normalizedClass.includes("screen")
            ) &&
            obj.score > PHONE_CONFIDENCE
          );
        });

        if (deviceDetected) {
          setDetectionStats((prev) => ({
            ...prev,
            phoneDetections: prev.phoneDetections + 1,
          }));

          triggerAlert(
            "phone_detected",
            "Electronic device detected in webcam feed",
            "high"
          );
        }
      } catch (err) {
        console.error("Object detection failed:", err);
      }
    }

    /* ------------------- Looking Away Detection (Dual Method) ------------------- */
    if (faceCount === 1) {
      const face = faces[0];
      let isLookingAway = false;
      let method = "none";

      // Method 1: Head pose estimation (if landmarks available)
      if (Array.isArray(face.landmarks) && face.landmarks.length >= 3) {
        try {
          const { yaw, pitch } = calculateHeadPose(face);
          console.log(
            `Head pose - Yaw: ${yaw.toFixed(1)}°, Pitch: ${pitch.toFixed(1)}°`
          );

          isLookingAway =
            Math.abs(yaw) > LOOKING_AWAY_THRESHOLD ||
            Math.abs(pitch) > LOOKING_AWAY_THRESHOLD;
          method = "pose";
        } catch (err) {
          console.error("Head pose calculation error:", err);
        }
      }

      // Method 2: Face position detection (fallback)
      if (!isLookingAway) {
        isLookingAway = isLookingAwayByPosition(face, canvas);
        method = "position";
      }

      // Apply detection logic
      if (isLookingAway) {
        console.log(`Looking away detected by ${method} method`);
        consecutiveLookingAwayRef.current += 1;

        if (consecutiveLookingAwayRef.current >= 3) {
          setDetectionStats((prev) => ({
            ...prev,
            lookingAwayCount: prev.lookingAwayCount + 1,
          }));

          triggerAlert(
            "looking_away",
            "Student looking away from screen",
            "medium"
          );
        }
      } else {
        consecutiveLookingAwayRef.current = 0;
      }
    }

    // Continue processing
    animationRef.current = requestAnimationFrame(analyzeFrame);
  }, [
    detectFaces,
    detectObjects,
    triggerAlert,
    modelsLoaded,
    isInvigilatorView,
    detectionStats.totalFramesAnalyzed,
    calculateHeadPose,
    isLookingAwayByPosition,
  ]);

  /* ------------------------------------------------------------------ */
  /* Public API                                                          */
  /* ------------------------------------------------------------------ */
  const startWebcam = useCallback(async () => {
    try {
      const stream = await getCameraStream();
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (videoRef.current && videoRef.current.readyState >= 3) {
            resolve();
          } else {
            const onLoaded = () => {
              videoRef.current?.removeEventListener("loadedmetadata", onLoaded);
              resolve();
            };
            videoRef.current?.addEventListener("loadedmetadata", onLoaded);
          }
        });

        try {
          await videoRef.current.play();
          console.log("Webcam started successfully");
        } catch (err) {
          console.error("Video play error:", err);
        }
      }

      setIsWebcamActive(true);
      setWebcamError(null);

      if (!isInvigilatorView && invigilatorId) {
        if (isWebRTCSetupRef.current) {
          console.log("WebRTC setup already initiated. Skipping.");
          return;
        }
        isWebRTCSetupRef.current = true;
        const connectionId = nanoid();
        connectionIdRef.current = connectionId;
        console.log(
          `[Student] Starting new session with connectionId: ${connectionId}`
        );
        const sessionId = await startSession({ examId, connectionId });
        sessionIdRef.current = sessionId;
        const pc = new RTCPeerConnection(iceServers);
        peerConnectionRef.current = pc;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = async (event) => {
          if (event.candidate && connectionIdRef.current) {
            await sendSignal({
              examId,
              recipientId: invigilatorId,
              connectionId: connectionIdRef.current,
              type: "candidate",
              data: JSON.stringify(event.candidate),
            });
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sendSignal({
          examId,
          recipientId: invigilatorId,
          connectionId,
          type: "offer",
          data: JSON.stringify(offer),
        });

        console.log("WebRTC connection established with invigilator");
      }

      // Load models if needed
      if (!isInvigilatorView && !modelsLoaded) {
        await loadModels();
      }

      // Start processing loop
      if (!isInvigilatorView) {
        console.log("Starting detection loop");
        animationRef.current = requestAnimationFrame(analyzeFrame);
      }
    } catch (err: any) {
      console.error("Webcam initialization failed:", err);
      setWebcamError(
        err.message || "Webcam access failed. Check permissions and try again."
      );
      setIsWebcamActive(false);
    }
  }, [
    getCameraStream,
    analyzeFrame,
    loadModels,
    modelsLoaded,
    isInvigilatorView,
    examId,
    invigilatorId,
    sendSignal,
    startSession,
  ]);

  const stopWebcam = useCallback(async() => {
    cancelAnimationFrame(animationRef.current);
    if (sessionIdRef.current) {
      await endSession({ sessionId: sessionIdRef.current });
      sessionIdRef.current = null;
      connectionIdRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // --- WebRTC Integration: Close the peer connection ---
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setIsWebcamActive(false);
    isWebRTCSetupRef.current = false;
    console.log("Webcam stopped");
  }, [endSession]);

  const restartConnection = useCallback(() => {
    stopWebcam();
    setTimeout(() => {
      startWebcam();
    }, 500);
  }, [stopWebcam, startWebcam]);

  // --- WebRTC Integration: Add Effect to handle incoming signals from Invigilator ---
  useEffect(() => {
    // We create an async function inside so we can use a top-level for...of loop
    const processSignals = async () => {
      if (isInvigilatorView || !signals) return;
      const pc = peerConnectionRef.current;
      if (!pc) {
        return;
      }

      const currentConnectionId = connectionIdRef.current;
      const relevantSignals = signals.filter(
        (s) => s.connectionId === currentConnectionId
      );
      for (const signal of relevantSignals) {
        // Defensive guards
        if (pc.signalingState === "closed") continue;
        if (signal.type === "restart") {
          if (signal._creationTime > lastRestartTimestampRef.current) {
            lastRestartTimestampRef.current = signal._creationTime;
            restartConnection();
          }
          continue;
        }

        const data = JSON.parse(signal.data);

        // Refined logic for handling the answer
        if (signal.type === "answer" && pc.signalingState !== "stable") {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          // Process candidate queue
          for (const candidate of candidateQueueRef.current) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          candidateQueueRef.current = []; // Clear queue
        } else if (signal.type === "candidate") {
          // Queue candidates if the connection isn't ready, otherwise add them
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(data));
          } else {
            candidateQueueRef.current.push(data);
          }
        }
      }
    };

    processSignals();
  }, [signals, isInvigilatorView]);

  // Debug function to get detection logs
  const getDetectionLogs = useCallback(() => {
    return [...detectionLogRef.current];
  }, []);

  /* ------------------------------------------------------------------ */
  /* Cleanup                                                             */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    return () => {
      stopWebcam();
      faceModelRef.current?.dispose();
      objectModelRef.current?.dispose();
    };
  }, [stopWebcam]);

  return {
    videoRef,
    canvasRef,
    isWebcamActive,
    webcamError,
    modelsLoading,
    startWebcam,
    stopWebcam,
    detectionStats,
    getDetectionLogs, // For debugging
  };
}
