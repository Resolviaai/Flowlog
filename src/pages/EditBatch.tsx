import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { TopBar } from "../components/layout/TopBar";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { batchService } from "../services/api";
import { ArrowLeft, Save } from "lucide-react";
import { hapticFeedback } from "../utils/haptics";
import { toast } from "sonner";

export function EditBatch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { batches, currentWorkspace, refreshData, updateBatchInState } = useAppContext();
  
  const batch = batches.find(b => b.id === id);

  const [label, setLabel] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [datePaid, setDatePaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PayPal");
  const [paymentType, setPaymentType] = useState<"advance" | "post_delivery">("advance");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"active" | "exhausted" | "overpaid">("active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (batch) {
      setLabel(batch.label);
      setAmountPaid(batch.amount_paid.toString());
      setDatePaid(batch.date_paid.split('T')[0]);
      setPaymentMethod(batch.payment_method);
      setPaymentType(batch.payment_type);
      setNotes(batch.notes || "");
      setStatus(batch.status);
    }
  }, [batch]);

  if (!batch) return <div className="p-4 text-center text-text-secondary">Batch not found</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !amountPaid) return;
    
    setIsSubmitting(true);
    try {
      const updatedBatch = await batchService.updateBatch(batch.id, {
        label,
        amount_paid: parseFloat(amountPaid),
        date_paid: new Date(datePaid).toISOString(),
        payment_method: paymentMethod,
        payment_type: paymentType,
        notes,
        status
      });
      updateBatchInState(updatedBatch);
      hapticFeedback('success');
      toast.success("Batch updated successfully");
      refreshData(true);
      navigate(`/batches/${batch.id}`);
    } catch (error: any) {
      console.error("Edit batch error:", error);
      hapticFeedback('error');
      toast.error(error.message || "Failed to update batch");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background">
      <TopBar 
        title="Edit Batch" 
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
                  <label className="block text-sm font-medium text-text-secondary mb-1">Amount Paid ({currentWorkspace?.currency_symbol}) *</label>
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
                <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="active">Active</option>
                  <option value="exhausted">Exhausted</option>
                  <option value="overpaid">Overpaid</option>
                </select>
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
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
