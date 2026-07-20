"use client";

const mockEmails = [
  { from: "partnerships@fourseasons.com", subject: "Re: Q3 collaboration - Four Seasons Bali", tag: "brand_inquiry", urgent: true },
  { from: "legal@cars24.com.au", subject: "Usage rights extension - 3 months additional", tag: "usage_rights", urgent: true },
  { from: "accounts@uberaustralia.com", subject: "Invoice INV-2026-041 - payment processed", tag: "invoice", urgent: false },
  { from: "hello@everlabhealth.com", subject: "New campaign brief attached", tag: "brand_inquiry", urgent: false },
];

const tagColors: Record<string, string> = {
  brand_inquiry: "#22d3ee",
  usage_rights: "#f97316",
  invoice: "#22c55e",
  action_required: "#ef4444",
};

export default function HomeScreen() {
  return (
    <div className="p-8 max-w-5xl">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1">Good morning, Nick.</h1>
        <p className="text-white/40 text-sm">Sunday, 20 July 2026</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Card 1 - Overnight emails */}
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
            <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#ef4444]">Inbox</span>
          </div>
          <h2 className="text-white font-medium mb-1">4 emails overnight</h2>
          <p className="text-white/40 text-xs mb-4">2 need your attention</p>

          <div className="space-y-2.5">
            {mockEmails.map((email, i) => (
              <div key={i} className="flex items-start gap-2.5 group cursor-pointer">
                <div
                  className="w-1 h-1 rounded-full mt-2 shrink-0"
                  style={{ background: tagColors[email.tag] || "#6b6b6b" }}
                />
                <div className="min-w-0">
                  <p className="text-white/70 text-xs font-medium truncate group-hover:text-white transition-colors">
                    {email.subject}
                  </p>
                  <p className="text-white/30 text-[10px] truncate">{email.from}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-4 text-xs text-white/30 hover:text-white/60 transition-colors">
            View all in Email Triage →
          </button>
        </div>

        {/* Card 2 - Top performing */}
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
            <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#f97316]">Performance</span>
          </div>
          <h2 className="text-white font-medium mb-1">Top post this week</h2>
          <p className="text-white/40 text-xs mb-4">Jul 5 - 194K views</p>

          <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-3.5 mb-3">
            <p className="text-white text-sm font-medium mb-2">WHAT EVEN IS THIS PLACE</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Views", value: "194K" },
                { label: "Likes", value: "24.6K" },
                { label: "Comments", value: "455" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-white text-sm font-semibold">{stat.value}</p>
                  <p className="text-white/30 text-[10px]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/40 text-xs italic">
            "Honest thoughts on" format is your most commented. Last used 3 weeks ago.
          </p>

          <button className="mt-4 text-xs text-white/30 hover:text-white/60 transition-colors">
            View in Performance Insights →
          </button>
        </div>

        {/* Card 3 - Today's concept */}
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#22c55e]">Create</span>
          </div>
          <h2 className="text-white font-medium mb-1">Top concept today</h2>
          <p className="text-white/40 text-xs mb-4">From your performing formats</p>

          <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-3.5 mb-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-semibold tracking-wider uppercase text-[#22c55e] bg-[#22c55e]/10 rounded px-1.5 py-0.5">
                Performing
              </span>
              <span className="text-[9px] text-white/30 font-medium uppercase tracking-wider">Reel</span>
            </div>
            <p className="text-white text-sm font-medium leading-snug">
              Honest thoughts on Gold Coast
            </p>
            <p className="text-white/40 text-xs leading-relaxed">
              Your "Honest thoughts on" series drives 3x your average comments. You haven't posted a destination review in 3 weeks.
            </p>
          </div>

          <button className="w-full mt-1 py-2 rounded-lg text-xs font-medium text-white bg-white/[0.07] hover:bg-white/[0.11] transition-colors">
            Add to To-Do
          </button>

          <button className="mt-2.5 text-xs text-white/30 hover:text-white/60 transition-colors">
            See all 5 concepts →
          </button>
        </div>

      </div>
    </div>
  );
}
