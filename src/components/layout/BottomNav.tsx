import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Video, Layers, GitPullRequest, MoreHorizontal } from "lucide-react";

export function BottomNav() {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/videos", icon: Video, label: "Videos" },
    { to: "/batches", icon: Layers, label: "Batches" },
    { to: "/revisions", icon: GitPullRequest, label: "Revisions" },
    { to: "/more", icon: MoreHorizontal, label: "More" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive ? "text-accent bg-accent/10" : "text-text-secondary hover:text-white hover:bg-surface"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
