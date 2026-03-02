import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { TopBar } from "../components/layout/TopBar";
import { WorkspaceSwitcher } from "../components/layout/WorkspaceSwitcher";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { formatCurrency, getRelativeTime } from "../utils/helpers";
import { getTotalBalance, getUnpaidWorkValue, getTotalRevenue, getAverageRevisions, getBatchBalance } from "../utils/financials";
import { Activity, PlaySquare, RefreshCw, DollarSign, AlertCircle, Bell, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hapticFeedback } from "../utils/haptics";
import { toast } from "sonner";

export function Home() {
  const { batches, videos, revisions, activityLog, role, profile, currentWorkspace, pendingInvites, refreshData } = useAppContext();
  const navigate = useNavigate();

  const [showAllActivity, setShowAllActivity] = useState(false);

  if (!currentWorkspace) return null;

  const totalBalance = getTotalBalance(batches, videos);
  const inProgressCount = videos.filter(v => v.status === "in_progress").length;
  const pendingRevisions = revisions.filter(r => r.status === "requested" || r.status === "in_progress").length;
  const revenueEarned = getTotalRevenue(videos, currentWorkspace.rate_per_video);
  const unpaidWorkValue = getUnpaidWorkValue(videos, currentWorkspace.rate_per_video);
  const avgRevisions = getAverageRevisions(videos, revisions);

  const activeBatches = batches.filter(b => b.status === "active");
  const activeVideos = videos.filter(v => v.status === "in_progress" || v.status === "revision");
  const recentActivity = showAllActivity ? activityLog : activityLog.slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen pb-24 px-4 pt-6">
      {/* Header Section */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary font-medium">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
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
        </div>
        
        <WorkspaceSwitcher />
      </div>
      
      <div className="space-y-6">
        {/* Pending Invites Alert */}
        {pendingInvites.length > 0 && (
          <button 
            onClick={() => navigate("/workspaces")}
            className="w-full bg-accent/10 border border-accent/20 rounded-2xl p-4 flex items-center justify-between group hover:bg-accent/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">You have {pendingInvites.length} pending {pendingInvites.length === 1 ? 'invite' : 'invites'}</p>
                <p className="text-xs text-text-secondary">Click to view and respond</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-white transition-colors" />
          </button>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          <KpiCard title="Total Balance" value={formatCurrency(totalBalance, currentWorkspace.currency_symbol)} />
          <KpiCard title="In Progress" value={inProgressCount} />
          <KpiCard title="Pending Revisions" value={pendingRevisions} />
          {role === "editor" && (
            <>
              <KpiCard title="Revenue Earned" value={formatCurrency(revenueEarned, currentWorkspace.currency_symbol)} />
              <KpiCard title="Unpaid Work" value={formatCurrency(unpaidWorkValue, currentWorkspace.currency_symbol)} />
              <KpiCard title="Avg Revisions" value={avgRevisions.toFixed(1)} />
            </>
          )}
        </div>

        {/* Batch Progress */}
        <section>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Active Batches</h2>
          <div className="space-y-3">
            {activeBatches.length > 0 ? activeBatches.map(batch => {
              const balance = getBatchBalance(batch, videos);
              const percent = Math.max(0, Math.min(100, (balance / batch.amount_paid) * 100));
              let colorClass = "bg-success";
              if (percent < 20) colorClass = "bg-error";
              else if (percent < 50) colorClass = "bg-warning";

              return (
                <Card key={batch.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{batch.label}</span>
                      <span className="text-sm text-text-secondary">{formatCurrency(balance, currentWorkspace.currency_symbol)} left</span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                      <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${percent}%` }} />
                    </div>
                  </CardContent>
                </Card>
              );
            }) : (
              <p className="text-sm text-text-secondary text-center py-4">No active batches.</p>
            )}
          </div>
        </section>

        {/* Active Videos */}
        <section>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Active Videos</h2>
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 space-x-3 no-scrollbar">
            {activeVideos.length > 0 ? activeVideos.map(video => {
              const batch = batches.find(b => b.id === video.batch_id);
              const revCount = revisions.filter(r => r.video_id === video.id).length;
              return (
                <Card key={video.id} className="min-w-[240px] flex-shrink-0">
                  <CardContent className="p-4">
                    <h3 className="font-medium truncate mb-2">{video.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="info">{batch?.label || "No Batch"}</Badge>
                      {revCount > 0 && <Badge variant={revCount >= 3 ? "error" : "warning"}>{revCount} Revs</Badge>}
                    </div>
                    <Badge variant={video.status === "in_progress" ? "warning" : "error"}>
                      {video.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>
              );
            }) : (
              <p className="text-sm text-text-secondary text-center py-4 w-full">No active videos.</p>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Recent Activity</h2>
          <Card>
            <div className="divide-y divide-border">
              {recentActivity.length > 0 ? (
                <>
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="p-4 flex items-start gap-3">
                      <div className="mt-0.5 bg-surface p-1.5 rounded-lg text-text-secondary">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-text-primary">{activity.description}</p>
                        <p className="text-xs text-text-secondary mt-1">{getRelativeTime(activity.created_at)}</p>
                      </div>
                    </div>
                  ))}
                  {activityLog.length > 5 && (
                    <button 
                      onClick={() => setShowAllActivity(!showAllActivity)}
                      className="w-full p-3 text-sm text-accent hover:bg-white/5 transition-colors font-medium"
                    >
                      {showAllActivity ? "Show Less" : "Show More"}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-sm text-text-secondary text-center py-4">No recent activity.</p>
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon }: { title: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <Card className="bg-surface border-border">
      <CardContent className="p-4 flex flex-col justify-between h-24">
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{title}</span>
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}
