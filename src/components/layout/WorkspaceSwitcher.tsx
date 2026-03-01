import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Card, CardContent } from "../ui/Card";
import { ChevronDown, Plus, Check, Briefcase } from "lucide-react";
import { Button } from "../ui/Button";
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
        className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-xl text-sm font-medium text-white hover:bg-white/5 transition-colors"
      >
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: currentWorkspace.accent_color }} 
        />
        <span className="truncate max-w-[120px]">{currentWorkspace.name}</span>
        <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <Card className="absolute top-full left-0 mt-2 w-64 z-50 shadow-2xl border-border bg-surface">
            <CardContent className="p-2 space-y-1">
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
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
