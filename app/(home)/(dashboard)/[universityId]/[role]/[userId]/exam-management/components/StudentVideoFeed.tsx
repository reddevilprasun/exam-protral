// components/exam/StudentVideoFeed.tsx

"use client"

import { useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Camera, WifiOff } from "lucide-react"
import { FunctionReturnType } from "convex/server"
import { api } from "@/convex/_generated/api"

interface StudentVideoFeedProps {
  student: NonNullable<FunctionReturnType<typeof api.proctoring.getStudentsForExamQuery>>[number];
  stream: MediaStream | null
  studentStatus: "live" | "connecting" | "disconnected"; 
}

export default function StudentVideoFeed({ student, stream, studentStatus }: StudentVideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Attach the incoming stream to the video element
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const renderBadge = () => {
    switch (studentStatus) {
      case "live":
        return <Badge variant="default" className="bg-green-600 animate-pulse">Live</Badge>;
      case "connecting":
        return <Badge variant="secondary">Connecting...</Badge>;
      case "disconnected":
        return <Badge variant="destructive">Disconnected</Badge>;
    }
  };

  const renderPlaceholder = () => {
    if (studentStatus === "disconnected") {
      return (
        <div className="text-center text-gray-400">
          <WifiOff className="h-8 w-8 mx-auto mb-2" />
          <p className="text-xs">Student Disconnected</p>
        </div>
      );
    }
    return (
      <div className="text-center text-gray-400">
        <Camera className="h-8 w-8 mx-auto mb-2" />
        <p className="text-xs">Waiting for stream...</p>
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-white">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{student.firstName + " " + student.lastName} ({student.academicId})</h4>
        {renderBadge()}
      </div>
      <div className="w-full aspect-video bg-gray-900 rounded-md flex items-center justify-center text-white">
        <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${!stream ? "hidden" : ""}`} />
        {!stream && renderPlaceholder()}
      </div>
    </div>
  );
}