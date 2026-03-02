import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Plus, Check, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useAppContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentWorkspace) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full gap-3 px-4 py-2 bg-surface border border-border rounded-full text-sm font-medium text-white hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
          />
          <span className="truncate max-w-[150px]">{currentWorkspace.name}</span>
        </div>
        <span className="text-xs text-text-secondary">Tap to switch</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] z-50 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 space-y-1">
              <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider px-2 py-1">
                Workspaces
              </p>
              <div className="max-h-60 overflow-y-auto no-scrollbar">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setCurrentWorkspace(ws);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentWorkspace.id === ws.id 
                        ? "bg-accent/10 text-accent" 
                        : "text-text-primary hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: ws.accent_color }} 
                      />
                      <span className="truncate">{ws.name}</span>
                    </div>
                    {currentWorkspace.id === ws.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
              <div className="pt-1 border-t border-border mt-1">
                <button
                  onClick={() => {
                    navigate("/workspaces");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>View All Projects</span>
                </button>
                <button
                  onClick={() => {
                    navigate("/onboarding");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Workspace</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
