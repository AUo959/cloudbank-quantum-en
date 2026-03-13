interface AuroraLogoProps {
  size?: number;
  className?: string;
}

export function AuroraLogo({ size = 32, className = '' }: AuroraLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Aurora Cloudbank"
      className={className}
    >
      {/* Central star / constellation hub */}
      <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.9" />
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
      
      {/* Constellation ring */}
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="0.5" opacity="0.2" strokeDasharray="2 4" />
      
      {/* Six constellation nodes at hex positions */}
      <circle cx="24" cy="8" r="1.8" fill="currentColor" opacity="0.7" />
      <circle cx="37.9" cy="16" r="1.8" fill="currentColor" opacity="0.7" />
      <circle cx="37.9" cy="32" r="1.8" fill="currentColor" opacity="0.7" />
      <circle cx="24" cy="40" r="1.8" fill="currentColor" opacity="0.7" />
      <circle cx="10.1" cy="32" r="1.8" fill="currentColor" opacity="0.7" />
      <circle cx="10.1" cy="16" r="1.8" fill="currentColor" opacity="0.7" />
      
      {/* Constellation connection lines from center to nodes */}
      <line x1="24" y1="24" x2="24" y2="8" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      <line x1="24" y1="24" x2="37.9" y2="16" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      <line x1="24" y1="24" x2="37.9" y2="32" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      <line x1="24" y1="24" x2="24" y2="40" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      <line x1="24" y1="24" x2="10.1" y2="32" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      <line x1="24" y1="24" x2="10.1" y2="16" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      
      {/* Outer hexagonal connection ring */}
      <path
        d="M24 8 L37.9 16 L37.9 32 L24 40 L10.1 32 L10.1 16 Z"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.15"
        fill="none"
      />
      
      {/* Aurora arcs - the distinctive element */}
      <path
        d="M8 24 C8 14 14 6 24 6"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M40 24 C40 34 34 42 24 42"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
