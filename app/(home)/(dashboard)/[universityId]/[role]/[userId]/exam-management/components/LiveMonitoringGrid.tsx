// components/exam/LiveMonitoringGrid.tsx

"use client";
import { api } from "@/convex/_generated/api"; // Adjust path if needed
import { Doc, Id } from "@/convex/_generated/dataModel"; // Adjust path if needed
import StudentVideoFeed from "./StudentVideoFeed";
import { Eye } from "lucide-react";
import { FunctionReturnType } from "convex/server";


interface LiveMonitoringGridProps {
  students: FunctionReturnType<typeof api.proctoring.getStudentsForExamQuery> | null | undefined;
  videoStreams: Map<Id<"users">, MediaStream>;
  activeSessions: Doc<"proctoringSessions">[] | null | undefined;
}

export default function LiveMonitoringGrid({
  students,
  videoStreams,
  activeSessions
}: LiveMonitoringGridProps) {
  
  if (!students) {
    return <div>Loading student list...</div>;
  }

  const activeStudentIds = new Set(
    activeSessions?.map((session) => session.studentId) ?? []
  );

  if (students.length === 0) {
    return (
      <div className="col-span-2">
        <div className="text-center py-12 border rounded-lg">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No active students
          </h3>
          <p className="text-gray-500">
            No students are currently connected to this exam session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {students.map((student) => {
        if (!student || !student._id) return null;

        // ✅ Determine the status for this student
        const hasActiveSession = activeStudentIds.has(student._id);
        const stream = videoStreams.get(student._id) ?? null;
        
        let status: "live" | "connecting" | "disconnected";

        if (hasActiveSession) {
          status = stream ? "live" : "connecting";
        } else {
          status = "disconnected";
        }

        return (
          <StudentVideoFeed
            key={student._id}
            student={student}
            stream={stream}
            // ✅ Pass the calculated status down to the child component
            studentStatus={status}
          />
        );
      })}
    </div>
  );
}
