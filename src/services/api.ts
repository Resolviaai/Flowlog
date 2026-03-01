import { Settings, PaymentBatch, Video, Revision, VideoStatusHistory, ActivityLog, Profile, Workspace, WorkspaceInvite } from "../types";
import { supabase } from "../lib/supabase";

// --- Profile Service ---
export const profileService = {
  getProfile: async (id: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Profile;
  },
  updateProfile: async (id: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },
  searchProfiles: async (query: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);
    if (error) throw error;
    return data as Profile[];
  }
};

// --- Workspace Service ---
export const workspaceService = {
  getWorkspaces: async (userId: string) => {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .or(`editor_id.eq.${userId},client_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Workspace[];
  },
  createWorkspace: async (workspace: Omit<Workspace, "id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase
      .from('workspaces')
      .insert([workspace])
      .select()
      .single();
    if (error) throw error;
    return data as Workspace;
  },
  updateWorkspace: async (id: string, updates: Partial<Workspace>) => {
    const { data, error } = await supabase
      .from('workspaces')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Workspace;
  },
  inviteMember: async (invite: Omit<WorkspaceInvite, "id" | "created_at" | "token" | "expires_at" | "status">) => {
    const { data, error } = await supabase
      .from('workspace_invites')
      .insert([{ ...invite }])
      .select()
      .single();
    if (error) throw error;
    return data as WorkspaceInvite;
  },
  acceptInvite: async (inviteId: string, userId: string) => {
    // Try using the RPC function first (secure method)
    const { error: rpcError } = await supabase.rpc('accept_workspace_invite', { invite_id: inviteId });
    
    if (!rpcError) {
      return { id: inviteId, status: 'accepted' } as WorkspaceInvite;
    }

    // Fallback to client-side update (only works if RLS allows it, which it likely won't for new members)
    console.warn("RPC failed, falling back to client-side update:", rpcError);

    // 1. Get the invite
    const { data: invite, error: inviteError } = await supabase
      .from('workspace_invites')
      .select('*')
      .eq('id', inviteId)
      .single();
    if (inviteError) throw inviteError;
    if (invite.status !== 'pending') throw new Error("Invite is no longer pending");

    // 2. Update the workspace with the correct role
    const updateData: any = { updated_at: new Date().toISOString() };
    if (invite.invited_role === 'client') {
      updateData.client_id = userId;
    } else {
      updateData.editor_id = userId;
    }

    const { error: wsError } = await supabase
      .from('workspaces')
      .update(updateData)
      .eq('id', invite.workspace_id);
    if (wsError) throw wsError;

    // 3. Update the invite status
    const { data: updatedInvite, error: updateInviteError } = await supabase
      .from('workspace_invites')
      .update({ status: 'accepted' })
      .eq('id', inviteId)
      .select()
      .single();
    if (updateInviteError) throw updateInviteError;

    return updatedInvite as WorkspaceInvite;
  },
  getPendingInvites: async (email?: string, username?: string) => {
    let query = supabase
      .from('workspace_invites')
      .select('*, workspaces(name, accent_color, editor_id)')
      .eq('status', 'pending');
    
    const conditions = [];
    if (email) conditions.push(`invited_email.eq.${email}`);
    if (username) conditions.push(`invited_username.eq.${username}`);
    
    if (conditions.length > 0) {
      query = query.or(conditions.join(','));
    } else {
      return [];
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as (WorkspaceInvite & { workspaces: { name: string, accent_color: string, editor_id: string } })[];
  },
  respondToInvite: async (inviteId: string, status: 'accepted' | 'declined', userId: string) => {
    if (status === 'declined') {
      const { error } = await supabase
        .from('workspace_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId);
      if (error) throw error;
      return null;
    }

    // If accepted, use existing acceptInvite logic
    return workspaceService.acceptInvite(inviteId, userId);
  }
};

// --- Settings Service ---
export const settingsService = {
  getSettings: async () => {
    const { data, error } = await supabase.from('settings').select('*').limit(1).single();
    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching settings:", error);
      return null;
    }
    return data as Settings | null;
  },
  updateSettings: async (newSettings: Partial<Settings>) => {
    const { data: existing } = await supabase.from('settings').select('id').limit(1).single();
    
    if (existing) {
      const { data, error } = await supabase
        .from('settings')
        .update({ ...newSettings, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data as Settings;
    } else {
      const { data, error } = await supabase
        .from('settings')
        .insert([{ ...newSettings, updated_at: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return data as Settings;
    }
  },
};

// --- Batch Service ---
export const batchService = {
  getAllBatches: async (workspaceId: string) => {
    const { data, error } = await supabase
      .from('payment_batches')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('date_paid', { ascending: false });
    if (error) throw error;
    return data as PaymentBatch[];
  },
  createBatch: async (batch: Omit<PaymentBatch, "id" | "created_at" | "updated_at"> & { workspace_id: string }) => {
    const { data, error } = await supabase
      .from('payment_batches')
      .insert([{ ...batch }])
      .select()
      .single();
    if (error) throw error;
    
    await activityService.logActivity({
      type: "batch_created",
      description: `Created batch "${batch.label}"`,
      entity_id: data.id,
      entity_type: "batch",
      metadata: {},
      workspace_id: batch.workspace_id
    });
    
    return data as PaymentBatch;
  },
  updateBatch: async (id: string, updates: Partial<PaymentBatch>) => {
    const { data, error } = await supabase
      .from('payment_batches')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as PaymentBatch;
  },
  deleteBatch: async (id: string) => {
    const { error } = await supabase.from('payment_batches').delete().eq('id', id);
    if (error) throw error;
  },
};

// --- Video Service ---
export const videoService = {
  getAllVideos: async (workspaceId: string) => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Video[];
  },
  createVideo: async (video: Omit<Video, "id" | "created_at" | "updated_at" | "started_at" | "delivered_at" | "approved_at"> & { workspace_id: string }) => {
    const { data, error } = await supabase
      .from('videos')
      .insert([{ ...video }])
      .select()
      .single();
    if (error) throw error;
    
    await activityService.logActivity({
      type: "video_created",
      description: `Created video "${video.title}"`,
      entity_id: data.id,
      entity_type: "video",
      metadata: {},
      workspace_id: video.workspace_id
    });
    
    return data as Video;
  },
  updateVideo: async (id: string, updates: Partial<Video>) => {
    const { data, error } = await supabase
      .from('videos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Video;
  },
  deleteVideo: async (id: string) => {
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) throw error;
  },
  changeVideoStatus: async (id: string, newStatus: Video["status"], note: string = "") => {
    const { data: video, error: fetchError } = await supabase.from('videos').select('*').eq('id', id).single();
    if (fetchError || !video) throw new Error("Video not found");

    const oldStatus = video.status;
    const now = new Date().toISOString();
    
    let updates: Partial<Video> = { status: newStatus, updated_at: now };
    if (newStatus === "in_progress" && !video.started_at) updates.started_at = now;
    if (newStatus === "delivered") updates.delivered_at = now;
    if (newStatus === "approved") updates.approved_at = now;

    const { data: updatedVideo, error: updateError } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (updateError) throw updateError;

    await supabase.from('video_status_history').insert([{
      video_id: id,
      old_status: oldStatus,
      new_status: newStatus,
      note,
      workspace_id: video.workspace_id
    }]);

    await activityService.logActivity({
      type: "video_status_changed",
      description: `Video "${video.title}" status changed to ${newStatus}`,
      entity_id: id,
      entity_type: "video",
      metadata: { oldStatus, newStatus },
      workspace_id: video.workspace_id
    });

    return updatedVideo as Video;
  },
};

// --- Revision Service ---
export const revisionService = {
  getRevisionsByVideo: async (videoId: string) => {
    const { data, error } = await supabase.from('revisions').select('*').eq('video_id', videoId).order('revision_number', { ascending: false });
    if (error) throw error;
    return data as Revision[];
  },
  getAllRevisions: async (workspaceId: string) => {
    const { data, error } = await supabase
      .from('revisions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('requested_at', { ascending: false });
    if (error) throw error;
    return data as Revision[];
  },
  createRevision: async (revision: Omit<Revision, "id" | "created_at" | "updated_at" | "requested_at" | "completed_at"> & { workspace_id: string }) => {
    const { data, error } = await supabase
      .from('revisions')
      .insert([{ 
        ...revision, 
        completed_at: revision.status === "completed" ? new Date().toISOString() : null 
      }])
      .select()
      .single();
    if (error) throw error;
    
    await activityService.logActivity({
      type: "revision_added",
      description: `Revision #${revision.revision_number} requested`,
      entity_id: data.id,
      entity_type: "revision",
      metadata: {},
      workspace_id: revision.workspace_id
    });
    
    return data as Revision;
  },
  updateRevision: async (id: string, updates: Partial<Revision>) => {
    if (updates.status === "completed") {
      updates.completed_at = new Date().toISOString();
    }
    const { data, error } = await supabase
      .from('revisions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Revision;
  },
};

// --- Activity Service ---
export const activityService = {
  logActivity: async (log: Omit<ActivityLog, "id" | "created_at"> & { workspace_id?: string, actor_id?: string }) => {
    const { data, error } = await supabase
      .from('activity_log')
      .insert([{ ...log }])
      .select()
      .single();
    if (error) throw error;
    return data as ActivityLog;
  },
  getActivityLog: async (workspaceId: string, limit: number = 20) => {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as ActivityLog[];
  },
};

// Seed Data helper
export const loadSampleData = async () => {
  // Not implemented for Supabase to avoid accidental overwrites
  console.log("Sample data loading is disabled when connected to Supabase.");
};
