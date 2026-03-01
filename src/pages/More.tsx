import React from "react";
import { useAppContext } from "../context/AppContext";
import { TopBar } from "../components/layout/TopBar";
import { Card, CardContent } from "../components/ui/Card";
import { ChevronRight, DollarSign, Activity, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function More() {
  const navigate = useNavigate();
  const { role, signOut } = useAppContext();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const links = [
    ...(role === "editor" ? [
      { to: "/financials", icon: DollarSign, label: "Financials", color: "text-success" },
      { to: "/activity", icon: Activity, label: "Activity Log", color: "text-accent" },
    ] : []),
    { to: "/settings", icon: SettingsIcon, label: "Settings", color: "text-text-secondary" },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <TopBar title="More" />
      
      <div className="p-4 space-y-4">
        <Card>
          <div className="divide-y divide-border">
            {links.map((link) => (
              <div
                key={link.to}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => navigate(link.to)}
              >
                <div className="flex items-center gap-3">
                  <div className={`bg-surface p-2 rounded-xl ${link.color}`}>
                    <link.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-white">{link.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-text-secondary" />
              </div>
            ))}
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
              onClick={handleSignOut}
            >
              <div className="flex items-center gap-3">
                <div className="bg-surface p-2 rounded-xl text-error">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="font-medium text-white">Sign Out</span>
              </div>
              <ChevronRight className="w-5 h-5 text-text-secondary" />
            </div>
          </div>
        </Card>

        <div className="text-center mt-8">
          <p className="text-xs text-text-secondary">Resolvia: Editor OS v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
