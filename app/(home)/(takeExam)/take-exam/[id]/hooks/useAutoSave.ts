// hooks/useAutoSave.ts
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Define the possible answer types based on question types
type AnswerValue = string | number | boolean;

// This hook tracks changes and saves them periodically.
export function useAutoSave(examId: Id<"exams">) {
  const saveAnswersMutation = useMutation(api.answers.saveStudentAnswers);
  
  // This state holds only the answers that have changed since the last save.
  const [dirtyAnswers, setDirtyAnswers] = useState<Record<string, AnswerValue>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      // Every 30 seconds, check if there are any "dirty" answers to save.
      if (Object.keys(dirtyAnswers).length > 0) {
        console.log("Auto-saving changes...", dirtyAnswers);
        
        // Send ONLY the changed answers to the backend.
        saveAnswersMutation({ examId, changedAnswers: dirtyAnswers });
        
        // Reset the dirty state after saving.
        setDirtyAnswers({});
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [examId, saveAnswersMutation, dirtyAnswers]);

  // Call this function whenever an answer changes in your UI.
  const markAnswerAsDirty = (questionId: string, answer: AnswerValue) => {
    setDirtyAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  return { markAnswerAsDirty };
}