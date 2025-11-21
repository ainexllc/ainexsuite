export const TrackIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="white" className={className}>
    <rect x="3" y="12" width="3.5" height="8" />
    <rect x="9" y="8" width="3.5" height="12" />
    <rect x="15" y="4" width="3.5" height="16" />
    <path d="M2 12 L8 7 L14 10 L20 4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
