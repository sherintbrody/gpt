"use client";
import { usePathname } from "next/navigation";
export default function PageFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div key={pathname} className="animate-page-fade">{children}</div>;
}
