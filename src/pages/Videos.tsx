import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { TopBar } from "../components/layout/TopBar";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { getRelativeTime } from "../utils/helpers";
import { Search, Plus, ChevronRight, PlaySquare, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hapticFeedback } from "../utils/haptics";
import { toast } from "sonner";

export function Videos() {
  const { videos, batches, revisions, role, refreshData } = useAppContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("All");

  const filters = ["All", "Not Started", "In Progress", "Revision", "Delivered", "Approved"];

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || v.status.replace("_", " ").toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <TopBar 
        title="Videos" 
        rightAction={
          <button 
            onClick={() => {
              refreshData();
              hapticFeedback('light');
              toast.success("Refreshing data...");
            }} 
            className="p-2 text-text-secondary hover:text-white transition-colors bg-surface/50 rounded-full"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        }
      />
      
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 space-x-2 no-scrollbar">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                filter === f ? "bg-accent text-white" : "bg-surface text-text-secondary hover:bg-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Video List */}
        <div className="space-y-3">
          {filteredVideos.length > 0 ? filteredVideos.map(video => {
            const batch = batches.find(b => b.id === video.batch_id);
            const revCount = revisions.filter(r => r.video_id === video.id).length;
            
            let priorityColor = "bg-success";
            if (video.priority === "high") priorityColor = "bg-warning";
            if (video.priority === "urgent") priorityColor = "bg-error";
            if (video.priority === "low") priorityColor = "bg-text-secondary";

            return (
              <Card key={video.id} className="cursor-pointer hover:bg-white/5 transition-colors" onClick={() => navigate(`/videos/${video.id}`)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${priorityColor}`} />
                      <h3 className="font-medium text-white truncate">{video.title}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="default">{video.platform}</Badge>
                      {batch && <Badge variant="info">{batch.label}</Badge>}
                      {revCount > 0 && <Badge variant={revCount >= 3 ? "error" : "warning"}>{revCount} Revs</Badge>}
                      <Badge variant={video.status === "approved" ? "success" : video.status === "delivered" ? "info" : video.status === "in_progress" ? "warning" : "default"}>
                        {video.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary mt-2">Created {getRelativeTime(video.created_at)}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-secondary flex-shrink-0" />
                </CardContent>
              </Card>
            );
          }) : (
            <div className="text-center py-12">
              <PlaySquare className="w-12 h-12 text-border mx-auto mb-3" />
              <p className="text-text-secondary">No videos found.</p>
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      {role === "editor" && (
        <button 
          onClick={() => navigate("/videos/add")}
          className="fixed bottom-20 right-4 w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/20 hover:bg-accent/90 transition-colors z-40"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}
