import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { getRelativeTime } from "../utils/helpers";
import { getAverageRevisions } from "../utils/financials";
import { RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Revisions() {
  const { videos, revisions } = useAppContext();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("All");
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);

  const totalRevisions = revisions.length;
  const avgPerVideo = getAverageRevisions(videos, revisions);
  
  const videosWithRevisions = videos.filter(v => revisions.some(r => r.video_id === v.id));
  const flaggedVideos = videosWithRevisions.filter(v => revisions.filter(r => r.video_id === v.id).length >= 3);
  const openRevisionsVideos = videosWithRevisions.filter(v => revisions.some(r => r.video_id === v.id && r.status !== "completed"));

  let displayVideos = videosWithRevisions;
  if (filter === "Flagged (3+)") displayVideos = flaggedVideos;
  if (filter === "Has Open Revisions") displayVideos = openRevisionsVideos;

  return (
    <div className="flex flex-col min-h-screen pb-24 px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Revisions</h1>
      </div>
      
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <div className="bg-surface rounded-2xl p-4 flex flex-col justify-between h-24 border border-border">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Total</p>
            <p className="text-lg font-bold text-white tracking-tight">{totalRevisions}</p>
          </div>
          <div className="bg-surface rounded-2xl p-4 flex flex-col justify-between h-24 border border-border">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Avg / Video</p>
            <p className="text-lg font-bold text-white tracking-tight">{avgPerVideo.toFixed(1)}</p>
          </div>
          <div 
            className="bg-surface rounded-2xl p-4 flex flex-col justify-between h-24 border border-border cursor-pointer hover:border-error/50 transition-colors"
            onClick={() => setFilter("Flagged (3+)")}
          >
            <p className="text-[10px] font-bold text-error uppercase tracking-widest">Flagged (3+)</p>
            <p className="text-lg font-bold text-error tracking-tight">{flaggedVideos.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 space-x-2 no-scrollbar">
          {["All", "Flagged (3+)", "Has Open Revisions"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 border ${
                filter === f 
                  ? "bg-white text-black border-white" 
                  : "bg-surface text-text-secondary border-border hover:border-text-secondary hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Revision List */}
        <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:space-y-0">
          {displayVideos.length > 0 ? displayVideos.map(video => {
            const videoRevs = revisions.filter(r => r.video_id === video.id).sort((a, b) => b.revision_number - a.revision_number);
            const totalRevs = videoRevs.length;
            const lastRev = videoRevs[0];
            const isExpanded = expandedVideoId === video.id;
            
            let colorClass = "border-success";
            if (totalRevs >= 4) colorClass = "border-error";
            else if (totalRevs >= 2) colorClass = "border-warning";

            return (
              <Card key={video.id} className={`border-l-4 ${colorClass}`}>
                <CardContent className="p-0">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedVideoId(isExpanded ? null : video.id)}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-medium text-white truncate mb-1">{video.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{totalRevs} Total</Badge>
                        <span className="text-xs text-text-secondary">Last: {getRelativeTime(lastRev.requested_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={lastRev.status === "completed" ? "success" : lastRev.status === "in_progress" ? "warning" : "error"}>
                        {lastRev.status.toUpperCase()}
                      </Badge>
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-text-secondary" /> : <ChevronRight className="w-5 h-5 text-text-secondary" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border bg-surface/50 p-4 space-y-4">
                      {videoRevs.map(rev => (
                        <div key={rev.id} className="relative pl-6 border-l-2 border-border pb-4 last:pb-0 last:border-transparent">
                          <div className="absolute w-3 h-3 bg-accent rounded-full -left-[7px] top-1" />
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm text-white">Revision #{rev.revision_number}</span>
                            <span className="text-xs text-text-secondary">{getRelativeTime(rev.requested_at)}</span>
                          </div>
                          <p className="text-sm text-text-primary mb-2">"{rev.client_notes}"</p>
                          {rev.editor_notes && (
                            <div className="bg-surface p-2 rounded-lg border border-border mt-2">
                              <p className="text-xs text-text-secondary mb-1 uppercase tracking-wider">Editor Note</p>
                              <p className="text-sm text-text-primary">{rev.editor_notes}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant={rev.status === "completed" ? "success" : rev.status === "in_progress" ? "warning" : "error"}>
                              {rev.status.toUpperCase()}
                            </Badge>
                            {rev.time_spent_minutes > 0 && (
                              <span className="text-xs text-text-secondary">{rev.time_spent_minutes}m spent</span>
                            )}
                          </div>
                        </div>
                      ))}
                      <button 
                        className="w-full py-2 mt-2 text-sm text-accent font-medium hover:bg-accent/10 rounded-xl transition-colors"
                        onClick={(e) => { e.stopPropagation(); navigate(`/videos/${video.id}`); }}
                      >
                        View Video Details
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          }) : (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-border mx-auto mb-3" />
              <p className="text-text-secondary">No revisions found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
