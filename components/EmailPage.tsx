"use client";

import { useState, useEffect } from "react";
import ReplyEditor from "./ReplyEditor";

type Email = {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  summary: string;
  classification: string;
  urgency: number;
  receivedAt: string;
  suggestedAction: string;
  suggestedReply: string | null;
};

const classificationLabels: Record<string, { label: string; color: string }> = {
  brand_inquiry: { label: "Brand Inquiry", color: "#22d3ee" },
  usage_rights: { label: "Usage Rights", color: "#f97316" },
  invoice: { label: "Invoice", color: "#22c55e" },
  contract: { label: "Contract", color: "#a78bfa" },
  action_required: { label: "Action Required", color: "#ef4444" },
  follow_up_needed: { label: "Follow Up", color: "#facc15" },
  noise: { label: "Noise", color: "#6b6b6b" },
};

function timeAgo(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function EmailPage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmails() {
      try {
        const res = await fetch("/api/emails");
        const data = await res.json();
        if (data.connected === false) {
          setConnected(false);
        } else {
          setConnected(true);
          setEmails(data.emails || []);
          if (data.emails?.length > 0) setSelected(data.emails[0].id);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEmails();
  }, []);

  function copyReply(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const selectedEmail = emails.find((e) => e.id === selected);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/30 text-sm">Reading your inbox...</p>
        </div>
      </div>
    );
  }

  if (!connected) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-white/40 text-sm mb-2">Failed to load emails</p>
          <p className="text-white/20 text-xs">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-xs text-white/40 hover:text-white/70">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Email list */}
      <div className="w-80 shrink-0 border-r border-white/[0.06] overflow-y-auto min-h-0">
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-medium text-sm">Inbox</h2>
          <p className="text-white/30 text-xs mt-0.5">
            {emails.length} emails
            {emails.filter(e => e.urgency >= 4).length > 0 && ` · ${emails.filter(e => e.urgency >= 4).length} need attention`}
          </p>
        </div>

        {emails.map((email) => {
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
                {tag && (
                  <span
                    className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded"
                    style={{ color: tag.color, background: `${tag.color}18` }}
                  >
                    {tag.label}
                  </span>
                )}
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

            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4 mb-4">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-white/30 mb-2">Summary</p>
              <p className="text-white/70 text-sm leading-relaxed">{selectedEmail.summary}</p>
            </div>

            <div className="rounded-lg bg-[#f97316]/[0.06] border border-[#f97316]/20 p-4 mb-4">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-[#f97316]/60 mb-2">Suggested action</p>
              <p className="text-white/70 text-sm leading-relaxed">{selectedEmail.suggestedAction}</p>
            </div>

            {selectedEmail.suggestedReply && (
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold tracking-wider uppercase text-white/30">Draft reply</p>
                  <button
                    onClick={() => setEditingReplyId(selectedEmail.id)}
                    className="text-[10px] font-medium text-white text-center px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors"
                  >
                    Edit & Send
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

      {/* Reply editor modal */}
      {editingReplyId && selectedEmail && (
        <ReplyEditor
          emailId={editingReplyId}
          toEmail={selectedEmail.from}
          subject={selectedEmail.subject}
          suggestedReply={selectedEmail.suggestedReply || ""}
          onSent={() => {
            setEditingReplyId(null);
            // Optionally reload emails or show a success toast
          }}
          onCancel={() => setEditingReplyId(null)}
        />
      )}
    </div>
  );
}
