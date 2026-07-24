interface TopbarProps {
  pageTitle: string;
  onMenuClick?: () => void;
}

export default function Topbar({ pageTitle, onMenuClick }: TopbarProps) {
  return (
    <header className="flex items-center justify-between px-4 lg:px-6 h-14 border-b border-white/[0.06] shrink-0"
      style={{ background: "#080808" }}>
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 hover:bg-white/10 rounded transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white">
            <path d="M2 4h16M2 10h16M2 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span className="text-white text-sm font-semibold tracking-[0.15em] uppercase hidden sm:inline">Holiday</span>
      </div>
      <span className="text-white/40 text-sm">{pageTitle}</span>
    </header>
  );
}
