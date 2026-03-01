import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Settings, PaymentBatch, Video, Revision, ActivityLog, Profile, Workspace } from "../types";
import { settingsService, batchService, videoService, revisionService, activityService, profileService, workspaceService, loadSampleData } from "../services/api";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

type AppContextType = {
  user: User | null;
  profile: Profile | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  batches: PaymentBatch[];
  videos: Video[];
  revisions: Revision[];
  activityLog: ActivityLog[];
  pendingInvites: any[];
  isLoading: boolean;
  role: "editor" | "client" | "both" | null;
  setRole: (role: "editor" | "client" | "both") => void;
  refreshData: (background?: boolean) => Promise<void>;
  refreshInvites: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  addVideoToState: (video: Video) => void;
  updateVideoInState: (video: Video) => void;
  addBatchToState: (batch: PaymentBatch) => void;
  updateBatchInState: (batch: PaymentBatch) => void;
  loadSample: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [batches, setBatches] = useState<PaymentBatch[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRoleState] = useState<"editor" | "client" | "both" | null>(null);

  const setCurrentWorkspace = (workspace: Workspace | null) => {
    setCurrentWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem("resolvia_workspace_id", workspace.id);
    } else {
      localStorage.removeItem("resolvia_workspace_id");
    }
  };

  const setRole = (newRole: "editor" | "client" | "both") => {
    localStorage.setItem("resolvia_role", newRole);
    setRoleState(newRole);
  };

  const refreshInvites = async () => {
    if (!user || !profile) return;
    try {
      const invites = await workspaceService.getPendingInvites(user.email, profile.username);
      setPendingInvites(invites);
    } catch (error) {
      console.error("Failed to refresh invites:", error);
    }
  };

  const refreshWorkspaces = async () => {
    if (!user) return;
    try {
      const ws = await workspaceService.getWorkspaces(user.id);
      setWorkspaces(ws || []);
    } catch (error) {
      console.error("Failed to refresh workspaces:", error);
    }
  };

  const refreshData = async (background = false) => {
    if (!currentWorkspace) return;
    
    // Only show loading if we don't have data yet or explicitly requested
    const shouldShowLoading = !background && (batches.length === 0 || videos.length === 0);
    if (shouldShowLoading) setIsLoading(true);
    
    try {
      const [b, v, r, a] = await Promise.all([
        batchService.getAllBatches(currentWorkspace.id),
        videoService.getAllVideos(currentWorkspace.id),
        revisionService.getAllRevisions(currentWorkspace.id),
        activityService.getActivityLog(currentWorkspace.id, 50),
      ]);
      setBatches(b);
      setVideos(v);
      setRevisions(r);
      setActivityLog(a);
      await refreshInvites();
    } catch (error: any) {
      console.error("Failed to load data", error);
      // Only toast on manual/foreground refresh
      if (!background) {
        toast.error("Failed to refresh data: " + (error.message || "Unknown error"));
      }
    } finally {
      if (shouldShowLoading) setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!currentWorkspace) return;
    // Settings are now mostly part of Workspace, but we keep the service for compatibility if needed
    // or we update the workspace itself
    const updated = await workspaceService.updateWorkspace(currentWorkspace.id, {
      rate_per_video: newSettings.rate_per_video,
      currency_symbol: newSettings.currency_symbol,
      accent_color: newSettings.accent_color,
    });
    setCurrentWorkspaceState(updated);
  };

  const addVideoToState = (video: Video) => {
    setVideos(prev => [video, ...prev]);
  };

  const updateVideoInState = (video: Video) => {
    setVideos(prev => prev.map(v => v.id === video.id ? video : v));
  };

  const addBatchToState = (batch: PaymentBatch) => {
    setBatches(prev => [batch, ...prev]);
  };

  const updateBatchInState = (batch: PaymentBatch) => {
    setBatches(prev => prev.map(b => b.id === batch.id ? batch : b));
  };

  const loadSample = async () => {
    try {
      setIsLoading(true);
      await loadSampleData();
      await refreshData();
    } catch (error: any) {
      toast.error("Failed to load sample data");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setWorkspaces([]);
    setCurrentWorkspace(null);
    setRoleState(null);
    localStorage.removeItem("resolvia_role");
    localStorage.removeItem("resolvia_workspace_id");
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // Only show global loading if we don't have a workspace yet
      if (!currentWorkspace) setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Fetch profile and workspaces in parallel with individual error handling
          const [p, ws] = await Promise.all([
            profileService.getProfile(currentUser.id).catch(err => {
              console.warn("Profile fetch failed, might not exist yet:", err);
              return null;
            }),
            workspaceService.getWorkspaces(currentUser.id).catch(err => {
              console.error("Workspace fetch failed:", err);
              return [];
            })
          ]);
          
          if (!mounted) return;
          
          if (p) {
            setProfile(p);
            setRoleState(p.role);
          }
          
          setWorkspaces(ws || []);
          
          // Fetch pending invites for the user
          if (p) {
            const invites = await workspaceService.getPendingInvites(currentUser.email, p.username);
            setPendingInvites(invites);
          }
          
          const savedWsId = localStorage.getItem("resolvia_workspace_id");
          const initialWs = ws?.find(w => w.id === savedWsId) || null;
          
          if (initialWs) {
            setCurrentWorkspaceState(initialWs);
          }
        }
      } catch (error) {
        console.error("Critical initialization error:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("Auth event:", event);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        init();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setWorkspaces([]);
        setCurrentWorkspace(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!currentWorkspace) return;

    // Initial fetch
    refreshData();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`workspace_sync_${currentWorkspace.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos',
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        () => {
          videoService.getAllVideos(currentWorkspace.id).then(setVideos);
          activityService.getActivityLog(currentWorkspace.id, 50).then(setActivityLog);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_batches',
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        () => {
          batchService.getAllBatches(currentWorkspace.id).then(setBatches);
          activityService.getActivityLog(currentWorkspace.id, 50).then(setActivityLog);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'revisions',
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        () => {
          revisionService.getAllRevisions(currentWorkspace.id).then(setRevisions);
          activityService.getActivityLog(currentWorkspace.id, 50).then(setActivityLog);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspaces',
          filter: `id=eq.${currentWorkspace.id}`,
        },
        (payload) => {
          const updatedWorkspace = payload.new as Workspace;
          setCurrentWorkspaceState(prev => prev ? { ...prev, ...updatedWorkspace } : null);
          setWorkspaces(prev => prev.map(w => w.id === updatedWorkspace.id ? updatedWorkspace : w));
          activityService.getActivityLog(currentWorkspace.id, 50).then(setActivityLog);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspace?.id]);

  // Add focus listener to refresh data when window gains focus
  useEffect(() => {
    const onFocus = () => {
      if (currentWorkspace) {
        refreshData(true);
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [currentWorkspace]);

  return (
    <AppContext.Provider value={{ 
      user, profile, workspaces, currentWorkspace, setCurrentWorkspace,
      batches, videos, revisions, activityLog, pendingInvites, isLoading, role, setRole, 
      refreshData, refreshInvites, refreshWorkspaces, updateSettings, addVideoToState, updateVideoInState, 
      addBatchToState, updateBatchInState, loadSample, signOut
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
