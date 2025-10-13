import "./globals.css";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = {
  title: "Trade Journal",
  description: "FundingPips-style trading journal"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en">
      <body>
        <Header />
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white/80 backdrop-blur dark:bg-neutral-950/80 dark:border-neutral-800">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg">Trade Journal</span>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/" className="hover:underline">Dashboard</Link>
            <Link href="/trades" className="hover:underline">Trades</Link>
            <Link href="/calendar" className="hover:underline">P&L Calendar</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a className="btn" href="/trades">New Trade</a>
        </div>
      </div>
    </header>
  );
}

"use client";
import { useEffect, useState } from "react";
function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const d = localStorage.getItem("theme") === "dark";
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return (
    <button className="btn-outline" onClick={toggle}>
      {dark ? "Light" : "Dark"}
    </button>
  );
}
