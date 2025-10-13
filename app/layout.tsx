import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import SidebarNav from "@/components/SidebarNav";
import Toaster from "@/components/Toaster";
import PageFade from "@/components/PageFade";

export const metadata = { title: "Trade Journal", description: "FundingPips-style trading journal" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className="min-h-screen">
        <Toaster />
        <div className="flex min-h-screen">
          <aside className="hidden md:block w-60 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold text-lg">Trade Journal</span>
              <ThemeToggle />
            </div>
            <SidebarNav />
            <div className="mt-4">
              <a className="btn w-full justify-center" href="/trades">New Trade</a>
            </div>
          </aside>
          <div className="flex-1 flex flex-col">
            {/* Mobile header */}
            <header className="md:hidden border-b border-neutral-200 bg-white/80 backdrop-blur dark:bg-neutral-950/80 dark:border-neutral-800">
              <div className="container flex h-14 items-center justify-between">
                <span className="font-bold text-lg">Trade Journal</span>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <a className="btn" href="/trades">New Trade</a>
                </div>
              </div>
            </header>
            <main className="container py-6">
              <PageFade>{children}</PageFade>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import SidebarNav from "@/components/SidebarNav";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Prefetch common routes for snappier nav
  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/trades");
    router.prefetch("/calendar");
    router.prefetch("/journal");
  }, [router]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:block w-60 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-bold text-lg">Trade Journal</span>
          <ThemeToggle />
        </div>
        <SidebarNav />
        <div className="mt-4">
          <a className="btn w-full justify-center" href="/trades">New Trade</a>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur dark:bg-neutral-950/80 dark:border-neutral-800">
        <div className="container flex h-14 items-center justify-between">
          <button className="btn-outline" onClick={() => setOpen(true)}>Menu</button>
          <span className="font-bold text-lg">Trade Journal</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a className="btn" href="/trades">New</a>
          </div>
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      <div className={`fixed inset-0 z-50 md:hidden transition ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
        <div className={`absolute top-0 left-0 h-full w-72 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 p-4 transform transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-4 flex items-center justify-between">
            <span className="font-bold text-lg">Trade Journal</span>
            <button className="btn-outline" onClick={() => setOpen(false)}>Close</button>
          </div>
          <SidebarNav onNavigate={() => setOpen(false)} />
          <div className="mt-4">
            <a className="btn w-full justify-center" href="/trades" onClick={() => setOpen(false)}>New Trade</a>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 flex flex-col">
        <div className="md:hidden h-14" />
        <main className="container py-6 fade-enter fade-enter-active">{children}</main>
      </div>

      <Toaster position="top-right" toastOptions={{ duration: 2400 }} />
    </div>
  );
}
