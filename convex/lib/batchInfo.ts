import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";

export async function getBatchInfo(ctx: QueryCtx, courseId: Id<"courses">) {
  const batchInfo = await ctx.db
    .query("batches")
    .withIndex("uniq_batch_course", (q) => q.eq("courseId", courseId))
    .collect();
  return batchInfo;
}
