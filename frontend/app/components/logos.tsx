"use client";

// Logo Option 1: Geometric "B" with network nodes
export const LogoNetwork = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F0B90B" />
        <stop offset="50%" stopColor="#FFD93D" />
        <stop offset="100%" stopColor="#F0B90B" />
      </linearGradient>
      <filter id="glow1" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Network lines */}
    <path d="M12 12 L24 8 L36 12 L38 24 L36 36 L24 40 L12 36 L10 24 Z"
          stroke="url(#goldGrad1)" strokeWidth="1.5" fill="none" opacity="0.4"/>
    {/* Inner hexagon */}
    <path d="M16 16 L24 13 L32 16 L34 24 L32 32 L24 35 L16 32 L14 24 Z"
          stroke="url(#goldGrad1)" strokeWidth="2" fill="none" filter="url(#glow1)"/>
    {/* B letter stylized */}
    <path d="M20 18 L20 30 M20 18 L27 18 Q30 18 30 21 Q30 24 27 24 L20 24 M20 24 L28 24 Q32 24 32 27.5 Q32 30 28 30 L20 30"
          stroke="url(#goldGrad1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#glow1)"/>
    {/* Corner nodes */}
    <circle cx="12" cy="12" r="2" fill="#F0B90B"/>
    <circle cx="36" cy="12" r="2" fill="#F0B90B"/>
    <circle cx="36" cy="36" r="2" fill="#F0B90B"/>
    <circle cx="12" cy="36" r="2" fill="#F0B90B"/>
  </svg>
);

// Logo Option 2: VPN Tunnel Portal
export const LogoTunnel = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F0B90B" />
        <stop offset="100%" stopColor="#C49A0A" />
      </linearGradient>
      <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Outer ring */}
    <circle cx="24" cy="24" r="20" stroke="url(#goldGrad2)" strokeWidth="2" fill="none" opacity="0.3"/>
    {/* Middle ring */}
    <circle cx="24" cy="24" r="14" stroke="url(#goldGrad2)" strokeWidth="2" fill="none" opacity="0.5"/>
    {/* Inner ring */}
    <circle cx="24" cy="24" r="8" stroke="url(#goldGrad2)" strokeWidth="2" fill="none" filter="url(#glow2)"/>
    {/* Center dot - the "exit" */}
    <circle cx="24" cy="24" r="3" fill="#F0B90B" filter="url(#glow2)"/>
    {/* Speed lines */}
    <path d="M4 24 L10 24" stroke="#F0B90B" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <path d="M38 24 L44 24" stroke="#F0B90B" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <path d="M24 4 L24 10" stroke="#F0B90B" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <path d="M24 38 L24 44" stroke="#F0B90B" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

// Logo Option 3: Crypto-style Lock (fits BABLO name)
export const LogoCrypto = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD93D" />
        <stop offset="50%" stopColor="#F0B90B" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
      <filter id="glow3" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Hexagon background */}
    <path d="M24 4 L42 14 L42 34 L24 44 L6 34 L6 14 Z"
          stroke="url(#goldGrad3)" strokeWidth="2" fill="none" filter="url(#glow3)"/>
    {/* Inner hexagon */}
    <path d="M24 12 L34 18 L34 30 L24 36 L14 30 L14 18 Z"
          stroke="url(#goldGrad3)" strokeWidth="1.5" fill="rgba(240, 185, 11, 0.1)"/>
    {/* Lock body */}
    <rect x="18" y="22" width="12" height="10" rx="2" stroke="#F0B90B" strokeWidth="2" fill="none"/>
    {/* Lock shackle */}
    <path d="M20 22 L20 18 Q20 14 24 14 Q28 14 28 18 L28 22"
          stroke="#F0B90B" strokeWidth="2" fill="none" strokeLinecap="round"/>
    {/* Keyhole */}
    <circle cx="24" cy="26" r="1.5" fill="#F0B90B"/>
    <path d="M24 27 L24 29" stroke="#F0B90B" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Logo Option 4: Dynamic Shield with Data Flow
export const LogoShieldFlow = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD93D" />
        <stop offset="100%" stopColor="#F0B90B" />
      </linearGradient>
      <filter id="glow4" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Modern shield shape */}
    <path d="M24 4 L40 10 L40 22 Q40 36 24 44 Q8 36 8 22 L8 10 Z"
          stroke="url(#goldGrad4)" strokeWidth="2.5" fill="none" filter="url(#glow4)"/>
    {/* Data flow lines inside */}
    <path d="M16 18 L20 22 L16 26" stroke="#F0B90B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M32 18 L28 22 L32 26" stroke="#F0B90B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Center connection */}
    <circle cx="24" cy="22" r="3" stroke="#F0B90B" strokeWidth="2" fill="none"/>
    <circle cx="24" cy="22" r="1" fill="#F0B90B"/>
    {/* Bottom indicator */}
    <path d="M20 32 L24 36 L28 32" stroke="#F0B90B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7"/>
  </svg>
);

// Logo Option 5: Minimalist Abstract "B"
export const LogoMinimalB = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGrad5" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD93D" />
        <stop offset="50%" stopColor="#F0B90B" />
        <stop offset="100%" stopColor="#D4A00A" />
      </linearGradient>
      <filter id="glow5" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Rounded square background */}
    <rect x="6" y="6" width="36" height="36" rx="10" stroke="url(#goldGrad5)" strokeWidth="2" fill="rgba(240, 185, 11, 0.08)"/>
    {/* Stylized B made of bars */}
    <rect x="14" y="12" width="4" height="24" rx="2" fill="url(#goldGrad5)" filter="url(#glow5)"/>
    <rect x="18" y="12" width="12" height="4" rx="2" fill="url(#goldGrad5)"/>
    <rect x="18" y="22" width="14" height="4" rx="2" fill="url(#goldGrad5)"/>
    <rect x="18" y="32" width="12" height="4" rx="2" fill="url(#goldGrad5)"/>
    {/* Right curves represented as circles */}
    <path d="M30 12 Q36 12 36 18 Q36 22 30 22" stroke="url(#goldGrad5)" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="M32 26 Q40 26 40 30 Q40 36 32 36" stroke="url(#goldGrad5)" strokeWidth="4" fill="none" strokeLinecap="round"/>
  </svg>
);

// Logo Option 6: Infinity VPN (continuous protection)
export const LogoInfinity = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGrad6" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD93D" />
        <stop offset="100%" stopColor="#F0B90B" />
      </linearGradient>
      <filter id="glow6" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Outer circle */}
    <circle cx="24" cy="24" r="20" stroke="url(#goldGrad6)" strokeWidth="2" fill="none" opacity="0.3"/>
    {/* Infinity symbol */}
    <path d="M14 24 Q14 16 20 16 Q26 16 24 24 Q22 32 28 32 Q34 32 34 24 Q34 16 28 16 Q22 16 24 24 Q26 32 20 32 Q14 32 14 24"
          stroke="url(#goldGrad6)" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#glow6)"/>
    {/* Center dot */}
    <circle cx="24" cy="24" r="2" fill="#F0B90B"/>
  </svg>
);
