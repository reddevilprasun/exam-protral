"use client"

import { CheatingAlert } from "@/app/(home)/(dashboard)/[universityId]/[role]/[userId]/lib/types"
import { useRef, useState, useEffect, useCallback } from "react"
import * as blazeface from '@tensorflow-models/blazeface'
import * as cocossd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs-backend-webgl'

/* ------------------------------------------------------------------ */
/* Types & Constants                                                   */
/* ------------------------------------------------------------------ */

export interface DetectionStats {
  totalFramesAnalyzed: number
  faceDetections: number
  phoneDetections: number
  lookingAwayCount: number
  multiplePersonDetections: number
  noFaceDetections: number
}

interface Options {
  onCheatingAlert: (alert: Omit<CheatingAlert, "id">) => void
  studentId: string
  examId?: number
  sessionId: number
  isInvigilatorView?: boolean
}

const ALERT_COOLDOWN = 300000 // 5 minutes
const PHONE_CONFIDENCE = 0.65 // Lowered confidence threshold
const LOOKING_AWAY_THRESHOLD = 0.5 // More conservative threshold
const FACE_AREA_THRESHOLD = 0.08 // Minimum face size to consider

/* ------------------------------------------------------------------ */
/* Hook Implementation                                                 */
/* ------------------------------------------------------------------ */

export function useWebcamMonitoring({
  onCheatingAlert,
  studentId,
  examId = 0,
  sessionId,
  isInvigilatorView = false,
}: Options) {
  /* ------------------------------------------------------------------ */
  /* Refs & State                                                        */
  /* ------------------------------------------------------------------ */
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number>(0)
  const faceModelRef = useRef<blazeface.BlazeFaceModel | null>(null)
  const objectModelRef = useRef<cocossd.ObjectDetection | null>(null)
  const lastAlertTimeRef = useRef<Record<string, number>>({})
  const consecutiveLookingAwayRef = useRef(0)
  
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const [webcamError, setWebcamError] = useState<string | null>(null)
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [detectionStats, setDetectionStats] = useState<DetectionStats>({
    totalFramesAnalyzed: 0,
    faceDetections: 0,
    phoneDetections: 0,
    lookingAwayCount: 0,
    multiplePersonDetections: 0,
    noFaceDetections: 0,
  })

  /* ------------------------------------------------------------------ */
  /* Model Loading                                                       */
  /* ------------------------------------------------------------------ */
  const loadModels = useCallback(async () => {
    if (modelsLoaded || modelsLoading) return
    setModelsLoading(true)
    
    try {
      const [faceModel, objectModel] = await Promise.all([
        blazeface.load({ maxFaces: 3 }),
        cocossd.load()
      ])
      
      faceModelRef.current = faceModel
      objectModelRef.current = objectModel
      setModelsLoaded(true)
    } catch (err) {
      console.error('Model loading failed:', err)
      setWebcamError("AI models failed to load. Monitoring limited.")
    } finally {
      setModelsLoading(false)
    }
  }, [modelsLoaded, modelsLoading])

  /* ------------------------------------------------------------------ */
  /* Camera Handling                                                     */
  /* ------------------------------------------------------------------ */
  const getCameraStream = useCallback(async () => {
    try {
      // Prioritize high resolution
      return await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 15 }
        },
        audio: false
      })
    } catch (err) {
      // Fallback to basic constraints
      return navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      })
    }
  }, [])

  /* ------------------------------------------------------------------ */
  /* Alert Management                                                    */
  /* ------------------------------------------------------------------ */
  const canTriggerAlert = useCallback((alertType: string) => {
    const now = Date.now()
    const lastAlert = lastAlertTimeRef.current[alertType] || 0
    return now - lastAlert > ALERT_COOLDOWN
  }, [])

  const triggerAlert = useCallback((
    alertType: "phone_detected" | "looking_away" | "multiple_faces" | "no_face", 
    description: string, 
    severity: "low" | "medium" | "high"
  ) => {
    if (!canTriggerAlert(alertType)) return
    
    lastAlertTimeRef.current[alertType] = Date.now()
    
    onCheatingAlert({
      type: alertType,
      severity,
      description,
      confidence: 0.85,
      timestamp: new Date().toISOString(),
      examId,
      studentId,
      sessionId,
      resolved: false,
    })
  }, [onCheatingAlert, examId, studentId, sessionId, canTriggerAlert])

  /* ------------------------------------------------------------------ */
  /* Detection Logic                                                     */
  /* ------------------------------------------------------------------ */
  const detectFaces = useCallback(async (): Promise<blazeface.NormalizedFace[]> => {
    if (!faceModelRef.current || !videoRef.current) return []
    
    try {
      return await faceModelRef.current.estimateFaces(
        videoRef.current,
        false,  // Return tensors
        false,  // Flip horizontal
        false   // Annotate bounding boxes
      )
    } catch (err) {
      console.error('Face detection error:', err)
      return []
    }
  }, [])

  const detectObjects = useCallback(async () => {
    if (!objectModelRef.current || !videoRef.current) return []
    
    try {
      return await objectModelRef.current.detect(videoRef.current)
    } catch (err) {
      console.error('Object detection error:', err)
      return []
    }
  }, [])

  const analyzeFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isInvigilatorView) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return
    
    // Update canvas dimensions
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
    }
    
    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Update frame counter
    setDetectionStats(prev => ({
      ...prev,
      totalFramesAnalyzed: prev.totalFramesAnalyzed + 1
    }))
    
    // Skip if models not ready
    if (!modelsLoaded) {
      animationRef.current = requestAnimationFrame(analyzeFrame)
      return
    }
    
    /* ------------------- Face Detection ------------------- */
    const faces = await detectFaces()
    const faceCount = faces.length
    
    // Update face stats
    setDetectionStats(prev => ({
      ...prev,
      faceDetections: prev.faceDetections + (faceCount > 0 ? 1 : 0),
      noFaceDetections: prev.noFaceDetections + (faceCount === 0 ? 1 : 0)
    }))
    
    // Handle face-based alerts
    if (faceCount === 0) {
      triggerAlert(
        "no_face", 
        "No face detected in webcam feed", 
        "high"
      )
    } 
    else if (faceCount > 1) {
      setDetectionStats(prev => ({
        ...prev,
        multiplePersonDetections: prev.multiplePersonDetections + 1
      }))
      
      triggerAlert(
        "multiple_faces", 
        "Multiple faces detected in webcam feed", 
        "high"
      )
    }
    
    /* ------------------- Phone Detection ------------------- */
    // Run every 4th frame for performance
    if (detectionStats.totalFramesAnalyzed % 4 === 0) {
      const objects = await detectObjects()
      
      // Check for phones AND other electronic devices
      const electronicDeviceDetected = objects.some(obj => 
        (obj.class === 'cell phone' || 
         obj.class === 'laptop' || 
         obj.class === 'remote') && 
        obj.score > PHONE_CONFIDENCE
      )
      
      if (electronicDeviceDetected) {
        setDetectionStats(prev => ({
          ...prev,
          phoneDetections: prev.phoneDetections + 1
        }))
        
        triggerAlert(
          "phone_detected", 
          "Electronic device detected in webcam feed", 
          "high"
        )
      }
    }
    
    /* ------------------- Looking Away Detection ------------------- */
    if (faceCount === 1) {
      const face = faces[0]
      
      // Check if face has required properties
      if (!Array.isArray(face.topLeft) || !Array.isArray(face.bottomRight)) {
        animationRef.current = requestAnimationFrame(analyzeFrame)
        return
      }
      
      const [topLeftX, topLeftY] = face.topLeft
      const [bottomRightX, bottomRightY] = face.bottomRight
      
      // Calculate face area percentage
      const faceWidth = bottomRightX - topLeftX
      const faceHeight = bottomRightY - topLeftY
      const faceArea = (faceWidth * faceHeight) / (canvas.width * canvas.height)
      
      // Skip if face is too small
      if (faceArea < FACE_AREA_THRESHOLD) {
        animationRef.current = requestAnimationFrame(analyzeFrame)
        return
      }
      
      const faceCenterX = (topLeftX + bottomRightX) / 2
      const faceCenterY = (topLeftY + bottomRightY) / 2
      const frameCenterX = canvas.width / 2
      const frameCenterY = canvas.height / 2
      
      const xOffset = Math.abs(faceCenterX - frameCenterX) / frameCenterX
      const yOffset = Math.abs(faceCenterY - frameCenterY) / frameCenterY
      
      // Require consecutive detections to reduce false positives
      if (xOffset > LOOKING_AWAY_THRESHOLD || yOffset > LOOKING_AWAY_THRESHOLD) {
        consecutiveLookingAwayRef.current += 1
        
        // Only trigger after 3 consecutive detections
        if (consecutiveLookingAwayRef.current >= 3) {
          setDetectionStats(prev => ({
            ...prev,
            lookingAwayCount: prev.lookingAwayCount + 1
          }))
          
          triggerAlert(
            "looking_away", 
            "Student looking away from screen", 
            "medium"
          )
        }
      } else {
        // Reset counter if not looking away
        consecutiveLookingAwayRef.current = 0
      }
    }
    
    // Continue processing
    animationRef.current = requestAnimationFrame(analyzeFrame)
  }, [
    detectFaces, 
    detectObjects, 
    triggerAlert, 
    modelsLoaded, 
    isInvigilatorView, 
    detectionStats.totalFramesAnalyzed
  ])

  /* ------------------------------------------------------------------ */
  /* Public API                                                          */
  /* ------------------------------------------------------------------ */
  const startWebcam = useCallback(async () => {
    try {
      const stream = await getCameraStream()
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            videoRef.current?.removeEventListener('loadedmetadata', onLoaded)
            resolve()
          }
          
          if (videoRef.current && videoRef.current.readyState >= 3) { // HAVE_FUTURE_DATA
            resolve()
          } else {
            videoRef.current?.addEventListener('loadedmetadata', onLoaded)
          }
        })
        
        await videoRef.current.play()
      }
      
      setIsWebcamActive(true)
      setWebcamError(null)
      
      // Load models if needed
      if (!isInvigilatorView && !modelsLoaded) {
        await loadModels()
      }
      
      // Start processing loop
      if (!isInvigilatorView) {
        animationRef.current = requestAnimationFrame(analyzeFrame)
      }
    } catch (err: any) {
      console.error("Webcam error:", err)
      setWebcamError(
        err.message || "Webcam access failed. Check permissions and try again."
      )
      setIsWebcamActive(false)
    }
  }, [getCameraStream, analyzeFrame, loadModels, modelsLoaded, isInvigilatorView])

  const stopWebcam = useCallback(() => {
    cancelAnimationFrame(animationRef.current)
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsWebcamActive(false)
  }, [])

  /* ------------------------------------------------------------------ */
  /* Cleanup                                                             */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    return () => {
      stopWebcam()
      faceModelRef.current?.dispose()
      objectModelRef.current?.dispose()
    }
  }, [stopWebcam])

  return {
    videoRef,
    canvasRef,
    isWebcamActive,
    webcamError,
    modelsLoading,
    startWebcam,
    stopWebcam,
    detectionStats,
  }
}