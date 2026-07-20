"use client";

import { useState } from "react";

interface EmailPageProps {
  gmailConnected: boolean;
  gmailEmail: string;
}

const mockEmails = [
  {
    id: "1",
    from: "partnerships@fourseasons.com",
    fromName: "Four Seasons",
    subject: "Re: Q3 collaboration - Four Seasons Bali",
    summary: "Following up on the Bali campaign brief. They're proposing a 4-night stay for content creation in September with full usage rights across Instagram and TikTok.",
    classification: "brand_inquiry",
    urgency: 5,
    receivedAt: "2026-07-20T07:14:00Z",
    suggestedAction: "Reply asking for budget and usage period before committing.",
    suggestedReply: "Hi, thanks for reaching out. I'd love to hear more about the campaign. Before I can confirm availability, could you share the proposed budget and intended usage period? Happy to jump on a call if easier.",
  },
  {
    id: "2",
    from: "legal@cars24.com.au",
    fromName: "Cars24",
    subject: "Usage rights extension - 3 months additional",
    summary: "Cars24 requesting to extend usage rights on the March campaign content for an additional 3 months across Meta ads. No additional fee mentioned.",
    classification: "usage_rights",
    urgency: 5,
    receivedAt: "2026-07-20T06:42:00Z",
    suggestedAction: "Negotiate a usage extension fee before agreeing. Standard rate is ~$1k/month.",
    suggestedReply: "Thanks for the note. Happy to extend usage for an additional 3 months. My standard rate for continued usage is $1,000/month, so an extension fee of $3,000 would apply. Let me know if that works and I'll send a revised agreement.",
  },
  {
    id: "3",
    from: "accounts@uberaustralia.com",
    fromName: "Uber Australia",
    subject: "Invoice INV-2026-041 - payment processed",
    summary: "Uber has processed payment for invoice INV-2026-041. Funds should clear within 2-3 business days.",
    classification: "invoice",
    urgency: 1,
    receivedAt: "2026-07-20T05:30:00Z",
    suggestedAction: "No action needed. Mark deal as paid.",
    suggestedReply: null,
  },
  {
    id: "4",
    from: "hello@everlabhealth.com",
    fromName: "Everlab",
    subject: "New campaign brief attached",
    summary: "Everlab have sent a new campaign brief for Q3. Looking for 2 Reels and 1 TikTok around longevity and preventive health testing.",
    classification: "brand_inquiry",
    urgency: 3,
    receivedAt: "2026-07-19T22:15:00Z",
    suggestedAction: "Review brief and ask for budget before responding.",
    suggestedReply: "Hi team, thanks for sending this through - the brief looks interesting and aligns well with my content. Before I confirm availability, could you share the proposed budget for the deliverables? Looking forward to working together again.",
  },
];

const classificationLabels: Record<string, { label: string; color: string }> = {
  brand_inquiry: { label: "Brand Inquiry", color: "#22d3ee" },
  usage_rights: { label: "Usage Rights", color: "#f97316" },
  invoice: { label: "Invoice", color: "#22c55e" },
  contract: { label: "Contract", color: "#a78bfa" },
  action_required: { label: "Action Required", color: "#ef4444" },
  noise: { label: "Noise", color: "#6b6b6b" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function EmailPage({ gmailConnected }: EmailPageProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedEmail = mockEmails.find((e) => e.id === selected);

  function copyReply(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (!gmailConnected) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 4h16v12H2V4z" stroke="#ffffff40" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 4l8 7 8-7" stroke="#ffffff40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-white font-medium mb-2">Connect your Gmail</h2>
          <p className="text-white/40 text-sm mb-6 leading-relaxed">
            Holiday will read your inbox, surface what matters, and draft replies in your voice.
          </p>
          <a
            href="/api/auth/google"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Connect Gmail
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Email list */}
      <div className="w-80 shrink-0 border-r border-white/[0.06] overflow-y-auto">
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-medium text-sm">Inbox</h2>
          <p className="text-white/30 text-xs mt-0.5">{mockEmails.length} emails · 2 need attention</p>
        </div>

        {mockEmails.map((email) => {
          const tag = classificationLabels[email.classification];
          const isSelected = selected === email.id;
          return (
            <button
              key={email.id}
              onClick={() => setSelected(email.id)}
              className="w-full text-left px-4 py-3.5 border-b border-white/[0.04] transition-colors"
              style={{ background: isSelected ? "#141414" : "transparent" }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#0f0f0f"; }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-xs font-medium truncate pr-2">{email.fromName}</span>
                <span className="text-white/25 text-[10px] shrink-0">{timeAgo(email.receivedAt)}</span>
              </div>
              <p className="text-white/50 text-xs truncate mb-1.5">{email.subject}</p>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded"
                  style={{ color: tag?.color, background: `${tag?.color}18` }}
                >
                  {tag?.label}
                </span>
                {email.urgency >= 4 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Email detail */}
      <div className="flex-1 overflow-y-auto">
        {selectedEmail ? (
          <div className="p-6 max-w-2xl">
            <div className="mb-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h2 className="text-white font-medium text-base leading-snug">{selectedEmail.subject}</h2>
                <span className="text-white/25 text-xs shrink-0 mt-0.5">{timeAgo(selectedEmail.receivedAt)}</span>
              </div>
              <p className="text-white/30 text-xs">{selectedEmail.from}</p>
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4 mb-4">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-white/30 mb-2">Summary</p>
              <p className="text-white/70 text-sm leading-relaxed">{selectedEmail.summary}</p>
            </div>

            {/* Suggested action */}
            <div className="rounded-lg bg-[#f97316]/[0.06] border border-[#f97316]/20 p-4 mb-4">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-[#f97316]/60 mb-2">Suggested action</p>
              <p className="text-white/70 text-sm leading-relaxed">{selectedEmail.suggestedAction}</p>
            </div>

            {/* Suggested reply */}
            {selectedEmail.suggestedReply && (
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold tracking-wider uppercase text-white/30">Draft reply</p>
                  <button
                    onClick={() => copyReply(selectedEmail.id, selectedEmail.suggestedReply!)}
                    className="text-[10px] font-medium text-white/40 hover:text-white/70 transition-colors"
                  >
                    {copiedId === selectedEmail.id ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{selectedEmail.suggestedReply}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/20 text-sm">Select an email</p>
          </div>
        )}
      </div>
    </div>
  );
}
