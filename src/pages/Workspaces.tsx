import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Plus, Briefcase, ChevronRight, User, Check, X, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hapticFeedback } from "../utils/haptics";
import { workspaceService } from "../services/api";
import { toast } from "sonner";

export function Workspaces() {
  const { workspaces, setCurrentWorkspace, profile, signOut, pendingInvites, refreshInvites, refreshWorkspaces, user } = useAppContext();
  const navigate = useNavigate();
  const [isResponding, setIsResponding] = useState<string | null>(null);

  const handleSelectWorkspace = (workspace: any) => {
    hapticFeedback('light');
    setCurrentWorkspace(workspace);
    navigate("/");
  };

  const handleCreateNew = () => {
    hapticFeedback('medium');
    navigate("/onboarding");
  };

  const handleInviteResponse = async (inviteId: string, status: 'accepted' | 'declined') => {
    if (!user) return;
    setIsResponding(inviteId);
    try {
      await workspaceService.respondToInvite(inviteId, status, user.id);
      toast.success(`Invite ${status === 'accepted' ? 'accepted' : 'declined'}`);
      await refreshInvites();
      // If accepted, refresh workspaces list
      if (status === 'accepted') {
        await refreshWorkspaces();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to respond to invite");
    } finally {
      setIsResponding(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Projects</h1>
          <p className="text-text-secondary text-sm">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}</p>
        </div>
        <button 
          onClick={signOut}
          className="text-xs text-text-secondary hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Pending Invites Section */}
      {pendingInvites.length > 0 && (
        <section className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Pending Invites</h2>
          </div>
          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <Card key={invite.id} className="border-accent/30 bg-accent/5">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">
                      Invite to <span className="text-accent">{invite.workspaces.name}</span>
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Role: {invite.invited_role.charAt(0).toUpperCase() + invite.invited_role.slice(1)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleInviteResponse(invite.id, 'declined')}
                      disabled={isResponding === invite.id}
                      className="p-2 rounded-xl bg-white/5 text-text-secondary hover:bg-error/20 hover:text-error transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleInviteResponse(invite.id, 'accepted')}
                      disabled={isResponding === invite.id}
                      className="p-2 rounded-xl bg-accent text-white hover:bg-accent/80 transition-all shadow-lg shadow-accent/20"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-4 flex-1">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Workspaces</h2>
        {workspaces.length > 0 ? (
          workspaces.map((ws) => (
            <Card 
              key={ws.id} 
              onClick={() => handleSelectWorkspace(ws)}
              className="group cursor-pointer hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{ws.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-secondary flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {ws.editor_id === profile?.id ? "Editor" : "Client"}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-xs text-text-secondary">
                      {ws.currency_symbol}{ws.rate_per_video}/video
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-white transition-colors" />
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-white">No projects yet</h3>
            <p className="text-text-secondary text-sm mt-2 max-w-[200px]">
              Create your first workspace to start managing your editing workflow.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Button 
          onClick={handleCreateNew}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Workspace
        </Button>
      </div>
    </div>
  );
}
