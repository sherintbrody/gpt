"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const items = [
  { href: "/", label: "Dashboard" },
  { href: "/trades", label: "Trades" },
  { href: "/calendar", label: "P&L Calendar" }
];

export default function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={clsx(
              "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-neutral-100 text-ink dark:bg-neutral-800 dark:text-neutral-100"
                : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
