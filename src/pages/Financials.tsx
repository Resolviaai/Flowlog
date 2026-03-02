import React from "react";
import { useAppContext } from "../context/AppContext";
import { TopBar } from "../components/layout/TopBar";
import { Card, CardContent } from "../components/ui/Card";
import { formatCurrency, formatDate } from "../utils/helpers";
import { getTotalBalance, getUnpaidWorkValue, getTotalRevenue, getBatchBalance } from "../utils/financials";
import { Download, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function Financials() {
  const { currentWorkspace, batches, videos } = useAppContext();
  const navigate = useNavigate();

  if (!currentWorkspace) return null;

  const totalPaid = batches.reduce((sum, b) => sum + b.amount_paid, 0);
  const workDeliveredValue = getTotalRevenue(videos, currentWorkspace.rate_per_video);
  const currentBalance = getTotalBalance(batches, videos);
  const unpaidWork = getUnpaidWorkValue(videos, currentWorkspace.rate_per_video);
  const trueNet = currentBalance - unpaidWork;

  const unpaidVideos = videos.filter(v => v.edited_before_payment && v.status !== "not_started");

  const exportCSV = () => {
    const header = "Label,Date,Paid,Consumed,Balance\n";
    const rows = batches.map(b => {
      const balance = getBatchBalance(b, videos);
      const consumed = b.amount_paid - balance;
      return `${b.label},${formatDate(b.date_paid)},${b.amount_paid},${consumed},${balance}`;
    }).join("\n");
    const csv = header + rows;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "financials_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background">
      <TopBar 
        title="Financials" 
        leftAction={
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text-secondary hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />
      
      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <StatCard title="Total Paid" value={formatCurrency(totalPaid, currentWorkspace.currency_symbol)} color="text-white" />
          <StatCard title="Work Delivered" value={formatCurrency(workDeliveredValue, currentWorkspace.currency_symbol)} color="text-success" />
          <StatCard title="Current Balance" value={formatCurrency(currentBalance, currentWorkspace.currency_symbol)} color="text-accent" />
          <StatCard title="Unpaid Work" value={formatCurrency(unpaidWork, currentWorkspace.currency_symbol)} color="text-warning" />
          <StatCard title="True Net" value={formatCurrency(trueNet, currentWorkspace.currency_symbol)} color={trueNet >= 0 ? "text-success" : "text-error"} className="col-span-2 md:col-span-1" />
        </div>

        {/* Batch Breakdown */}
        <section>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Batch Breakdown</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-secondary uppercase bg-surface/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Batch</th>
                    <th className="px-4 py-3 font-medium">Paid</th>
                    <th className="px-4 py-3 font-medium">Cons.</th>
                    <th className="px-4 py-3 font-medium text-right">Bal.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {batches.map(b => {
                    const balance = getBatchBalance(b, videos);
                    const consumed = b.amount_paid - balance;
                    return (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">{b.label}</td>
                        <td className="px-4 py-3 text-text-secondary">{formatCurrency(b.amount_paid, currentWorkspace.currency_symbol)}</td>
                        <td className="px-4 py-3 text-text-secondary">{formatCurrency(consumed, currentWorkspace.currency_symbol)}</td>
                        <td className="px-4 py-3 text-right font-medium text-accent">{formatCurrency(balance, currentWorkspace.currency_symbol)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-surface/80 border-t border-border font-semibold">
                  <tr>
                    <td className="px-4 py-3 text-white">Total</td>
                    <td className="px-4 py-3 text-white">{formatCurrency(totalPaid, currentWorkspace.currency_symbol)}</td>
                    <td className="px-4 py-3 text-white">{formatCurrency(totalPaid - currentBalance, currentWorkspace.currency_symbol)}</td>
                    <td className="px-4 py-3 text-right text-accent">{formatCurrency(currentBalance, currentWorkspace.currency_symbol)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </section>

        {/* Unpaid Work */}
        {unpaidVideos.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Unpaid Work</h2>
            <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:space-y-0">
              {unpaidVideos.map(v => (
                <Card key={v.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="min-w-0 pr-4">
                      <h3 className="font-medium text-white truncate">{v.title}</h3>
                      <p className="text-xs text-text-secondary mt-1">{v.status.replace("_", " ").toUpperCase()}</p>
                    </div>
                    <span className="font-medium text-warning flex-shrink-0">{formatCurrency(currentWorkspace.rate_per_video, currentWorkspace.currency_symbol)}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <Button variant="secondary" className="w-full" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, className = "" }: { title: string; value: string; color: string; className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">{title}</p>
        <p className={`text-xl font-semibold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
