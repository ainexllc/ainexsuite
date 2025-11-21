export const PulseIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="white" className={className}>
    <rect x="2" y="2" width="9" height="9" rx="1"/>
    <rect x="13" y="2" width="9" height="9" rx="1"/>
    <rect x="2" y="13" width="9" height="9" rx="1"/>
    <rect x="13" y="13" width="9" height="9" rx="1"/>
  </svg>
);
