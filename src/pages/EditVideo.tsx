import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { TopBar } from "../components/layout/TopBar";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { videoService } from "../services/api";
import { ArrowLeft, Save } from "lucide-react";
import { hapticFeedback } from "../utils/haptics";
import { toast } from "sonner";
import { Video } from "../types";

export function EditVideo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { batches, videos, refreshData, updateVideoInState } = useAppContext();
  
  const video = videos.find(v => v.id === id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [batchId, setBatchId] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [platform, setPlatform] = useState<"YouTube" | "Instagram" | "TikTok" | "LinkedIn" | "Other">("YouTube");
  const [videoType, setVideoType] = useState<"short_form" | "long_form" | "reel" | "ad" | "podcast" | "other">("short_form");
  const [duration, setDuration] = useState("");
  const [editedBeforePayment, setEditedBeforePayment] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [priceChangeReason, setPriceChangeReason] = useState("");
  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusReason, setBonusReason] = useState("");
  const [status, setStatus] = useState<Video["status"]>("not_started");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setDescription(video.description || "");
      setDriveLink(video.drive_link || "");
      setBatchId(video.batch_id || "");
      setPriority(video.priority);
      setPlatform(video.platform);
      setVideoType(video.video_type);
      setDuration(video.duration_minutes.toString());
      setEditedBeforePayment(video.edited_before_payment);
      setInternalNotes(video.internal_notes || "");
      setCustomPrice(video.custom_price?.toString() || "");
      setPriceChangeReason(video.price_change_reason || "");
      setBonusAmount(video.bonus_amount?.toString() || "");
      setBonusReason(video.bonus_reason || "");
      setStatus(video.status);
    }
  }, [video]);

  const activeBatches = batches.filter(b => b.status === "active" || b.id === video?.batch_id);

  if (!video) return <div className="p-4 text-center text-text-secondary">Video not found</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    setIsSubmitting(true);
    try {
      let updatedVideo = video;
      
      // If status changed, use changeVideoStatus to update timeline fields
      if (status !== video.status) {
        updatedVideo = await videoService.changeVideoStatus(video.id, status, "Status updated from Edit Video");
      }

      // Update other fields
      updatedVideo = await videoService.updateVideo(video.id, {
        title,
        description,
        drive_link: driveLink,
        batch_id: batchId || null,
        edited_before_payment: editedBeforePayment,
        priority,
        video_type: videoType,
        platform,
        duration_minutes: parseFloat(duration) || 0,
        internal_notes: internalNotes,
        custom_price: customPrice ? parseFloat(customPrice) : null,
        price_change_reason: priceChangeReason || null,
        bonus_amount: bonusAmount ? parseFloat(bonusAmount) : null,
        bonus_reason: bonusReason || null,
      });

      updateVideoInState(updatedVideo);
      hapticFeedback('success');
      toast.success("Video updated successfully");
      refreshData(true);
      navigate(`/videos/${video.id}`);
    } catch (error: any) {
      console.error("Edit video error:", error);
      hapticFeedback('error');
      toast.error(error.message || "Failed to update video");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background">
      <TopBar 
        title="Edit Video" 
        leftAction={
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text-secondary hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />
      
      <div className="p-4 max-w-3xl mx-auto w-full">
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Drive Link</label>
                <input
                  type="url"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Batch</label>
                  <select
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">No Batch</option>
                    {activeBatches.map(b => (
                      <option key={b.id} value={b.id}>{b.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="revision">Revision</option>
                    <option value="delivered">Delivered</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
                  <select
                    value={videoType}
                    onChange={(e) => setVideoType(e.target.value as any)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="short_form">Short Form</option>
                    <option value="long_form">Long Form</option>
                    <option value="reel">Reel</option>
                    <option value="ad">Ad</option>
                    <option value="podcast">Podcast</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Duration (min)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editedBeforePayment"
                  checked={editedBeforePayment}
                  onChange={(e) => setEditedBeforePayment(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-surface text-accent focus:ring-accent"
                />
                <label htmlFor="editedBeforePayment" className="text-sm text-white">
                  Edited before payment
                </label>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Pricing Overrides</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Custom Price (Optional)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        placeholder="Default rate"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Reason for Custom Price</label>
                      <input
                        type="text"
                        value={priceChangeReason}
                        onChange={(e) => setPriceChangeReason(e.target.value)}
                        placeholder="e.g. Complex edits"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Bonus Amount (Optional)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={bonusAmount}
                        onChange={(e) => setBonusAmount(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Reason for Bonus</label>
                      <input
                        type="text"
                        value={bonusReason}
                        onChange={(e) => setBonusReason(e.target.value)}
                        placeholder="e.g. Extra revisions"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Internal Notes</label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent min-h-[80px]"
                />
              </div>

              <Button type="submit" className="w-full mt-4" isLoading={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
