"use client";

import { useState, useEffect } from "react";
import VoiceRecorder from "./VoiceRecorder";
import { getSupabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

interface VoiceMessage {
  id: string;
  text: string;
  classification: string;
  interpretation: string;
  tags: string[];
  createdAt: string;
}

interface ProcessResult {
  classification: string;
  summary: string;
  interpretation: string;
  tags: string[];
}

export default function VoicePage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [lastProcessed, setLastProcessed] = useState<ProcessResult | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  async function handleProcessed(result: ProcessResult) {
    setLastProcessed(result);
    setShowSuccess(true);

    // Add to messages list
    const newMsg: VoiceMessage = {
      id: Math.random().toString(),
      text: "",
      classification: result.classification,
      interpretation: result.interpretation,
      tags: result.tags,
      createdAt: new Date().toISOString(),
    };
    setMessages([newMsg, ...messages]);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  const classificationColors: Record<string, string> = {
    content_concept: "#22c55e",
    email_draft: "#ef4444",
    brand_inquiry: "#22d3ee",
    idea: "#a78bfa",
    note: "#6b6b6b",
  };

  return (
    <div className="flex h-full flex-col">
      {/* Recorder section */}
      <div className="flex-1 flex flex-col items-center justify-center border-b border-white/[0.06] p-8">
        <div className="w-full max-w-md">
          <h2 className="text-white font-medium text-center mb-2">Speak your idea</h2>
          <p className="text-white/40 text-xs text-center mb-8">
            Press to record, release to auto-process
          </p>
          <VoiceRecorder onProcessed={handleProcessed} />
        </div>
      </div>

      {/* Success message */}
      {showSuccess && lastProcessed && (
        <div className="border-b border-white/[0.06] bg-white/[0.02] p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: classificationColors[lastProcessed.classification] }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase text-white/70">
                    Saved as {lastProcessed.classification.replace(/_/g, " ")}
                  </span>
                  {lastProcessed.tags.length > 0 && (
                    <div className="flex gap-1">
                      {lastProcessed.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-white/60">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-white/60 text-xs leading-relaxed">{lastProcessed.summary}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <h3 className="text-white/50 text-xs font-semibold uppercase mb-4">
            Ideas ({messages.length})
          </h3>
          {messages.length === 0 ? (
            <p className="text-white/20 text-sm">No ideas saved yet</p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded shrink-0"
                        style={{
                          color: classificationColors[msg.classification],
                          background: `${classificationColors[msg.classification]}18`,
                        }}
                      >
                        {msg.classification.replace(/_/g, " ")}
                      </span>
                      {msg.tags.length > 0 && (
                        <div className="flex gap-1">
                          {msg.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-white/60">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-2">{msg.interpretation}</p>
                  <button
                    onClick={() => copyToClipboard(msg.interpretation)}
                    className="text-xs text-white/40 hover:text-white/70 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
