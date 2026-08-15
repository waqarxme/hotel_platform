import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "lava";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-lava-900 text-titanium-200 border-lava-800",
    lava: "bg-lava-500/15 text-lava-400 border-lava-500/40 font-bold",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/40",
    danger: "bg-rose-500/15 text-rose-400 border-rose-500/40",
    info: "bg-lava-500/15 text-lava-400 border-lava-500/40",
    purple: "bg-purple-500/15 text-purple-400 border-purple-500/40",
  };

  const sizes = {
    sm: "text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wider",
    md: "text-xs px-3 py-1 font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border tracking-wide",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
