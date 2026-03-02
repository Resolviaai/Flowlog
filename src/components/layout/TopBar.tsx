import React from "react";
import { cn } from "../../utils/helpers";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

interface TopBarProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  showSwitcher?: boolean;
  className?: string;
}

export function TopBar({ title, subtitle, rightAction, leftAction, showSwitcher, className }: TopBarProps) {
  return (
    <div className={cn("sticky top-0 z-40 bg-background border-b border-border pt-safe", className)}>
      <div className="flex items-center justify-between px-4 h-14 max-w-md mx-auto">
        <div className="flex items-center gap-3 overflow-hidden">
          {leftAction}
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-text-primary tracking-tight truncate">{title}</h1>
            {subtitle && <p className="text-xs text-text-secondary truncate">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showSwitcher && <WorkspaceSwitcher />}
          {rightAction && <div className="flex items-center">{rightAction}</div>}
        </div>
      </div>
    </div>
  );
}
