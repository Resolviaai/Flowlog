import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProvider, useAppContext } from "./context/AppContext";
import { BottomNav } from "./components/layout/BottomNav";
import { Home } from "./pages/Home";
import { Videos } from "./pages/Videos";
import { Batches } from "./pages/Batches";
import { Revisions } from "./pages/Revisions";
import { More } from "./pages/More";
import { Onboarding } from "./pages/Onboarding";
import { VideoDetail } from "./pages/VideoDetail";
import { BatchDetail } from "./pages/BatchDetail";
import { Financials } from "./pages/Financials";
import { Activity } from "./pages/Activity";
import { Settings } from "./pages/Settings";
import { Auth } from "./pages/Auth";
import { Workspaces } from "./pages/Workspaces";

import { AddVideo } from "./pages/AddVideo";
import { EditVideo } from "./pages/EditVideo";
import { AddBatch } from "./pages/AddBatch";
import { EditBatch } from "./pages/EditBatch";
import { AddRevision } from "./pages/AddRevision";

function AppContent() {
  const { user, currentWorkspace, isLoading } = useAppContext();

  // Apply accent color to document root
  React.useEffect(() => {
    if (currentWorkspace?.accent_color) {
      document.documentElement.style.setProperty('--color-accent', currentWorkspace.accent_color);
    } else {
      document.documentElement.style.removeProperty('--color-accent');
    }
  }, [currentWorkspace?.accent_color]);

  // Show full-screen loading only during initial app boot or when switching critical states
  if (isLoading && !currentWorkspace && user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="text-text-secondary text-sm animate-pulse">Initializing your workspace...</p>
        </div>
      </div>
    );
  }

  // If we are loading but have a user and no workspace, we might be about to show onboarding
  // but we should wait for isLoading to be false to be sure.
  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!currentWorkspace) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Workspaces />} />
      </Routes>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary pb-20">
      <main className="flex-1 max-w-md mx-auto w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workspaces" element={<Workspaces />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/videos/add" element={<AddVideo />} />
          <Route path="/videos/:id/edit" element={<EditVideo />} />
          <Route path="/videos/:id" element={<VideoDetail />} />
          <Route path="/videos/:id/revisions/add" element={<AddRevision />} />
          <Route path="/batches" element={<Batches />} />
          <Route path="/batches/add" element={<AddBatch />} />
          <Route path="/batches/:id/edit" element={<EditBatch />} />
          <Route path="/batches/:id" element={<BatchDetail />} />
          <Route path="/revisions" element={<Revisions />} />
          <Route path="/more" element={<More />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster theme="dark" position="top-center" duration={3500} />
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}
