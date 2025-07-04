import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "update exams status",
  {minutes: 1}, // every minute
  internal.exam.updatedExamStatus
);

export default crons;