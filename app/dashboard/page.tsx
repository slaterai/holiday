"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import HomeScreen from "@/components/HomeScreen";
import PlaceholderPage from "@/components/PlaceholderPage";

export default function Dashboard() {
  const [activePage, setActivePage] = useState("home");
  const [pageTitle, setPageTitle] = useState("Home");

  function handleNavigate(id: string, label: string) {
    setActivePage(id);
    setPageTitle(label);
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#080808" }}>
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto">
          {activePage === "home" ? (
            <HomeScreen />
          ) : (
            <PlaceholderPage title={pageTitle} />
          )}
        </main>
      </div>
    </div>
  );
}
