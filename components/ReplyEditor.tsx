"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

interface ReplyEditorProps {
  emailId: string;
  toEmail: string;
  subject: string;
  suggestedReply: string;
  onSent: () => void;
  onCancel: () => void;
}

export default function ReplyEditor({
  emailId,
  toEmail,
  subject,
  suggestedReply,
  onSent,
  onCancel,
}: ReplyEditorProps) {
  const { user } = useUser();
  const [reply, setReply] = useState(suggestedReply);
  const [rate, setRate] = useState("");
  const [usagePeriod, setUsagePeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Send the email via Gmail API
      const sendRes = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail,
          subject,
          replyText: reply,
        }),
      });

      if (!sendRes.ok) {
        const data = await sendRes.json();
        throw new Error(data.error || "Failed to send email");
      }

      const sb = getSupabase();

      // Store the sent reply for voice learning
      await sb.from("sent_replies").insert({
        user_id: user.id,
        email_id: emailId,
        to_email: toEmail,
        subject: `Re: ${subject}`,
        reply_text: reply,
      });

      // Store deal data if provided
      if (rate || usagePeriod) {
        const emailDomain = toEmail.split("@")[1];
        await sb.from("deals").insert({
          user_id: user.id,
          brand: emailDomain.replace(".", " ").toUpperCase(),
          contact_email: toEmail,
          rate: rate ? parseFloat(rate) : null,
          usage_period: usagePeriod || null,
        });
      }

      onSent();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] rounded-lg border border-white/[0.08] max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08]">
          <h2 className="text-white font-medium">Draft reply</h2>
          <p className="text-white/30 text-xs mt-1">To: {toEmail}</p>
        </div>

        {/* Reply text editor */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase mb-2 block">
              Reply
            </label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="w-full h-48 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-white/[0.2]"
              placeholder="Edit your reply here..."
            />
          </div>

          {/* Quote data fields */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/[0.08]">
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase mb-2 block">
                Rate (optional)
              </label>
              <input
                type="text"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="e.g. $1000/month"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/[0.2]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase mb-2 block">
                Usage period (optional)
              </label>
              <input
                type="text"
                value={usagePeriod}
                onChange={(e) => setUsagePeriod(e.target.value)}
                placeholder="e.g. 3 months"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/[0.2]"
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-[#ef4444] bg-[#ef4444]/[0.1] border border-[#ef4444]/30 rounded px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-white/[0.08] flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-white/40 hover:text-white/70 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !reply.trim()}
            className="px-4 py-2 text-xs font-medium bg-white text-black rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send & Learn"}
          </button>
        </div>
      </div>
    </div>
  );
}
