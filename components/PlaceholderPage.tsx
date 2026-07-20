interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-white/20 text-sm">{title}</p>
        <p className="text-white/10 text-xs mt-1">Coming soon</p>
      </div>
    </div>
  );
}
