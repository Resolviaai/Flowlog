import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { workspaceService, profileService } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Search, User as UserIcon, Loader2 } from "lucide-react";
import { Profile } from "../types";

export function Onboarding() {
  const { user, profile, refreshData, setCurrentWorkspace } = useAppContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [workspaceName, setWorkspaceName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientUsername, setClientUsername] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "client">("client");
  const [creatorRole, setCreatorRole] = useState<"editor" | "client">("editor");
  const [rate, setRate] = useState("18");
  const [currency, setCurrency] = useState("$");
  const [color, setColor] = useState("#6366F1");
  const [loading, setLoading] = useState(false);

  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (clientUsername.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await profileService.searchProfiles(clientUsername);
        setSuggestions(results.filter(p => p.id !== user?.id));
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [clientUsername, user?.id]);

  const handleSelectSuggestion = (p: Profile) => {
    setClientUsername(p.username || "");
    setClientEmail(p.email);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleFinish();
  };

  const handleFinish = async () => {
    if (!user || !profile) return;
    
    // Check if user exists if username is provided
    if (clientUsername && !clientEmail) {
      const { data: existing } = await supabase.from('profiles').select('email').eq('username', clientUsername).single();
      if (!existing) {
        toast.error("User with this username not found. They must have an account first.");
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Create workspace
      const workspaceData: any = {
        name: workspaceName || "New Project",
        rate_per_video: parseFloat(rate) || 18,
        currency_symbol: currency || "$",
        accent_color: color,
        status: 'active',
        project_start_date: new Date().toISOString()
      };

      // Always set editor_id to creator initially (will be overwritten if creator is client and they invite an editor)
      // Set the correct ID based on the creator's role to avoid "no_self_workspace" constraint (editor_id != client_id)
      if (creatorRole === "editor") {
        workspaceData.editor_id = user.id;
        workspaceData.client_id = null;
      } else {
        workspaceData.client_id = user.id;
        // If the DB requires editor_id, this might fail if we don't provide one.
        // Assuming the schema allows editor_id to be nullable OR we are just setting client_id.
        // We explicitly remove editor_id to avoid sending it if it was set previously.
        delete workspaceData.editor_id;
      }

      const workspace = await workspaceService.createWorkspace(workspaceData);

      // 2. If client email or username was provided, create invite
      if (clientEmail || clientUsername) {
        await workspaceService.inviteMember({
          workspace_id: workspace.id,
          invited_by: user.id,
          invited_email: clientEmail || null,
          invited_username: clientUsername || null,
          invited_role: inviteRole
        });
      }

      setCurrentWorkspace(workspace);
      toast.success("Workspace created!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (selectedRole: "editor" | "client") => {
    setCreatorRole(selectedRole);
    setInviteRole(selectedRole === "editor" ? "client" : "editor");
    setStep(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-6 justify-center max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Resolvia</h1>
        <p className="text-text-secondary">Editor OS Setup</p>
      </div>

      <Card className="w-full">
        <CardContent className="p-6">
          {step > 0 && (
            <div className="flex gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full ${s <= step ? "bg-accent" : "bg-surface"}`}
                />
              ))}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-4 animate-fade-in text-center">
              <h2 className="text-xl font-semibold text-white mb-6">Who are you?</h2>
              <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={() => selectRole("editor")}>
                  I am the Editor
                </Button>
                <Button variant="secondary" className="w-full" size="lg" onClick={() => selectRole("client")}>
                  I am the Client
                </Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold text-white">Project Details</h2>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Project Name</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g. YouTube Channel"
                />
              </div>
              <div className="space-y-3">
                <div className="space-y-2 relative">
                  <label className="block text-sm font-medium text-text-secondary">Invite Member (Optional)</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                    placeholder="Invite by Email"
                  />
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[10px] text-text-secondary uppercase">OR</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={clientUsername}
                      onChange={(e) => {
                        setClientUsername(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent text-sm pr-10"
                      placeholder="Invite by Username"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isSearching ? (
                        <Loader2 className="w-4 h-4 text-accent animate-spin" />
                      ) : (
                        <Search className="w-4 h-4 text-text-secondary" />
                      )}
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-50 left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {suggestions.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleSelectSuggestion(p)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 text-left transition-colors border-b border-border last:border-0"
                          >
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">@{p.username}</p>
                              <p className="text-xs text-text-secondary truncate">{p.full_name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent text-sm appearance-none"
                  >
                    <option value="client">Client</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
                <p className="text-xs text-text-secondary">We'll invite them to this project.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold text-white">Financials</h2>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Rate per Video</label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="18"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="$"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold text-white">Appearance</h2>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Accent Color</label>
                <div className="flex gap-3">
                  {["#6366F1", "#06B6D4", "#F43F5E", "#F59E0B", "#10B981"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-10 h-10 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step > 0 && (
            <div className="mt-8 flex gap-3">
              {step > 1 && (
                <Button variant="secondary" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              <Button className="flex-1" onClick={handleNext} disabled={loading}>
                {loading ? "Creating..." : step === 3 ? "Get Started" : "Continue"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
