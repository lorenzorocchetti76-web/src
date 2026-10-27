export const Logo = ({ className = "h-8 w-8" }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <circle cx="32" cy="32" r="17" fill="none" stroke="#F4F7FA" strokeWidth="3" />
    <path d="M15 32h34" stroke="#FF7138" strokeWidth="3" strokeLinecap="round" />
    <path d="M32 15a26 26 0 0 1 0 34" fill="none" stroke="#66D9EF" strokeWidth="3" />
    <circle cx="49" cy="32" r="3.5" fill="#FF4B45" />
  </svg>
);
