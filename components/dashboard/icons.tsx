type IconProps = { className?: string };
const base = "shrink-0";

export function OverviewIcon({ className = "" }: IconProps) {
  return (
    <svg className={`${base} ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}
export function HeartIcon({ className = "" }: IconProps) {
  return (
    <svg className={`${base} ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}
export function OfferIcon({ className = "" }: IconProps) {
  return (
    <svg className={`${base} ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.59 13.41 12 22l-9-9V3h10l7.59 7.59a2 2 0 0 1 0 2.82Z" /><circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  );
}
export function CalendarIcon({ className = "" }: IconProps) {
  return (
    <svg className={`${base} ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18" /><path d="M8 2.5v4" /><path d="M16 2.5v4" />
    </svg>
  );
}
export function BookmarkIcon({ className = "" }: IconProps) {
  return (
    <svg className={`${base} ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 3.5h12v18l-6-4-6 4Z" />
    </svg>
  );
}
export function DocumentIcon({ className = "" }: IconProps) {
  return (
    <svg className={`${base} ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 2.5h7l5 5v14h-12z" /><path d="M14 2.5v5h5" /><path d="m9.5 14 2 2 3.5-4" />
    </svg>
  );
}
export function BuildingIcon({ className = "" }: IconProps) {
  return (
    <svg className={`${base} ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 21V4.5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1V21" /><path d="M15 10.5h4a1 1 0 0 1 1 1V21" />
      <path d="M4 21h16" /><path d="M8 8h2" /><path d="M8 12h2" /><path d="M8 16h2" />
    </svg>
  );
}
export function HandshakeIcon({ className = "" }: IconProps) {
  return (
    <svg className={`${base} ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m11 12 2.5 2.5a1.5 1.5 0 0 0 2.12-2.12L13 9.75" /><path d="M8.5 9.5 11 12" />
      <path d="M2 8.5 6 5h3.5L13 8.5" /><path d="M22 8.5 18 5h-3.5" /><path d="m2 8.5 4.5 6L9 17l2 2" />
      <path d="m22 8.5-4.5 6" />
    </svg>
  );
}
export function SparkleIcon({ className = "" }: IconProps) {
  return (
    <svg className={`${base} ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="m6.5 6.5 2 2M15.5 15.5l2 2M6.5 17.5l2-2M15.5 8.5l2-2" />
    </svg>
  );
}
export function ShieldIcon({ className = "" }: IconProps) {
  return (
    <svg className={`${base} ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z" />
    </svg>
  );
}
export function WalletIcon({ className = "" }: IconProps) {
  return (
    <svg className={`${base} ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M16.5 12.5h2" /><path d="M3 9.5h18" />
    </svg>
  );
}
export function UserIcon({ className = "" }: IconProps) {
  return (
    <svg className={`${base} ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="3.5" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}
export function LogoutIcon({ className = "" }: IconProps) {
  return (
    <svg className={`${base} ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
    </svg>
  );
}
export function MenuIcon({ className = "" }: IconProps) {
  return (
    <svg className={`${base} ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" />
    </svg>
  );
}
export function CloseIcon({ className = "" }: IconProps) {
  return (
    <svg className={`${base} ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
export function ChevronRightIcon({ className = "" }: IconProps) {
  return (
    <svg className={`${base} ${className}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
