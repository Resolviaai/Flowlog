import { PaymentBatch, Video, Revision } from "../types";

export function getBatchBalance(batch: PaymentBatch, videos: Video[]) {
  const completedVideosInBatch = videos.filter(
    (v) => v.batch_id === batch.id && (v.status === "delivered" || v.status === "approved" || v.status === "archived")
  );
  
  const consumedAmount = completedVideosInBatch.reduce((total, v) => {
    const basePrice = v.custom_price !== null && v.custom_price !== undefined ? v.custom_price : batch.rate_at_time_of_batch;
    const bonus = v.bonus_amount || 0;
    return total + basePrice + bonus;
  }, 0);

  return batch.amount_paid - consumedAmount;
}

export function getTotalBalance(batches: PaymentBatch[], videos: Video[]) {
  return batches.reduce((total, batch) => total + getBatchBalance(batch, videos), 0);
}

export function getTotalRevenue(videos: Video[], rate: number) {
  const completedVideos = videos.filter(
    (v) => v.status === "delivered" || v.status === "approved" || v.status === "archived"
  );
  
  return completedVideos.reduce((total, v) => {
    const basePrice = v.custom_price !== null && v.custom_price !== undefined ? v.custom_price : rate;
    const bonus = v.bonus_amount || 0;
    return total + basePrice + bonus;
  }, 0);
}

export function getUnpaidWorkValue(videos: Video[], rate: number) {
  const unpaidVideos = videos.filter((v) => v.edited_before_payment && v.status !== "not_started");
  
  return unpaidVideos.reduce((total, v) => {
    const basePrice = v.custom_price !== null && v.custom_price !== undefined ? v.custom_price : rate;
    const bonus = v.bonus_amount || 0;
    return total + basePrice + bonus;
  }, 0);
}

export function getAverageRevisions(videos: Video[], revisions: Revision[]) {
  const completedCount = videos.filter(
    (v) => v.status === "delivered" || v.status === "approved" || v.status === "archived"
  ).length;
  if (completedCount === 0) return 0;
  return revisions.length / completedCount;
}
