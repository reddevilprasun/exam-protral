import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/userInfo"; // Your user helper
import { ConvexError } from "convex/values";

// MUTATION for the student's client to log a new alert
export const logCheatingAlert = mutation({
  args: {
    examId: v.id("exams"),
    proctoringSessionId: v.optional(v.id("proctoringSessions")),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    type: v.union(
      v.literal("phone_detected"),
      v.literal("looking_away"),
      v.literal("multiple_faces"),
      v.literal("no_face"),
      v.literal("suspicious_movement"),
      v.literal("audio_detected"),
      v.literal("tab_switch"),
      v.literal("fullscreen_exit")
    ),
    timestamp: v.float64(),
    confidence: v.float64(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await getCurrentUser(ctx);
    if (!student) throw new ConvexError("Not authenticated.");
    
    // Add security checks here if needed to ensure the student
    // is actually enrolled in the exam.

    await ctx.db.insert("cheatingAlerts", {
      ...args,
      studentId: student._id,
      resolved: false, // All new alerts are unresolved
    });
  },
});

export const getUnresolvedAlertsForExam = query({
  args: { examId: v.id("exams") },
  handler: async (ctx, { examId }) => {
    const alerts = await ctx.db
      .query("cheatingAlerts")
      .withIndex("by_exam_and_resolved", (q) =>
        q.eq("examId", examId).eq("resolved", false)
      )
      .order("desc")
      .collect();
    
    // Enrich alerts with student info
    return Promise.all(
      alerts.map(async (alert) => {
        const student = await ctx.db.get(alert.studentId);
        const studentName = student?.firstName + " " + student?.lastName;
        return {
          ...alert,
          studentName: studentName  ?? "Unknown Student",
        };
      })
    );
  },
});

export const resolveCheatingAlert = mutation({
  args: {
    alertId: v.id("cheatingAlerts"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { alertId, notes }) => {
    const invigilator = await getCurrentUser(ctx);
    if (!invigilator) throw new ConvexError("Not authenticated.");
    // Add security checks here to ensure the user is an invigilator for this exam

    await ctx.db.patch(alertId, {
      resolved: true,
      resolvedBy: invigilator._id,
      resolvedAt: Date.now(),
      notes: notes,
    });
  },
});