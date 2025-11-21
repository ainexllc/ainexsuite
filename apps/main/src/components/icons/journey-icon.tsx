export const JourneyIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 140 140" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
      </filter>
    </defs>

    <rect width="140" height="140" fill="#15101e" />

    <g transform="translate(70, 70)">
      <circle cx="0" cy="0" r="38" fill="#a65af2" filter="url(#glow-purple)" opacity="0.6" />

      <circle cx="0" cy="0" r="42" fill="#a65af2" />

      <g transform="translate(-18, -20) scale(1.3)" fill="#ffffff">
        <path d="M13.5,2 L13.5,6 L2,6 L2,16 L13.5,16 L13.5,20 L16.5,20 L16.5,16 L26,16 L26,6 L16.5,6 L16.5,2 L13.5,2 Z M16.5,7.5 L24.5,11 L16.5,14.5 L16.5,7.5 Z M13.5,7.5 L13.5,14.5 L5.5,11 L13.5,7.5 Z"/>
        <rect x="13" y="2" width="4" height="24" />
        <path d="M16 6 L26 11 L16 16 V6 Z" />
        <path d="M14 16 L4 11 L14 6 V16 Z" />
      </g>
    </g>
  </svg>
);
