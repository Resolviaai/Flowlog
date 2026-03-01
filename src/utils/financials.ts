import { PaymentBatch, Video, Revision } from "../types";

export function getBatchBalance(batch: PaymentBatch, videos: Video[]) {
  const completedVideosInBatch = videos.filter(
    (v) => v.batch_id === batch.id && (v.status === "delivered" || v.status === "approved" || v.status === "archived")
  );
  const consumedAmount = completedVideosInBatch.length * batch.rate_at_time_of_batch;
  return batch.amount_paid - consumedAmount;
}

export function getTotalBalance(batches: PaymentBatch[], videos: Video[]) {
  return batches.reduce((total, batch) => total + getBatchBalance(batch, videos), 0);
}

export function getTotalRevenue(videos: Video[], rate: number) {
  const completedCount = videos.filter(
    (v) => v.status === "delivered" || v.status === "approved" || v.status === "archived"
  ).length;
  return completedCount * rate;
}

export function getUnpaidWorkValue(videos: Video[], rate: number) {
  const unpaidVideos = videos.filter((v) => v.edited_before_payment && v.status !== "not_started");
  return unpaidVideos.length * rate;
}

export function getAverageRevisions(videos: Video[], revisions: Revision[]) {
  const completedCount = videos.filter(
    (v) => v.status === "delivered" || v.status === "approved" || v.status === "archived"
  ).length;
  if (completedCount === 0) return 0;
  return revisions.length / completedCount;
}
