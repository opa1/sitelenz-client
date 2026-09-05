"use client";

import { useState } from "react";
import { useAnalysisStore } from "@/store/analysisStore";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AnalyzeForm } from "@/components/analyze/AnalyzeForm";
import { AnalysisStatus } from "@/components/analyze/AnalysisStatus";
import { AnalysisReport } from "@/components/report/AnalysisReport";
import { PaymentConfirmDialog } from "@/components/analyze/PaymentConfirmDialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";

function MainContent() {
  const view = useAnalysisStore((s) => s.view);
  if (view === "submitted") return <AnalysisStatus />;
  if (view === "completed") return <AnalysisReport />;
  return <AnalyzeForm />;
}

export function AppLayout() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // Open by default on desktop (a fixed, collapsible panel); closed by
  // default on mobile, where the same state instead controls an overlay
  // drawer.
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  return (
    <>
      <div className="flex h-screen flex-col">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isDesktop={isDesktop} open={sidebarOpen} onOpenChange={setSidebarOpen} />
          <main className="flex flex-1 flex-col overflow-y-auto">
            <MainContent />
          </main>
        </div>
      </div>
      <PaymentConfirmDialog />
    </>
  );
}
