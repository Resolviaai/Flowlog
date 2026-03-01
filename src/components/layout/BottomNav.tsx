import React from "react";
import { NavLink } from "react-router-dom";
import { Home, PlaySquare, Wallet, RefreshCw, Grid } from "lucide-react";

export function BottomNav() {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/videos", icon: PlaySquare, label: "Videos" },
    { to: "/batches", icon: Wallet, label: "Batches" },
    { to: "/revisions", icon: RefreshCw, label: "Revisions" },
    { to: "/more", icon: Grid, label: "More" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-border pb-safe pt-2 px-4 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-xl transition-colors ${
                isActive ? "text-accent" : "text-text-secondary hover:text-text-primary"
              }`
            }
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
