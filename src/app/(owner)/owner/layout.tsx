import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/store";
import { redirect } from "next/navigation";
import { OwnerSidebar } from "@/components/shared/owner-sidebar";
import { Navbar } from "@/components/shared/navbar";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const hotel = user.hotelId ? db.findHotelById(user.hotelId) : db.findHotelByOwnerId(user.id);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <div className="flex-1 flex">
        <OwnerSidebar hotel={hotel || null} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
