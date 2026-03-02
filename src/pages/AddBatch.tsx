import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { TopBar } from "../components/layout/TopBar";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { batchService } from "../services/api";
import { ArrowLeft, Save } from "lucide-react";
import { hapticFeedback } from "../utils/haptics";
import { toast } from "sonner";

export function AddBatch() {
  const navigate = useNavigate();
  const { currentWorkspace, refreshData, addBatchToState } = useAppContext();
  
  const [label, setLabel] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [datePaid, setDatePaid] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState("PayPal");
  const [paymentType, setPaymentType] = useState<"advance" | "post_delivery">("advance");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !amountPaid || !currentWorkspace) return;
    
    setIsSubmitting(true);
    try {
      const newBatch = await batchService.createBatch({
        label,
        amount_paid: parseFloat(amountPaid),
        date_paid: new Date(datePaid).toISOString(),
        payment_method: paymentMethod as any,
        payment_type: paymentType,
        notes,
        status: "active",
        rate_at_time_of_batch: currentWorkspace.rate_per_video || 18,
        workspace_id: currentWorkspace.id
      });
      addBatchToState(newBatch);
      hapticFeedback('success');
      toast.success("Batch added successfully");
      refreshData(true);
      navigate("/batches");
    } catch (error: any) {
      console.error("Add batch error:", error);
      hapticFeedback('error');
      toast.error(error.message || "Failed to add batch");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background">
      <TopBar 
        title="Add Batch" 
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
                <label className="block text-sm font-medium text-text-secondary mb-1">Label *</label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Batch #4"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Amount Paid ({currentWorkspace.currency_symbol}) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Date Paid *</label>
                  <input
                    type="date"
                    required
                    value={datePaid}
                    onChange={(e) => setDatePaid(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Payment Type</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="advance">Advance</option>
                    <option value="post_delivery">Post Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="PayPal">PayPal</option>
                    <option value="Wise">Wise</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent min-h-[80px]"
                />
              </div>

              <Button type="submit" className="w-full mt-4" isLoading={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                Save Batch
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
