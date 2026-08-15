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
    default: "bg-slate-100 text-slate-700 border-slate-200",
    lava: "bg-red-50 text-red-700 border-red-200 font-bold",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-red-50 text-red-700 border-red-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
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
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    crimson: "bg-rose-500",
    cobalt: "bg-red-500",
    gray: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-2xs",
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
