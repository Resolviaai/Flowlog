import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { TopBar } from "../components/layout/TopBar";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { formatDate, getRelativeTime } from "../utils/helpers";
import { ArrowLeft, ExternalLink, Copy, Clock, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { videoService, revisionService } from "../services/api";

export function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { videos, batches, revisions, role, refreshData, removeVideoFromState } = useAppContext();

  const video = videos.find(v => v.id === id);
  const batch = batches.find(b => b.id === video?.batch_id);
  const videoRevisions = revisions.filter(r => r.video_id === id).sort((a, b) => b.revision_number - a.revision_number);

  if (!video) return <div className="p-4 text-center text-text-secondary">Video not found</div>;

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      try {
        await videoService.deleteVideo(video.id);
        removeVideoFromState(video.id);
        toast.success("Video deleted successfully");
        navigate("/videos");
        refreshData(true); // Refresh in background
      } catch (error: any) {
        console.error("Failed to delete video:", error);
        toast.error(error.message || "Failed to delete video");
      }
    }
  };

  const handleCopyLink = () => {
    if (video?.drive_link) {
      navigator.clipboard.writeText(video.drive_link);
      toast.success("Link copied to clipboard");
    } else {
      toast.error("No link to copy");
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background">
      <TopBar 
        title="Video Details" 
        leftAction={
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text-secondary hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />
      
      <div className="p-4 space-y-6 md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
        <div className="md:col-span-2 space-y-6">
          {/* Header Section */}
          <section>
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{video.title}</h1>
              {role === "editor" && (
                <button onClick={() => navigate(`/videos/${id}/edit`)} className="p-2 text-text-secondary hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-text-secondary mb-4">{video.description || "No description provided."}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={video.status === "approved" ? "success" : video.status === "delivered" ? "info" : video.status === "in_progress" ? "warning" : "default"}>
                {video.status.replace("_", " ").toUpperCase()}
              </Badge>
              <Badge variant={video.priority === "high" || video.priority === "urgent" ? "error" : "default"}>
                {video.priority.toUpperCase()}
              </Badge>
              <Badge variant="default">{video.platform}</Badge>
              <Badge variant="default">{video.video_type.replace("_", " ")}</Badge>
              <Badge variant="default">{video.duration_minutes} min</Badge>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Timeline</h2>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <TimelineItem label="Created" date={video.created_at} active={true} />
                  <TimelineItem label="Started" date={video.started_at} active={!!video.started_at} />
                  <TimelineItem label="Delivered" date={video.delivered_at} active={!!video.delivered_at} />
                  <TimelineItem label="Approved" date={video.approved_at} active={!!video.approved_at} isLast />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Revisions */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Revisions ({videoRevisions.length})</h2>
              {role === "client" && <Button variant="ghost" size="sm" className="h-8 text-accent" onClick={() => navigate(`/videos/${id}/revisions/add`)}>Request</Button>}
              {role === "editor" && <Button variant="ghost" size="sm" className="h-8 text-accent" onClick={() => navigate(`/videos/${id}/revisions/add`)}>Add</Button>}
            </div>
            <div className="space-y-3">
              {videoRevisions.length > 0 ? videoRevisions.map(rev => (
                <Card key={rev.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm text-white">Revision #{rev.revision_number}</span>
                      <Badge variant={rev.status === "completed" ? "success" : rev.status === "in_progress" ? "warning" : "error"}>
                        {rev.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-primary mb-2">"{rev.client_notes}"</p>
                    <div className="flex justify-between items-center mt-3 text-xs text-text-secondary">
                      <span>{getRelativeTime(rev.requested_at)}</span>
                      <div className="flex items-center gap-3">
                        {rev.time_spent_minutes > 0 && <span>{rev.time_spent_minutes}m spent</span>}
                        {role === "editor" && rev.status !== "completed" && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="h-7 text-xs px-2"
                            onClick={async () => {
                              try {
                                await revisionService.updateRevision(rev.id, { status: "completed" });
                                toast.success("Revision marked as complete");
                                refreshData(true);
                              } catch (error: any) {
                                toast.error("Failed to update revision");
                              }
                            }}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <p className="text-sm text-text-secondary text-center py-4">No revisions requested.</p>
              )}
            </div>
          </section>

          {/* Danger Zone */}
          {role === "editor" && (
            <section className="pt-4">
              <Button variant="danger" className="w-full" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Video
              </Button>
            </section>
          )}
        </div>
        
        <div className="md:col-span-1 space-y-6">
          {/* Batch Info */}
          <section>
            <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Assignment</h2>
            <Card>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-white">{batch?.label || "Unassigned"}</p>
                  {video.edited_before_payment && <p className="text-xs text-warning mt-1">Edited before payment</p>}
                </div>
                {role === "editor" && <Button variant="secondary" size="sm" onClick={() => navigate(`/videos/${id}/edit`)}>Change</Button>}
              </CardContent>
            </Card>
          </section>

          {/* Drive Link */}
          <section>
            <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Assets</h2>
            <Card>
              <CardContent className="p-4 flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => window.open(video.drive_link, "_blank")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Drive
                </Button>
                <Button variant="secondary" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Internal Notes */}
          {role === "editor" && video.internal_notes && (
            <section>
              <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Internal Notes</h2>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{video.internal_notes}</p>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ label, date, active, isLast = false }: { label: string; date: string | null; active: boolean; isLast?: boolean }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${active ? "bg-accent" : "bg-surface border border-border"}`} />
        {!isLast && <div className={`w-0.5 h-full my-1 ${active ? "bg-accent/50" : "bg-border"}`} />}
      </div>
      <div className="pb-4">
        <p className={`text-sm font-medium ${active ? "text-white" : "text-text-secondary"}`}>{label}</p>
        {date && <p className="text-xs text-text-secondary mt-0.5">{formatDate(date)}</p>}
      </div>
    </div>
  );
}
