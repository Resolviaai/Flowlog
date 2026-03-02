import React from "react";
import { useAppContext } from "../context/AppContext";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { formatCurrency, formatDate } from "../utils/helpers";
import { getBatchBalance, getTotalBalance } from "../utils/financials";
import { Plus, Wallet, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hapticFeedback } from "../utils/haptics";
import { toast } from "sonner";

export function Batches() {
  const { batches, videos, currentWorkspace, role, refreshData } = useAppContext();
  const navigate = useNavigate();

  if (!currentWorkspace) return null;

  const totalPaid = batches.reduce((sum, b) => sum + b.amount_paid, 0);
  const netBalance = getTotalBalance(batches, videos);
  const consumed = totalPaid - netBalance;

  return (
    <div className="flex flex-col min-h-screen pb-24 px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Batches</h1>
        <button 
          onClick={() => {
            refreshData();
            hapticFeedback('light');
            toast.success("Refreshing data...");
          }} 
          className="p-2 text-text-secondary hover:text-white transition-colors bg-surface/50 rounded-full"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <div className="bg-surface rounded-2xl p-4 flex flex-col justify-between h-24 border border-border">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Total Paid</p>
            <p className="text-lg font-bold text-white tracking-tight">{formatCurrency(totalPaid, currentWorkspace.currency_symbol)}</p>
          </div>
          <div className="bg-surface rounded-2xl p-4 flex flex-col justify-between h-24 border border-border">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Consumed</p>
            <p className="text-lg font-bold text-white tracking-tight">{formatCurrency(consumed, currentWorkspace.currency_symbol)}</p>
          </div>
          <div className="bg-surface rounded-2xl p-4 flex flex-col justify-between h-24 border border-border">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Net Balance</p>
            <p className="text-lg font-bold text-accent tracking-tight">{formatCurrency(netBalance, currentWorkspace.currency_symbol)}</p>
          </div>
        </div>

        {/* Batch List */}
        <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:space-y-0">
          {batches.length > 0 ? batches.map(batch => {
            const balance = getBatchBalance(batch, videos);
            const videosCount = videos.filter(v => v.batch_id === batch.id).length;
            const percent = Math.max(0, Math.min(100, (balance / batch.amount_paid) * 100));
            
            let statusColor = "bg-success";
            if (batch.status === "exhausted") statusColor = "bg-error";
            if (batch.status === "overpaid") statusColor = "bg-warning";

            return (
              <Card key={batch.id} className="cursor-pointer hover:bg-white/5 transition-colors" onClick={() => navigate(`/batches/${batch.id}`)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-white">{batch.label}</h3>
                      <p className="text-xs text-text-secondary mt-1">{formatDate(batch.date_paid)} • {batch.payment_method}</p>
                    </div>
                    <Badge variant={batch.status === "active" ? "success" : batch.status === "exhausted" ? "error" : "warning"}>
                      {batch.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{formatCurrency(batch.amount_paid, currentWorkspace.currency_symbol)}</Badge>
                      <span className="text-xs text-text-secondary">{videosCount} videos</span>
                    </div>
                    <span className="font-medium text-white">{formatCurrency(balance, currentWorkspace.currency_symbol)} left</span>
                  </div>

                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <div className={`h-full ${statusColor} transition-all duration-500`} style={{ width: `${percent}%` }} />
                  </div>
                </CardContent>
              </Card>
            );
          }) : (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-border mx-auto mb-3" />
              <p className="text-text-secondary">No batches found.</p>
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      {role === "editor" && (
        <button 
          onClick={() => navigate("/batches/add")}
          className="fixed bottom-20 right-4 w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/20 hover:bg-accent/90 transition-colors z-40"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}
