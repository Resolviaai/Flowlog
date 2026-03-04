import React from "react";
import { cn } from "../../utils/helpers";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  key?: React.Key;
  isClickable?: boolean;
}

export function Card({ className, children, isClickable, ...props }: CardProps) {
  return (
    <motion.div
      whileTap={isClickable ? { scale: 0.98 } : {}}
      whileHover={isClickable ? { scale: 1.01 } : {}}
      className={cn(
        "bg-surface border border-border rounded-2xl overflow-hidden relative transition-all duration-300 group",
        isClickable && "hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
      {isClickable && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-purple-400">
          <ArrowRight size={18} />
        </div>
      )}
    </motion.div>
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
