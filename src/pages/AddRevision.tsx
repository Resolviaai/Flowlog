import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "../components/layout/TopBar";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Save } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { hapticFeedback } from "../utils/haptics";
import { toast } from "sonner";

export function AddRevision() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { videos, revisions, refreshData, role, currentWorkspace } = useAppContext();

  const video = videos.find(v => v.id === id);
  const videoRevisions = revisions.filter(r => r.video_id === id);
  const nextRevisionNumber = videoRevisions.length > 0 ? Math.max(...videoRevisions.map(r => r.revision_number)) + 1 : 1;

  const [clientNotes, setClientNotes] = useState("");
  const [editorNotes, setEditorNotes] = useState("");
  const [status, setStatus] = useState<"requested" | "in_progress" | "completed">("requested");
  const [timeSpent, setTimeSpent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!video) return <div className="p-4 text-center text-text-secondary">Video not found</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNotes || !currentWorkspace) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('revisions').insert({
        video_id: id,
        revision_number: nextRevisionNumber,
        client_notes: clientNotes,
        editor_notes: editorNotes || null,
        status: status,
        time_spent_minutes: parseInt(timeSpent) || 0,
        workspace_id: currentWorkspace.id
      });

      if (error) throw error;

      hapticFeedback('success');
      toast.success(role === "client" ? "Revision requested successfully" : "Revision added successfully");
      refreshData(true);
      navigate(`/videos/${id}`);
    } catch (error: any) {
      console.error("Error adding revision:", error);
      hapticFeedback('error');
      toast.error(error.message || "Failed to add revision. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background">
      <TopBar 
        title={role === "client" ? "Request Revision" : "Add Revision"}
        leftAction={
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text-secondary hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />
      
      <div className="p-4 max-w-3xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {role === "client" ? "What needs to be changed?" : "Client Notes"} *
                </label>
                <textarea
                  required
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Describe the changes needed..."
                />
              </div>

              {role === "editor" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Editor Notes (Internal)</label>
                    <textarea
                      value={editorNotes}
                      onChange={(e) => setEditorNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Your notes on this revision..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
                      >
                        <option value="requested">Requested</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Time Spent (min)</label>
                      <input
                        type="number"
                        value={timeSpent}
                        onChange={(e) => setTimeSpent(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isSubmitting || !clientNotes}>
            {isSubmitting ? "Saving..." : role === "client" ? "Submit Request" : "Save Revision"}
          </Button>
        </form>
      </div>
    </div>
  );
}
