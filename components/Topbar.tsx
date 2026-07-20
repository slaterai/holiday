interface TopbarProps {
  pageTitle: string;
}

export default function Topbar({ pageTitle }: TopbarProps) {
  return (
    <header className="flex items-center justify-between px-6 h-14 border-b border-white/[0.06] shrink-0"
      style={{ background: "#080808" }}>
      <span className="text-white text-sm font-semibold tracking-[0.15em] uppercase">Holiday</span>
      <span className="text-white/40 text-sm">{pageTitle}</span>
    </header>
  );
}
