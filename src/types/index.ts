export type Settings = {
  id: string;
  editor_name: string;
  client_name: string;
  rate_per_video: number;
  currency_symbol: string;
  accent_color: string;
  project_start_date: string;
  updated_at: string;
};

export type PaymentBatch = {
  id: string;
  label: string;
  amount_paid: number;
  date_paid: string;
  payment_method: "PayPal" | "Wise" | "Bank Transfer" | "Cash" | "Other";
  payment_type: "advance" | "post_delivery";
  notes: string;
  status: "active" | "exhausted" | "overpaid";
  rate_at_time_of_batch: number;
  created_at: string;
  updated_at?: string;
  workspace_id?: string;
};

export type Video = {
  id: string;
  title: string;
  description: string;
  drive_link: string;
  status: "not_started" | "in_progress" | "revision" | "delivered" | "approved" | "archived";
  batch_id: string | null;
  edited_before_payment: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  video_type: "short_form" | "long_form" | "reel" | "ad" | "podcast" | "other";
  platform: "YouTube" | "Instagram" | "TikTok" | "LinkedIn" | "Other";
  duration_minutes: number;
  internal_notes: string;
  client_feedback_summary: string;
  custom_price?: number | null;
  price_change_reason?: string | null;
  bonus_amount?: number | null;
  bonus_reason?: string | null;
  created_at: string;
  started_at: string | null;
  delivered_at: string | null;
  approved_at: string | null;
  updated_at?: string;
  workspace_id?: string;
};

export type Revision = {
  id: string;
  video_id: string;
  revision_number: number;
  status: "requested" | "in_progress" | "completed";
  client_notes: string;
  editor_notes: string;
  time_spent_minutes: number;
  requested_at: string;
  completed_at: string | null;
  updated_at?: string;
  workspace_id?: string;
};

export type VideoStatusHistory = {
  id: string;
  video_id: string;
  old_status: string;
  new_status: string;
  changed_at: string;
  note: string;
};

export type ActivityLog = {
  id: string;
  type: "video_created" | "video_status_changed" | "revision_added" | "batch_created" | "settings_updated";
  description: string;
  entity_id: string;
  entity_type: "video" | "batch" | "revision" | "settings" | "workspace";
  metadata: any;
  created_at: string;
  workspace_id?: string;
  actor_id?: string;
};

export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  email: string;
  role: "editor" | "client" | "both";
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at?: string;
};

export type Workspace = {
  id: string;
  name: string;
  editor_id: string;
  client_id: string | null;
  status: "active" | "paused" | "archived";
  rate_per_video: number;
  currency_symbol: string;
  accent_color: string;
  project_start_date: string | null;
  payment_details?: string | null;
  payment_qr_url?: string | null;
  created_at: string;
  updated_at?: string;
};

export type WorkspaceInvite = {
  id: string;
  workspace_id: string | null;
  invited_by: string;
  invited_email: string | null;
  invited_username: string | null;
  invited_role: "editor" | "client";
  status: "pending" | "accepted" | "declined" | "expired";
  token: string;
  expires_at: string;
  created_at: string;
};
