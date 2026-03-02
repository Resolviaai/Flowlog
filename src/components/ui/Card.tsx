import React from "react";
import { cn } from "../../utils/helpers";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  key?: React.Key;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-2xl overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("px-6 py-4 border-b border-border", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: CardProps) {
  return (
    <h3 className={cn("text-lg font-semibold text-white", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}
