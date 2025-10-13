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
