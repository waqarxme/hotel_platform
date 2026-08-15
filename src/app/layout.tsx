import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cobalt Hotels — Enterprise Hotel Booking & Management Platform",
  description: "Comprehensive multi-tenant hotel onboarding, approval workflow, room booking, and fleet management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased min-h-screen selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
