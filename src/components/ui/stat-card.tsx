import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
  accentColor?: "cobalt" | "emerald" | "amber" | "crimson" | "violet" | "lava";
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  isPositive,
  subtext,
  accentColor = "lava",
  className,
}: StatCardProps) {
  const iconColors = {
    lava: "bg-lava-500/15 text-lava-400 border-lava-500/30",
    cobalt: "bg-lava-500/15 text-lava-400 border-lava-500/30",
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    crimson: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    violet: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  };

  return (
    <div className={cn("glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-lava-600 transition duration-200 shadow-xl border border-lava-800", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-titanium-400 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl sm:text-3xl font-bold text-white mt-1.5 font-heading tracking-tight">{value}</h4>
          {(change || subtext) && (
            <div className="flex items-center gap-2 mt-2">
              {change && (
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-md font-mono",
                    isPositive ? "text-emerald-400 bg-emerald-500/15 border border-emerald-500/30" : "text-rose-400 bg-rose-500/15 border border-rose-500/30"
                  )}
                >
                  {change}
                </span>
              )}
              {subtext && <span className="text-xs text-titanium-400">{subtext}</span>}
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-2xl border shrink-0", iconColors[accentColor])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
