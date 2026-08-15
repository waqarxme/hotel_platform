import React from "react";
import { cn } from "@/lib/utils";
import { HotelStatus } from "@/types";
import { getStatusBadgeVariant } from "@/lib/utils";

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
    lava: "bg-lava-500/15 text-lava-400 border-lava-500/40 shadow-sm shadow-lava-500/10 font-bold",
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

export interface PulseStatusBadgeProps {
  status: HotelStatus;
  className?: string;
}

export function PulseStatusBadge({ status, className }: PulseStatusBadgeProps) {
  const { label, bgClass, textClass, borderClass, pulseColor } = getStatusBadgeVariant(status);

  const dotColors = {
    emerald: "bg-emerald-400 shadow-[0_0_10px_#1FAE7A]",
    amber: "bg-amber-400 shadow-[0_0_10px_#F59E0B]",
    crimson: "bg-lava-500 shadow-[0_0_12px_#FF3B30]",
    cobalt: "bg-lava-400 shadow-[0_0_10px_#FF5A4F]",
    gray: "bg-slate-400 shadow-[0_0_8px_#94A3B8]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md",
        bgClass,
        textClass,
        borderClass,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            dotColors[pulseColor]
          )}
        />
        <span className={cn("relative inline-flex rounded-full h-2 w-2", dotColors[pulseColor])} />
      </span>
      {label}
    </span>
  );
}
