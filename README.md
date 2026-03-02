# 🌊 Flow Log: The Professional Editor's OS

Flow Log is a high-performance, mobile-first workspace management and financial tracking system specifically engineered for professional video editors and their clients. It bridges the gap between creative production and business management, providing a single source of truth for project progress, revisions, and billing.

---

## 🚀 Core Features & Deep-Dive

### 🏢 Workspace & Collaboration Engine
Flow Log is built around the concept of **Isolated Workspaces**, allowing editors to manage multiple clients or large-scale projects without data overlap.

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

### 🔄 Precision Revision System
Eliminate feedback loops with a structured revision tracking system.

*   **Revision Numbering**: Automatic incrementing of revision versions.
*   **Status Lifecycle**: Track revisions from `Requested` → `In Progress` → `Completed`.
*   **Editor Analytics**: Track exact `time_spent_minutes` per revision to analyze project profitability.
*   **Dual-Note System**: Separate fields for client feedback and editor responses.

### 💰 Financial Intelligence & Billing
A robust accounting layer designed to handle the nuances of freelance editing.

*   **Payment Batches**:
    *   Group videos into billing cycles.
    *   Support for `Advance` (pre-paid) and `Post-delivery` payment types.
    *   Multiple payment methods: PayPal, Wise, Bank Transfer, Cash, and more.
*   **Pricing Overrides (The "Little Details")**:
    *   **Custom Prices**: Override the default workspace rate for specific complex videos.
    *   **Bonuses**: Add discretionary bonuses with documented reasons for extra effort or high-performance results.
*   **Real-time Financial Formulas**:
    *   **Batch Balance**: `Amount Paid - (Sum of Base Prices + Bonuses for Completed Videos)`.
    *   **Total Balance**: Aggregate of all active batch balances.
    *   **Revenue Earned**: Total value of all `Delivered`, `Approved`, or `Archived` videos.
    *   **Unpaid Work Value**: Value of videos marked `Edited Before Payment` that have been started but not yet settled.

### 📊 Activity & Analytics
*   **Audit Trail**: An exhaustive `activity_log` tracking every creation, status change, and revision request.
*   **KPI Dashboard**: Instant visibility into `In Progress` counts, `Pending Revisions`, and `Average Revisions per Video`.
*   **Show More/Less**: Expandable activity feed on the home screen for deep history dives without cluttering the main view.

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
*   **Real-time**: Postgres Changes for instant UI updates when data changes on the server.

---

## 📱 User Experience Details

*   **Mobile-First Navigation**: A fixed bottom navigation bar with safe-area awareness and active state highlighting.
*   **Haptic Feedback**: Integrated `hapticFeedback` utility providing physical confirmation for successful actions (`success`, `warning`, `error`, `light`, `medium`).
*   **Smart Time Formatting**: `getRelativeTime` utility for human-readable timestamps (e.g., "Just now", "5m ago", "2h ago").
*   **Toast System**: [Sonner](https://sonner.stevenly.me/) for non-blocking, high-visibility notifications with a consistent 3.5s duration.
*   **Safe Area Support**: Custom CSS utilities (`pb-safe`, `pt-safe`) ensuring compatibility with modern notched devices.

---

## 🛠 Setup & Environment

### Required Environment Variables
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Database Tables
1.  `profiles`: User metadata and roles.
2.  `workspaces`: Project containers and financial settings.
3.  `workspace_invites`: Collaboration request management.
4.  `videos`: Core project records and status tracking.
5.  `payment_batches`: Financial grouping and billing.
6.  `revisions`: Feedback and iteration logs.
7.  `activity_log`: Immutable audit trail.

---
*Crafted for editors who value flow, clarity, and precision.*
