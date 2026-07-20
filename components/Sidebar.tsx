"use client";

import { useState } from "react";

type NavItem = {
  label: string;
  id: string;
};

type NavSection = {
  group: string;
  accent: string;
  items: NavItem[];
};

const nav: NavSection[] = [
  {
    group: "Command",
    accent: "#22d3ee",
    items: [
      { label: "Morning Brief", id: "morning-brief" },
      { label: "To-Do", id: "todo" },
    ],
  },
  {
    group: "Inbox",
    accent: "#ef4444",
    items: [
      { label: "Email Triage", id: "email-triage" },
      { label: "DMs", id: "dms" },
    ],
  },
  {
    group: "Create",
    accent: "#22c55e",
    items: [
      { label: "Voice to Script", id: "voice-to-script" },
      { label: "Concepts", id: "concepts" },
      { label: "Content Calendar", id: "content-calendar" },
    ],
  },
  {
    group: "Growth",
    accent: "#f97316",
    items: [
      { label: "Viral Reel Research", id: "viral-reel-research" },
      { label: "Performance Insights", id: "performance-insights" },
      { label: "Pitch Engine", id: "pitch-engine" },
      { label: "Deal Pipeline", id: "deal-pipeline" },
      { label: "Analytics", id: "analytics" },
    ],
  },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (id: string, label: string) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside
      className="flex flex-col w-56 shrink-0 h-full border-r border-white/[0.06]"
      style={{ background: "#0a0a0a" }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/[0.06]">
        <span className="text-white text-lg font-semibold tracking-[0.15em] uppercase">
          Holiday
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {nav.map((section) => (
          <div key={section.group} className="mb-5">
            <div className="flex items-center gap-1.5 px-2 mb-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: section.accent }}
              />
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                style={{ color: section.accent }}>
                {section.group}
              </span>
            </div>
            {section.items.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id, item.label)}
                  className="w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-150 mb-0.5 cursor-pointer"
                  style={{
                    color: isActive ? "#ffffff" : "#6b6b6b",
                    background: isActive ? "#1a1a1a" : "transparent",
                    fontWeight: isActive ? 500 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "#a0a0a0";
                      e.currentTarget.style.background = "#141414";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "#6b6b6b";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60 font-medium">
            N
          </div>
          <div>
            <p className="text-xs text-white font-medium leading-none mb-0.5">Nick Slater</p>
            <p className="text-[10px] text-white/30 leading-none">create@nickslater.au</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
