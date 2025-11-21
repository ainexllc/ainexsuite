export const WorkflowIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="white" className={className}>
    <circle cx="12" cy="12" r="3.5" fill="white"/>
    <path d="M12 8.5V5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <circle cx="12" cy="3" r="2.5" fill="white"/>
    <path d="M15.5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <circle cx="21" cy="12" r="2.5" fill="white"/>
    <path d="M12 15.5V19" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <circle cx="12" cy="21" r="2.5" fill="white"/>
    <path d="M8.5 12H5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <circle cx="3" cy="12" r="2.5" fill="white"/>
  </svg>
);
