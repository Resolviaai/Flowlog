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
    <>
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border pb-safe pt-2 px-6 z-50">
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

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-surface border-r border-border z-50">
        <div className="p-6 mb-4">
          <h1 className="text-2xl font-bold text-white tracking-tight">Flow Log</h1>
        </div>
        <div className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive ? "text-accent bg-accent/10" : "text-text-secondary hover:text-white hover:bg-white/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
}
