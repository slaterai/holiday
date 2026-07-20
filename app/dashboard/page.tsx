"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import HomeScreen from "@/components/HomeScreen";
import EmailPage from "@/components/EmailPage";
import PlaceholderPage from "@/components/PlaceholderPage";

function DashboardInner() {
  const [activePage, setActivePage] = useState("home");
  const [pageTitle, setPageTitle] = useState("Home");
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("gmail");
    if (status === "connected") {
      setGmailConnected(true);
    }
  }, [searchParams]);

  function handleNavigate(id: string, label: string) {
    setActivePage(id);
    setPageTitle(label);
  }

  function renderPage() {
    switch (activePage) {
      case "email-triage":
        return <EmailPage gmailConnected={gmailConnected} gmailEmail={gmailEmail} />;
      case "home":
        return <HomeScreen />;
      default:
        return <PlaceholderPage title={pageTitle} />;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#080808" }}>
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar pageTitle={pageTitle} />
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
