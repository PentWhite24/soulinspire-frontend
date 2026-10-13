const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, "aria-hidden": true };

export const SearchIcon = () => (<svg {...base}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>);
export const HeartIcon = () => (<svg {...base}><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" /></svg>);
export const BagIcon = () => (<svg {...base}><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></svg>);
export const CheckIcon = () => (<svg {...base} width="28" height="28" strokeWidth={2.5}><path d="M5 12l5 5 9-10" /></svg>);

export const Logo = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="15" fill="var(--deep)" />
    <path d="M16 7c4 4 4 10 0 18-4-8-4-14 0-18z" fill="var(--accent)" />
    <path d="M8 18c3 0 6 2 8 7-4 0-7-2-8-7zM24 18c-3 0-6 2-8 7 4 0 7-2 8-7z" fill="var(--deep-ink)" />
  </svg>
);
