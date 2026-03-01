import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { TopBar } from "../components/layout/TopBar";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { getRelativeTime } from "../utils/helpers";
import { Activity as ActivityIcon, ArrowLeft, PlaySquare, Wallet, RefreshCw, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Activity() {
  const { activityLog } = useAppContext();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<string>("All Time");

  const filters = ["All", "Videos", "Batches", "Revisions", "Settings"];
  const dateRanges = ["Last 7 Days", "Last 30 Days", "All Time"];

  const filteredLog = activityLog.filter(log => {
    const matchesFilter = filter === "All" || log.entity_type === filter.toLowerCase().replace(/s$/, "");
    
    let matchesDate = true;
    const logDate = new Date(log.created_at);
    const now = new Date();
    if (dateRange === "Last 7 Days") {
      matchesDate = (now.getTime() - logDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
    } else if (dateRange === "Last 30 Days") {
      matchesDate = (now.getTime() - logDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
    }

    return matchesFilter && matchesDate;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "video": return <PlaySquare className="w-4 h-4" />;
      case "batch": return <Wallet className="w-4 h-4" />;
      case "revision": return <RefreshCw className="w-4 h-4" />;
      case "settings": return <Settings className="w-4 h-4" />;
      default: return <ActivityIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background">
      <TopBar 
        title="Activity Log" 
        leftAction={
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text-secondary hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />
      
      <div className="p-4 space-y-4">
        {/* Filters */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 space-x-2 no-scrollbar">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f ? "bg-accent text-white" : "bg-surface text-text-secondary hover:bg-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Date Ranges */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 space-x-2 no-scrollbar">
          {dateRanges.map(dr => (
            <button
              key={dr}
              onClick={() => setDateRange(dr)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                dateRange === dr ? "bg-surface text-white border border-border" : "text-text-secondary hover:text-white"
              }`}
            >
              {dr}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <Card>
          <div className="divide-y divide-border">
            {filteredLog.length > 0 ? filteredLog.map(activity => (
              <div key={activity.id} className="p-4 flex items-start gap-3 hover:bg-white/5 transition-colors">
                <div className="mt-0.5 bg-surface p-2 rounded-xl text-text-secondary border border-border">
                  {getIcon(activity.entity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary mb-1">{activity.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">{activity.entity_type.toUpperCase()}</Badge>
                    <span className="text-xs text-text-secondary">{getRelativeTime(activity.created_at)}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <ActivityIcon className="w-12 h-12 text-border mx-auto mb-3" />
                <p className="text-text-secondary">No activity found.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
