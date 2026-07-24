"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import HomeScreen from "@/components/HomeScreen";
import EmailPage from "@/components/EmailPage";
import VoicePage from "@/components/VoicePage";
import ConceptsPage from "@/components/ConceptsPage";
import PlaceholderPage from "@/components/PlaceholderPage";

function DashboardInner() {
  const [activePage, setActivePage] = useState("home");
  const [pageTitle, setPageTitle] = useState("Home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchParams = useSearchParams();

  function handleNavigate(id: string, label: string) {
    setActivePage(id);
    setPageTitle(label);
    setSidebarOpen(false);
  }

  function renderPage() {
    switch (activePage) {
      case "email-triage":
        return <EmailPage />;
      case "voice":
        return <VoicePage />;
      case "concepts":
        return <ConceptsPage />;
      case "home":
        return <HomeScreen />;
      default:
        return <PlaceholderPage title={pageTitle} />;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#080808" }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar activePage={activePage} onNavigate={handleNavigate} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-56 lg:hidden">
            <Sidebar activePage={activePage} onNavigate={handleNavigate} />
          </div>
        </>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar pageTitle={pageTitle} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}
