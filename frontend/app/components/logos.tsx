"use client";

// Logo 1: Simple stylized "B"
export const LogoB = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="40" height="40" rx="12" fill="rgba(240, 185, 11, 0.15)"/>
    <path
      d="M16 12V36M16 12H28C32.4183 12 36 15.5817 36 20C36 22.5 34.5 24 32 24M16 24H30C34.4183 24 38 27.5817 38 32C38 34.5 35.5 36 32 36H16M16 24V12"
      stroke="#F0B90B"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Logo 2: Monogram "BV"
export const LogoBV = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="40" height="40" rx="12" fill="rgba(240, 185, 11, 0.15)"/>
    <path
      d="M12 14L20 34L28 14"
      stroke="#F0B90B"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M28 14L36 34"
      stroke="#F0B90B"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Logo 3: Simple connection dot
export const LogoDot = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="40" height="40" rx="12" fill="rgba(240, 185, 11, 0.15)"/>
    <circle cx="24" cy="24" r="8" fill="#F0B90B"/>
    <circle cx="24" cy="24" r="14" stroke="#F0B90B" strokeWidth="2.5" strokeDasharray="4 4"/>
  </svg>
);

// Logo 4: Key minimal
export const LogoKey = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="40" height="40" rx="12" fill="rgba(240, 185, 11, 0.15)"/>
    <circle cx="18" cy="24" r="7" stroke="#F0B90B" strokeWidth="3"/>
    <path d="M24 24H38M32 20V24M36 20V24" stroke="#F0B90B" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

// Logo 5: Arrow/bolt
export const LogoBolt = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="40" height="40" rx="12" fill="rgba(240, 185, 11, 0.15)"/>
    <path
      d="M26 10L14 26H24L22 38L34 22H24L26 10Z"
      fill="#F0B90B"
    />
  </svg>
);

// Logo 6: Shield outline only
export const LogoShield = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="40" height="40" rx="12" fill="rgba(240, 185, 11, 0.15)"/>
    <path
      d="M24 10L36 14V24C36 30 31 36 24 38C17 36 12 30 12 24V14L24 10Z"
      stroke="#F0B90B"
      strokeWidth="3"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Logo 7: Lock simple
export const LogoLock = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="40" height="40" rx="12" fill="rgba(240, 185, 11, 0.15)"/>
    <rect x="14" y="20" width="20" height="16" rx="3" stroke="#F0B90B" strokeWidth="3"/>
    <path d="M18 20V16C18 12.6863 20.6863 10 24 10C27.3137 10 30 12.6863 30 16V20" stroke="#F0B90B" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="24" cy="28" r="2" fill="#F0B90B"/>
  </svg>
);

// Logo 8: Two brackets
export const LogoBrackets = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="40" height="40" rx="12" fill="rgba(240, 185, 11, 0.15)"/>
    <path d="M18 12L10 24L18 36" stroke="#F0B90B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30 12L38 24L30 36" stroke="#F0B90B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// For backwards compatibility
export const LogoNetwork = LogoB;
export const LogoTunnel = LogoDot;
export const LogoCrypto = LogoLock;
export const LogoShieldFlow = LogoShield;
export const LogoMinimalB = LogoBV;
export const LogoInfinity = LogoBrackets;
