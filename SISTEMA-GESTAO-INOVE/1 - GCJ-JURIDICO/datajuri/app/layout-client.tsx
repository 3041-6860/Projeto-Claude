"use client";
import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { SyncProvider } from "./sync-provider";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuToggle={() => setSidebarOpen((v) => !v)} />
      <main
        className="min-h-screen md:ml-60"
        style={{ background: "var(--bg)", paddingTop: 52 }}
      >
        <div className="px-4 md:px-6 pt-4 pb-8">
          <SyncProvider>{children}</SyncProvider>
        </div>
      </main>
    </>
  );
}
