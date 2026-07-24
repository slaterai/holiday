"use client";

import { useState } from "react";
import VoiceRecorder from "./VoiceRecorder";
import { getSupabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

interface VoiceMessage {
  id: string;
  text: string;
  createdAt: string;
}

export default function VoicePage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleTranscription(text: string) {
    setCurrentText(text);
  }

  async function saveMessage() {
    if (!user || !currentText.trim()) return;

    setSaving(true);
    try {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("voice_messages")
        .insert({
          user_id: user.id,
          text: currentText,
        } as any)
        .select();

      if (error) throw error;

      if (data && (data as any).length > 0) {
        const d = data as any;
        const newMsg = {
          id: d[0].id,
          text: d[0].text,
          createdAt: d[0].created_at,
        };
        setMessages([newMsg, ...messages]);
        setCurrentText("");
      }
    } catch (err: any) {
      console.error("Failed to save message:", err.message);
    } finally {
      setSaving(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Recorder section */}
      <div className="flex-1 flex flex-col items-center justify-center border-b border-white/[0.06] p-8">
        <div className="w-full max-w-md">
          <h2 className="text-white font-medium text-center mb-2">Record a message</h2>
          <p className="text-white/40 text-xs text-center mb-8">
            Press to record, release to transcribe
          </p>
          <VoiceRecorder onTranscription={handleTranscription} />
        </div>
      </div>

      {/* Transcription display */}
      {currentText && (
        <div className="flex-1 flex flex-col border-b border-white/[0.06] p-8">
          <div className="max-w-2xl w-full">
            <h3 className="text-white/50 text-xs font-semibold uppercase mb-3">
              Transcription
            </h3>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 mb-4">
              <p className="text-white/70 text-sm leading-relaxed">{currentText}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(currentText)}
                className="text-xs font-medium px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
              >
                Copy
              </button>
              <button
                onClick={saveMessage}
                disabled={saving}
                className="text-xs font-medium px-3 py-1.5 bg-white text-black rounded hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setCurrentText("")}
                className="text-xs font-medium px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <h3 className="text-white/50 text-xs font-semibold uppercase mb-4">
            Saved messages ({messages.length})
          </h3>
          {messages.length === 0 ? (
            <p className="text-white/20 text-sm">No saved messages yet</p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                  <p className="text-white/70 text-sm leading-relaxed mb-2">{msg.text}</p>
                  <button
                    onClick={() => copyToClipboard(msg.text)}
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
