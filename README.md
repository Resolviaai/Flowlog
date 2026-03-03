# 🌊 Resolvia: The Professional Editor's OS

Resolvia is a high-performance, mobile-first workspace management and financial tracking system specifically engineered for professional video editors and their clients. It bridges the gap between creative production and business management, providing a single source of truth for project progress, revisions, and billing.

---

## 🚀 Core Features & Deep-Dive

### 🏢 Workspace & Collaboration Engine
Resolvia is built around the concept of **Isolated Workspaces**, allowing editors to manage multiple clients or large-scale projects without data overlap.

*   **Role-Based Access Control**:
    *   **Editors**: Full control over video creation, status management, financial settings, and batch creation.
    *   **Clients**: Streamlined view focused on progress tracking, revision requests, and asset access.
*   **Intelligent Invitation System**:
    *   Invite members via **Email** or **Username Search**.
    *   Real-time search suggestions for existing platform users.
    *   Secure invite tokens with expiration logic.
    *   Centralized "My Projects" hub to manage pending invites and switch between active workspaces.
*   **Workspace Customization**:
    *   **Dynamic Branding**: Set a unique accent color per workspace that propagates throughout the entire UI.
    *   **Localized Financials**: Define custom rates per video and currency symbols ($, £, €, etc.) specific to each client contract.

### 🎬 Advanced Video Pipeline
Manage the entire lifecycle of a video project with a specialized workflow.

*   **Metadata Tracking**: Capture title, description, platform (YouTube, Instagram, TikTok, LinkedIn, etc.), and video type (Short-form, Long-form, Reel, Ad, Podcast, etc.).
*   **Automated Timeline Tracking**:
    *   **Created**: Logged at entry.
    *   **Started**: Logged when status moves to `In Progress`.
    *   **Delivered**: Logged when status moves to `Delivered`.
    *   **Approved**: Logged when status moves to `Approved`.
*   **Priority Management**: Color-coded priority levels (`Low`, `Normal`, `High`, `Urgent`) for queue optimization.
*   **Asset Management**: Direct integration with cloud storage via Drive links, with one-tap "Copy Link" and "Open Drive" actions.
*   **Financial Overrides**:
    *   **Custom Prices**: Override the default workspace rate for specific complex videos.
    *   **Bonuses**: Add discretionary bonuses with documented reasons for extra effort or high-performance results.

### 🔄 Precision Revision System
Eliminate feedback loops with a structured revision tracking system.

*   **Revision Numbering**: Automatic incrementing of revision versions.
*   **Status Lifecycle**: Track revisions from `Requested` → `In Progress` → `Completed`.
*   **Editor Analytics**: Track exact `time_spent_minutes` per revision to analyze project profitability.
*   **Dual-Note System**: Separate fields for client feedback and editor responses.
*   **Mark Complete**: Editors can mark revisions as complete, instantly updating the video status and notifying the client.

### 💰 Financial Intelligence & Billing
A robust accounting layer designed to handle the nuances of freelance editing.

*   **Payment Batches**:
    *   Group videos into billing cycles.
    *   Support for `Advance` (pre-paid) and `Post-delivery` payment types.
    *   Multiple payment methods: PayPal, Wise, Bank Transfer, Cash, and more.
*   **Real-time Financial Formulas**:
    *   **Batch Balance**: `Amount Paid - (Sum of Base Prices + Bonuses for Completed Videos)`.
    *   **Total Balance**: Aggregate of all active batch balances.
    *   **Revenue Earned**: Total value of all `Delivered`, `Approved`, or `Archived` videos.
    *   **Unpaid Work Value**: Value of videos marked `Edited Before Payment` that have been started but not yet settled.
    *   **True Net**: The actual financial standing (`Total Balance - Unpaid Work Value`).
*   **CSV Export**: Export full batch and payment breakdowns for accounting and tax purposes.

### 💳 Payment Details & QR Integration
Streamline the payment process with direct visibility.

*   **QR Code Support**: Editors can upload/link a QR code image URL (e.g., UPI, PayPal, CashApp) in settings.
*   **Instant Visibility**: Clients see the QR code directly in their settings page for quick scanning and payment.
*   **Text Instructions**: Support for detailed bank details, PayPal emails, or other payment instructions.

### 🔔 Real-time Sync & Notifications
*   **Supabase Realtime**: Postgres Changes for instant UI updates when data changes on the server.
*   **Browser Notifications**: Integrated alerts for:
    *   New video creation
    *   Batch updates
    *   Revision requests
    *   Workspace setting changes
*   **Audit Trail**: An exhaustive `activity_log` tracking every creation, status change, and revision request.

---

## 🛠 Technical Architecture

### Frontend Stack
*   **Framework**: [React 19](https://react.dev/) for cutting-edge performance and hook-based logic.
*   **Language**: [TypeScript](https://www.typescriptlang.org/) for strict type safety across the entire data model.
*   **Build System**: [Vite](https://vitejs.dev/) for lightning-fast development and optimized production builds.
*   **State Management**: Custom **Context API** implementation (`AppContext`) for global workspace and user state synchronization.
*   **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid transitions and "native-feel" interactions.

### Styling & UI
*   **CSS Framework**: [Tailwind CSS 4](https://tailwindcss.com/) using the latest `@theme` variable system.
*   **Design System**:
    *   **Custom UI Components**: Reusable `Badge`, `Button`, and `Card` components with multiple variants (`success`, `warning`, `error`, `info`, `ghost`, `danger`).
    *   **Typography**: Inter (Sans-serif) for maximum legibility.
    *   **Color Palette**: Zinc/Slate based dark theme with dynamic accent color injection.
*   **Icons**: [Lucide React](https://lucide.dev/) for a consistent, lightweight iconography.

### Backend & Infrastructure
*   **Platform**: [Supabase](https://supabase.com/)
*   **Database**: PostgreSQL with Row Level Security (RLS) for multi-tenant isolation.
*   **Authentication**: Supabase Auth with secure password handling and profile triggers.

---

## 📱 User Experience Details

*   **Mobile-First Navigation**: A fixed bottom navigation bar with safe-area awareness and active state highlighting.
*   **Haptic Feedback**: Integrated `hapticFeedback` utility providing physical confirmation for successful actions (`success`, `warning`, `error`, `light`, `medium`).
*   **Smart Time Formatting**: `getRelativeTime` utility for human-readable timestamps (e.g., "Just now", "5m ago", "2h ago").
*   **Toast System**: [Sonner](https://sonner.stevenly.me/) for non-blocking, high-visibility notifications.

---

## 🛠 Setup & Environment

### Required Environment Variables
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Database Schema (SQL)
Run the following in your Supabase SQL Editor to enable the secure invite function:

```sql
create or replace function accept_workspace_invite(invite_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  invite_record record;
  current_user_id uuid;
begin
  current_user_id := auth.uid();
  select * into invite_record from public.workspace_invites where id = invite_id;
  if not found then raise exception 'Invite not found'; end if;
  if invite_record.status <> 'pending' then raise exception 'Invite is no longer pending'; end if;

  if invite_record.invited_role = 'client' then
    update public.workspaces set client_id = current_user_id, updated_at = now() where id = invite_record.workspace_id;
  else
    update public.workspaces set editor_id = current_user_id, updated_at = now() where id = invite_record.workspace_id;
  end if;

  update public.workspace_invites set status = 'accepted' where id = invite_id;
end;
$$;
```

And to add the latest payment and pricing columns:

```sql
ALTER TABLE workspaces ADD COLUMN payment_details text;
ALTER TABLE workspaces ADD COLUMN payment_qr_url text;

ALTER TABLE videos ADD COLUMN custom_price numeric;
ALTER TABLE videos ADD COLUMN price_change_reason text;
ALTER TABLE videos ADD COLUMN bonus_amount numeric;
ALTER TABLE videos ADD COLUMN bonus_reason text;
```

---
*Crafted for editors who value flow, clarity, and precision.*
