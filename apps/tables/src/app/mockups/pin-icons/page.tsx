"use client";

export default function PinIconsMockupPage() {
  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Focus/Pin Icon Mockups</h1>
        <p className="text-zinc-400 mb-8">20 animated icon variations for the Focus feature</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* 1. Classic Pin - Pulse */}
          <IconCard name="Classic Pin Pulse">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500 animate-pulse" fill="currentColor">
              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11V22H13V16H18V14L16 12Z"/>
            </svg>
          </IconCard>

          {/* 2. Target - Pulse Ring */}
          <IconCard name="Target Pulse">
            <div className="relative">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
              </svg>
              <div className="absolute inset-0 rounded-full border-2 border-orange-500 animate-ping opacity-75"/>
            </div>
          </IconCard>

          {/* 3. Star - Rotate */}
          <IconCard name="Star Spin">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500 animate-spin" style={{ animationDuration: '3s' }} fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
          </IconCard>

          {/* 4. Flame - Flicker */}
          <IconCard name="Flame Flicker">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500 animate-bounce" style={{ animationDuration: '0.5s' }} fill="currentColor">
              <path d="M12 23C16.1421 23 19.5 19.6421 19.5 15.5C19.5 14.1183 19.0869 12.8292 18.378 11.7492C17.9545 11.1162 17.4322 10.5453 16.8272 10.0553C16.3828 9.6951 15.5 9.5 15.5 10.5C15.5 11.5 14.5 12 14 12C13.5 12 13 11.5 13 11C13 10.0307 13.5 8 12 6C10.5 8 11 10 11 11C11 11.5 10.5 12 10 12C9.5 12 8.5 11.5 8.5 10.5C8.5 9.5 7.6172 9.6951 7.1728 10.0553C6.5678 10.5453 6.0455 11.1162 5.622 11.7492C4.9131 12.8292 4.5 14.1183 4.5 15.5C4.5 19.6421 7.8579 23 12 23Z"/>
            </svg>
          </IconCard>

          {/* 5. Sparkle - Twinkle */}
          <IconCard name="Sparkle Twinkle">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500" fill="currentColor">
              <style>{`
                @keyframes twinkle { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                .twinkle1 { animation: twinkle 1s ease-in-out infinite; }
                .twinkle2 { animation: twinkle 1s ease-in-out infinite 0.3s; }
                .twinkle3 { animation: twinkle 1s ease-in-out infinite 0.6s; }
              `}</style>
              <path className="twinkle1" d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"/>
              <path className="twinkle2" d="M19 15L19.5 17.5L22 18L19.5 18.5L19 21L18.5 18.5L16 18L18.5 17.5L19 15Z"/>
              <path className="twinkle3" d="M5 15L5.5 17.5L8 18L5.5 18.5L5 21L4.5 18.5L2 18L4.5 17.5L5 15Z"/>
            </svg>
          </IconCard>

          {/* 6. Bullseye - Ripple */}
          <IconCard name="Bullseye Ripple">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-10 h-10 rounded-full border-2 border-orange-500 animate-ping"/>
              <div className="absolute w-7 h-7 rounded-full border-2 border-orange-500 animate-ping" style={{ animationDelay: '0.2s' }}/>
              <div className="w-3 h-3 rounded-full bg-orange-500"/>
            </div>
          </IconCard>

          {/* 7. Lightning Bolt - Flash */}
          <IconCard name="Bolt Flash">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500" fill="currentColor">
              <style>{`@keyframes flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
              <path style={{ animation: 'flash 0.3s ease-in-out infinite' }} d="M13 2L4.5 13H11L10 22L18.5 11H12L13 2Z"/>
            </svg>
          </IconCard>

          {/* 8. Eye - Blink */}
          <IconCard name="Eye Blink">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2">
              <style>{`@keyframes blink { 0%, 90%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }`}</style>
              <g style={{ animation: 'blink 3s ease-in-out infinite', transformOrigin: 'center' }}>
                <path d="M1 12S5 4 12 4 23 12 23 12 19 20 12 20 1 12 1 12Z"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </g>
            </svg>
          </IconCard>

          {/* 9. Crosshair - Scan */}
          <IconCard name="Crosshair Scan">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2">
              <style>{`@keyframes scan { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }`}</style>
              <g style={{ animation: 'scan 1.5s ease-in-out infinite' }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="22" y1="12" x2="18" y2="12"/>
                <line x1="6" y1="12" x2="2" y2="12"/>
                <line x1="12" y1="6" x2="12" y2="2"/>
                <line x1="12" y1="22" x2="12" y2="18"/>
              </g>
            </svg>
          </IconCard>

          {/* 10. Pin Drop - Bounce */}
          <IconCard name="Pin Drop Bounce">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500 animate-bounce" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"/>
            </svg>
          </IconCard>

          {/* 11. Diamond - Shine */}
          <IconCard name="Diamond Shine">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500" fill="currentColor">
              <style>{`@keyframes shine { 0% { filter: brightness(1); } 50% { filter: brightness(1.5); } 100% { filter: brightness(1); } }`}</style>
              <path style={{ animation: 'shine 2s ease-in-out infinite' }} d="M12 2L2 9L12 22L22 9L12 2ZM12 5L18 9L12 18L6 9L12 5Z"/>
            </svg>
          </IconCard>

          {/* 12. Heart - Beat */}
          <IconCard name="Heart Beat">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500" fill="currentColor">
              <style>{`@keyframes heartbeat { 0%, 100% { transform: scale(1); } 14% { transform: scale(1.15); } 28% { transform: scale(1); } 42% { transform: scale(1.15); } 70% { transform: scale(1); } }`}</style>
              <path style={{ animation: 'heartbeat 1.5s ease-in-out infinite', transformOrigin: 'center' }} d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"/>
            </svg>
          </IconCard>

          {/* 13. Sun - Rays Rotate */}
          <IconCard name="Sun Rays">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500" fill="currentColor">
              <circle cx="12" cy="12" r="4"/>
              <g className="animate-spin" style={{ animationDuration: '8s', transformOrigin: 'center' }}>
                <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </g>
            </svg>
          </IconCard>

          {/* 14. Bell - Ring */}
          <IconCard name="Bell Ring">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500" fill="currentColor">
              <style>{`@keyframes ring { 0%, 100% { transform: rotate(0deg); } 10% { transform: rotate(15deg); } 20% { transform: rotate(-15deg); } 30% { transform: rotate(10deg); } 40% { transform: rotate(-10deg); } 50% { transform: rotate(0deg); } }`}</style>
              <path style={{ animation: 'ring 2s ease-in-out infinite', transformOrigin: 'top center' }} d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"/>
            </svg>
          </IconCard>

          {/* 15. Aperture - Spiral */}
          <IconCard name="Aperture Spiral">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500 animate-spin" style={{ animationDuration: '4s' }} fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="14.31" y1="8" x2="20.05" y2="17.94"/>
              <line x1="9.69" y1="8" x2="21.17" y2="8"/>
              <line x1="7.38" y1="12" x2="13.12" y2="2.06"/>
              <line x1="9.69" y1="16" x2="3.95" y2="6.06"/>
              <line x1="14.31" y1="16" x2="2.83" y2="16"/>
              <line x1="16.62" y1="12" x2="10.88" y2="21.94"/>
            </svg>
          </IconCard>

          {/* 16. Compass - Point */}
          <IconCard name="Compass Point">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2">
              <style>{`@keyframes compass { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(15deg); } 75% { transform: rotate(-15deg); } }`}</style>
              <circle cx="12" cy="12" r="10"/>
              <polygon style={{ animation: 'compass 2s ease-in-out infinite', transformOrigin: 'center' }} fill="currentColor" points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
          </IconCard>

          {/* 17. Crown - Glow */}
          <IconCard name="Crown Glow">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500" fill="currentColor">
              <style>{`@keyframes glow { 0%, 100% { filter: drop-shadow(0 0 2px rgba(249,115,22,0.5)); } 50% { filter: drop-shadow(0 0 8px rgba(249,115,22,0.9)); } }`}</style>
              <path style={{ animation: 'glow 2s ease-in-out infinite' }} d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.55 18.55 20 18 20H6C5.45 20 5 19.55 5 19V18H19V19Z"/>
            </svg>
          </IconCard>

          {/* 18. Hexagon - Morph */}
          <IconCard name="Hexagon Morph">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2">
              <style>{`@keyframes morph { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(0.9) rotate(30deg); } }`}</style>
              <path style={{ animation: 'morph 2s ease-in-out infinite', transformOrigin: 'center' }} d="M12 2L21.5 7V17L12 22L2.5 17V7L12 2Z"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </IconCard>

          {/* 19. Rocket - Launch */}
          <IconCard name="Rocket Launch">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500" fill="currentColor">
              <style>{`@keyframes launch { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }`}</style>
              <g style={{ animation: 'launch 1s ease-in-out infinite' }}>
                <path d="M12 2C12 2 7 7 7 12C7 14.76 8.5 17.25 10.5 18.5L9 22H15L13.5 18.5C15.5 17.25 17 14.76 17 12C17 7 12 2 12 2ZM12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14Z"/>
                <path className="animate-pulse" d="M7 12H4L6 15L7 12ZM17 12H20L18 15L17 12Z"/>
              </g>
            </svg>
          </IconCard>

          {/* 20. Atom - Orbit */}
          <IconCard name="Atom Orbit">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
              <ellipse cx="12" cy="12" rx="10" ry="4" className="animate-spin" style={{ animationDuration: '3s' }}/>
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" className="animate-spin" style={{ animationDuration: '3s', animationDelay: '0.5s' }}/>
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" className="animate-spin" style={{ animationDuration: '3s', animationDelay: '1s' }}/>
            </svg>
          </IconCard>
        </div>

        {/* PAIRED ICONS SECTION */}
        <h2 className="text-2xl font-bold text-white mt-16 mb-2">Pin / Unpin Pairs</h2>
        <p className="text-zinc-400 mb-8">10 icon pairs showing both focused and unfocused states</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Pair 1: Classic Pin */}
          <PairCard name="Classic Pin">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-orange-500" fill="currentColor">
              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11V22H13V16H18V14L16 12Z"/>
            </svg>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11V22H13V16H18V14L16 12Z"/>
            </svg>
          </PairCard>

          {/* Pair 2: Thumbtack Angled */}
          <PairCard name="Thumbtack">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-orange-500" fill="currentColor">
              <path d="M14 4V9C14 10.12 14.37 11.16 15 12H9C9.65 11.14 10 10.1 10 9V4H14ZM17 2H7C6.45 2 6 2.45 6 3S6.45 4 7 4V9C7 10.66 5.66 12 4 12V14H10.97V21C10.97 21.55 11.42 22 11.97 22H12C12.55 22 13 21.55 13 21V14H20V12C18.34 12 17 10.66 17 9V4C17.55 4 18 3.55 18 3S17.55 2 17 2Z"/>
            </svg>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 4V9C14 10.12 14.37 11.16 15 12H9C9.65 11.14 10 10.1 10 9V4H14ZM17 2H7C6.45 2 6 2.45 6 3S6.45 4 7 4V9C7 10.66 5.66 12 4 12V14H10.97V21C10.97 21.55 11.42 22 11.97 22H12C12.55 22 13 21.55 13 21V14H20V12C18.34 12 17 10.66 17 9V4C17.55 4 18 3.55 18 3S17.55 2 17 2Z"/>
            </svg>
          </PairCard>

          {/* Pair 3: Star */}
          <PairCard name="Star">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-orange-500" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
          </PairCard>

          {/* Pair 4: Flame */}
          <PairCard name="Flame">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-orange-500" fill="currentColor">
              <path d="M12 23C16.14 23 19.5 19.64 19.5 15.5C19.5 14.12 19.09 12.83 18.38 11.75C17.95 11.12 17.43 10.55 16.83 10.06C16.38 9.7 15.5 9.5 15.5 10.5C15.5 11.5 14.5 12 14 12C13.5 12 13 11.5 13 11C13 10.03 13.5 8 12 6C10.5 8 11 10 11 11C11 11.5 10.5 12 10 12C9.5 12 8.5 11.5 8.5 10.5C8.5 9.5 7.62 9.7 7.17 10.06C6.57 10.55 6.05 11.12 5.62 11.75C4.91 12.83 4.5 14.12 4.5 15.5C4.5 19.64 7.86 23 12 23Z"/>
            </svg>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 23C16.14 23 19.5 19.64 19.5 15.5C19.5 14.12 19.09 12.83 18.38 11.75C17.95 11.12 17.43 10.55 16.83 10.06C16.38 9.7 15.5 9.5 15.5 10.5C15.5 11.5 14.5 12 14 12C13.5 12 13 11.5 13 11C13 10.03 13.5 8 12 6C10.5 8 11 10 11 11C11 11.5 10.5 12 10 12C9.5 12 8.5 11.5 8.5 10.5C8.5 9.5 7.62 9.7 7.17 10.06C6.57 10.55 6.05 11.12 5.62 11.75C4.91 12.83 4.5 14.12 4.5 15.5C4.5 19.64 7.86 23 12 23Z"/>
            </svg>
          </PairCard>

          {/* Pair 5: Target */}
          <PairCard name="Target">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
            </svg>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </PairCard>

          {/* Pair 6: Bookmark */}
          <PairCard name="Bookmark">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-orange-500" fill="currentColor">
              <path d="M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3Z"/>
            </svg>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21L12 16L5 21V5C5 3.9 5.9 3 7 3H17C18.1 3 19 3.9 19 5V21Z"/>
            </svg>
          </PairCard>

          {/* Pair 7: Heart */}
          <PairCard name="Heart">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-orange-500" fill="currentColor">
              <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"/>
            </svg>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61C20.33 4.1 19.72 3.69 19.05 3.42C18.38 3.15 17.67 3 16.95 3C16.23 3 15.52 3.15 14.85 3.42C14.18 3.69 13.57 4.1 13.06 4.61L12 5.67L10.94 4.61C9.9 3.57 8.5 3 7.05 3C5.6 3 4.2 3.57 3.16 4.61C2.12 5.65 1.55 7.05 1.55 8.5C1.55 9.95 2.12 11.35 3.16 12.39L12 21.23L20.84 12.39C21.35 11.88 21.76 11.27 22.03 10.6C22.3 9.93 22.45 9.22 22.45 8.5C22.45 7.78 22.3 7.07 22.03 6.4C21.76 5.73 21.35 5.12 20.84 4.61Z"/>
            </svg>
          </PairCard>

          {/* Pair 8: Lightning */}
          <PairCard name="Lightning">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-orange-500" fill="currentColor">
              <path d="M13 2L4.5 13H11L10 22L18.5 11H12L13 2Z"/>
            </svg>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L4.5 13H11L10 22L18.5 11H12L13 2Z"/>
            </svg>
          </PairCard>

          {/* Pair 9: Eye */}
          <PairCard name="Eye">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-orange-500" fill="currentColor">
              <path d="M12 4C7 4 2.73 7.11 1 11.5C2.73 15.89 7 19 12 19S21.27 15.89 23 11.5C21.27 7.11 17 4 12 4ZM12 16.5C9.24 16.5 7 14.26 7 11.5S9.24 6.5 12 6.5 17 8.74 17 11.5 14.76 16.5 12 16.5ZM12 8.5C10.34 8.5 9 9.84 9 11.5S10.34 14.5 12 14.5 15 13.16 15 11.5 13.66 8.5 12 8.5Z"/>
            </svg>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12S5 4 12 4 23 12 23 12 19 20 12 20 1 12 1 12Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </PairCard>

          {/* Pair 10: Circle Dot */}
          <PairCard name="Focus Dot">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="4" fill="currentColor"/>
            </svg>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="1"/>
            </svg>
          </PairCard>
        </div>

        <p className="text-zinc-500 text-sm mt-8 text-center">
          Click on any icon you like and let me know which one to use for Focus Mode
        </p>
      </div>
    </div>
  );
}

function IconCard({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-colors cursor-pointer">
      <div className="h-12 w-12 flex items-center justify-center">
        {children}
      </div>
      <span className="text-xs text-zinc-400 text-center">{name}</span>
    </div>
  );
}

function PairCard({ name, children }: { name: string; children: React.ReactNode }) {
  const childArray = Array.isArray(children) ? children : [children];
  return (
    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <div className="h-10 w-10 flex items-center justify-center">
            {childArray[0]}
          </div>
          <span className="text-[10px] text-orange-500">Focused</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="h-10 w-10 flex items-center justify-center">
            {childArray[1]}
          </div>
          <span className="text-[10px] text-zinc-500">Unfocused</span>
        </div>
      </div>
      <span className="text-xs text-zinc-400 text-center">{name}</span>
    </div>
  );
}
