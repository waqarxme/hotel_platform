import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-lava-950 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-lava-500 hover:bg-lava-600 text-white shadow-lg shadow-lava-500/25 hover:shadow-lava-500/40 focus:ring-lava-400 border border-lava-400/40 font-semibold",
      secondary:
        "bg-lava-900 hover:bg-lava-850 text-white border border-lava-800 focus:ring-lava-500/40",
      danger:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 focus:ring-rose-500 border border-rose-500/30",
      success:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 focus:ring-emerald-500 border border-emerald-500/30",
      outline:
        "bg-transparent hover:bg-lava-900 text-titanium-200 border border-lava-800 hover:border-lava-600 focus:ring-lava-500/30",
      ghost:
        "bg-transparent hover:bg-lava-900/80 text-titanium-400 hover:text-white focus:ring-lava-500/20",
    };

    const sizes = {
      sm: "text-xs px-3.5 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3 gap-2.5 font-bold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
