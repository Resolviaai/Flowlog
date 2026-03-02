import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { TopBar } from "../components/layout/TopBar";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Save, Trash2, Search, User as UserIcon, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hapticFeedback } from "../utils/haptics";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { profileService, workspaceService } from "../services/api";
import { Profile } from "../types";

export function Settings() {
  const { currentWorkspace, updateSettings, role, signOut, user } = useAppContext();
  const navigate = useNavigate();

  const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.name || "");
  const [rate, setRate] = useState(currentWorkspace?.rate_per_video.toString() || "");
  const [currency, setCurrency] = useState(currentWorkspace?.currency_symbol || "");
  const [color, setColor] = useState(currentWorkspace?.accent_color || "#6366F1");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "client">("client");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (inviteUsername.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await profileService.searchProfiles(inviteUsername);
        setSuggestions(results.filter(p => p.id !== user?.id));
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [inviteUsername, user?.id]);

  const [members, setMembers] = useState<{ editor: Profile | null, client: Profile | null }>({ editor: null, client: null });
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!currentWorkspace) return;
      setIsLoadingMembers(true);
      try {
        const [editor, client] = await Promise.all([
          currentWorkspace.editor_id ? profileService.getProfile(currentWorkspace.editor_id).catch(() => null) : Promise.resolve(null),
          currentWorkspace.client_id ? profileService.getProfile(currentWorkspace.client_id).catch(() => null) : Promise.resolve(null)
        ]);
        setMembers({ editor, client });
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setIsLoadingMembers(false);
      }
    };
    fetchMembers();
  }, [currentWorkspace?.id, currentWorkspace?.editor_id, currentWorkspace?.client_id]);

  if (!currentWorkspace) return null;

  const handleSelectSuggestion = (p: Profile) => {
    setInviteUsername(p.username || "");
    setInviteEmail(p.email);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    try {
      await updateSettings({
        rate_per_video: parseFloat(rate) || 18,
        currency_symbol: currency,
        accent_color: color,
      });
      // Also update workspace name if changed
      if (workspaceName !== currentWorkspace.name) {
        await supabase.from('workspaces').update({ name: workspaceName }).eq('id', currentWorkspace.id);
      }
      hapticFeedback('success');
      toast.success("Settings saved successfully");
    } catch (error: any) {
      console.error("Settings save error:", error);
      hapticFeedback('error');
      toast.error(error.message || "Failed to save settings");
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail && !inviteUsername) return;
    
    // Check if user exists if username is provided
    if (inviteUsername && !inviteEmail) {
      const { data: existing } = await supabase.from('profiles').select('email').eq('username', inviteUsername).single();
      if (!existing) {
        toast.error("User with this username not found. They must have an account first.");
        return;
      }
    }

    try {
      const { error } = await supabase.from('workspace_invites').insert({
        workspace_id: currentWorkspace.id,
        invited_by: user?.id,
        invited_email: inviteEmail || null,
        invited_username: inviteUsername || null,
        invited_role: inviteRole,
      });
      if (error) throw error;
      toast.success(`Invite sent successfully`);
      setInviteEmail("");
      setInviteUsername("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send invite");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background">
      <TopBar 
        title="Settings" 
        leftAction={
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text-secondary hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
        rightAction={
          role === "editor" ? (
            <Button variant="ghost" size="sm" onClick={handleSave} className="text-accent hover:text-accent/80 hover:bg-accent/10">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          ) : undefined
        }
      />
      
      <div className="p-4 space-y-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0">
        {/* General */}
        {role === "editor" && (
          <>
            <section className="md:col-span-2 lg:col-span-1">
              <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Workspace</h2>
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Project Name</label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Members */}
            <section className="md:col-span-2 lg:col-span-2 md:row-span-2">
              <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Members</h2>
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-3">
                    {/* Current Members */}
                    <div className="flex flex-col gap-3 mb-4">
                      {members.editor && (
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{members.editor.full_name || members.editor.username}</p>
                              <p className="text-xs text-text-secondary">Editor</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {members.client && (
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{members.client.full_name || members.client.username}</p>
                              <p className="text-xs text-text-secondary">Client</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 relative">
                      <label className="block text-sm font-medium text-text-secondary mb-1">Invite New Member</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Invite by Email"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-[10px] text-text-secondary uppercase">OR</span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={inviteUsername}
                          onChange={(e) => {
                            setInviteUsername(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          placeholder="Invite by Username"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent text-sm pr-10"
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
                      <Button variant="secondary" className="flex-[2]" onClick={handleInvite} disabled={!inviteEmail && !inviteUsername}>
                        Invite
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Financial */}
            <section className="md:col-span-1 lg:col-span-1">
              <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Financial</h2>
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Rate per Video</label>
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Currency Symbol</label>
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Appearance */}
            <section className="md:col-span-1 lg:col-span-1">
              <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Appearance</h2>
              <Card>
                <CardContent className="p-4">
                  <label className="block text-sm font-medium text-text-secondary mb-3">Accent Color</label>
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
                </CardContent>
              </Card>
            </section>

            {/* Danger Zone */}
            <section className="md:col-span-2 lg:col-span-1">
              <h2 className="text-sm font-semibold text-error mb-3 uppercase tracking-wider">Danger Zone</h2>
              <Card className="border-error/20">
                <CardContent className="p-4 space-y-4">
                  <p className="text-sm text-text-secondary">This will permanently delete all data. Type "DELETE" to confirm.</p>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                    className="w-full bg-surface border border-error/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-error"
                  />
                  <Button 
                    variant="danger" 
                    className="w-full" 
                    disabled={deleteConfirm !== "DELETE"}
                    onClick={async () => {
                      try {
                        await workspaceService.deleteWorkspace(currentWorkspace.id);
                        toast.success("Workspace deleted successfully");
                        // Force reload to reset state and redirect to onboarding/home
                        window.location.href = "/";
                      } catch (error: any) {
                        console.error("Failed to delete workspace:", error);
                        toast.error(error.message || "Failed to delete workspace");
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Data
                  </Button>
                </CardContent>
              </Card>
            </section>
          </>
        )}

        {/* Logout */}
        <section className="md:col-span-2 lg:col-span-3">
          <Button variant="secondary" className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </section>
      </div>
    </div>
  );
}
