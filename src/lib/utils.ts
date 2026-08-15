import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { HotelStatus } from "@/types";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getStatusBadgeVariant(status: HotelStatus): {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  pulseColor: "emerald" | "amber" | "crimson" | "cobalt" | "gray";
} {
  switch (status) {
    case "approved":
    case "active":
      return {
        label: "Approved & Active",
        bgClass: "bg-emerald-50",
        textClass: "text-emerald-700",
        borderClass: "border-emerald-200",
        pulseColor: "emerald",
      };
    case "pending_approval":
      return {
        label: "Pending Approval",
        bgClass: "bg-amber-50",
        textClass: "text-amber-800",
        borderClass: "border-amber-200",
        pulseColor: "amber",
      };
    case "rejected":
      return {
        label: "Rejected",
        bgClass: "bg-rose-50",
        textClass: "text-rose-700",
        borderClass: "border-rose-200",
        pulseColor: "crimson",
      };
    case "suspended":
      return {
        label: "Suspended",
        bgClass: "bg-rose-50",
        textClass: "text-rose-700",
        borderClass: "border-rose-200",
        pulseColor: "crimson",
      };
    case "draft":
    default:
      return {
        label: "Draft",
        bgClass: "bg-slate-100",
        textClass: "text-slate-600",
        borderClass: "border-slate-200",
        pulseColor: "gray",
      };
  }
}
