import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { TopBar } from "../components/layout/TopBar";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { formatCurrency, formatDate } from "../utils/helpers";
import { getBatchBalance } from "../utils/financials";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";

import { toast } from "sonner";
import { batchService } from "../services/api";

export function BatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { batches, videos, currentWorkspace, role, refreshData, removeBatchFromState } = useAppContext();

  const batch = batches.find(b => b.id === id);
  const batchVideos = videos.filter(v => v.batch_id === id);

  if (!batch || !currentWorkspace) return <div className="p-4 text-center text-text-secondary">Batch not found</div>;

  const handleDelete = async () => {
    const confirmMessage = batchVideos.length > 0 
      ? `This batch has ${batchVideos.length} assigned videos. Deleting it may affect them. Are you sure?`
      : "Are you sure you want to delete this batch? This action cannot be undone.";

    if (window.confirm(confirmMessage)) {
      try {
        await batchService.deleteBatch(batch.id);
        removeBatchFromState(batch.id);
        toast.success("Batch deleted successfully");
        navigate("/batches");
        refreshData(true); // Refresh in background
      } catch (error: any) {
        console.error("Failed to delete batch:", error);
        toast.error(error.message || "Failed to delete batch. It might have related records.");
      }
    }
  };

  const balance = getBatchBalance(batch, videos);
  const consumed = batch.amount_paid - balance;
  const percent = Math.max(0, Math.min(100, (balance / batch.amount_paid) * 100));
  
  let statusColor = "text-success";
  if (batch.status === "exhausted") statusColor = "text-error";
  if (batch.status === "overpaid") statusColor = "text-warning";

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background">
      <TopBar 
        title="Batch Details" 
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
              <h1 className="text-2xl font-bold text-white tracking-tight">{batch.label}</h1>
              {role === "editor" && (
                <button onClick={() => navigate(`/batches/${id}/edit`)} className="p-2 text-text-secondary hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-text-secondary mb-4">{batch.notes || "No notes provided."}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={batch.status === "active" ? "success" : batch.status === "exhausted" ? "error" : "warning"}>
                {batch.status.toUpperCase()}
              </Badge>
              <Badge variant="default">{batch.payment_method}</Badge>
              <Badge variant="default">{batch.payment_type.replace("_", " ")}</Badge>
              <Badge variant="info">{formatDate(batch.date_paid)}</Badge>
            </div>
          </section>

          {/* Assigned Videos */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Assigned Videos ({batchVideos.length})</h2>
              {role === "editor" && <Button variant="ghost" size="sm" className="h-8 text-accent">Add</Button>}
            </div>
            <div className="space-y-3">
              {batchVideos.length > 0 ? batchVideos.map(video => (
                <Card key={video.id} isClickable onClick={() => navigate(`/videos/${video.id}`)}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-medium text-white truncate mb-1">{video.title}</h3>
                      <Badge variant={video.status === "approved" ? "success" : video.status === "delivered" ? "info" : video.status === "in_progress" ? "warning" : "default"}>
                        {video.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <span className="font-medium text-text-secondary">{formatCurrency(batch.rate_at_time_of_batch, currentWorkspace.currency_symbol)}</span>
                  </CardContent>
                </Card>
              )) : (
                <p className="text-sm text-text-secondary text-center py-4">No videos assigned to this batch.</p>
              )}
            </div>
          </section>
        </div>

        <div className="md:col-span-1 space-y-6">
          {/* Financial Summary */}
          <section>
            <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Financials</h2>
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Paid</p>
                    <p className="font-semibold text-white">{formatCurrency(batch.amount_paid, currentWorkspace.currency_symbol)}</p>
                  </div>
                  <div className="text-center border-l border-r border-border">
                    <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Consumed</p>
                    <p className="font-semibold text-white">{formatCurrency(consumed, currentWorkspace.currency_symbol)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Remaining</p>
                    <p className={`font-semibold ${statusColor}`}>{formatCurrency(balance, currentWorkspace.currency_symbol)}</p>
                  </div>
                </div>
                
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className={`h-full ${statusColor.replace('text-', 'bg-')} transition-all duration-500`} style={{ width: `${percent}%` }} />
                </div>
                <p className="text-xs text-text-secondary text-center mt-2">Rate at time of batch: {formatCurrency(batch.rate_at_time_of_batch, currentWorkspace.currency_symbol)}/video</p>
              </CardContent>
            </Card>
          </section>

          {/* Danger Zone */}
          {role === "editor" && (
            <section className="pt-4">
              <Button variant="danger" className="w-full" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Batch
              </Button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
