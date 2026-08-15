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
    lava: "bg-red-50 text-red-600 border-red-200",
    cobalt: "bg-red-50 text-red-600 border-red-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    crimson: "bg-rose-50 text-rose-600 border-rose-200",
    violet: "bg-purple-50 text-purple-600 border-purple-200",
  };

  return (
    <div className={cn("bg-white rounded-2xl p-5 relative overflow-hidden group hover:border-red-500 transition-all duration-200 shadow-sm hover:shadow-md border border-slate-200", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl sm:text-3xl font-bold text-slate-950 mt-1.5 font-heading tracking-tight">{value}</h4>
          {(change || subtext) && (
            <div className="flex items-center gap-2 mt-2">
              {change && (
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-md font-mono",
                    isPositive ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-rose-700 bg-rose-50 border border-rose-200"
                  )}
                >
                  {change}
                </span>
              )}
              {subtext && <span className="text-xs text-slate-500">{subtext}</span>}
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
