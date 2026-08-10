import type { SVGProps } from "react";

type I = SVGProps<SVGSVGElement>;
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Brand mark: a 2x2 tile grid, echoing 2048 / Sudoku boards. */
export function BrandMark(props: I) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="2.2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2.2" opacity="0.7" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2.2" opacity="0.7" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.2" />
    </svg>
  );
}

export const Play = (p: I) => (
  <svg {...base} {...p}><path d="M6 4.5v15l13-7.5-13-7.5Z" fill="currentColor" stroke="none" /></svg>
);
export const ArrowRight = (p: I) => (
  <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const Github = (p: I) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.22-3.37-1.22-.46-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 2.5-.34c.85 0 1.71.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
  </svg>
);
export const Bolt = (p: I) => (
  <svg {...base} {...p}><path d="M13 2 4.5 13.5H11l-1 8.5 9-12h-6.5L13 2Z" /></svg>
);
export const Layers = (p: I) => (
  <svg {...base} {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 16 9 5 9-5" /></svg>
);
export const Plug = (p: I) => (
  <svg {...base} {...p}><path d="M9 2v6M15 2v6" /><path d="M6 8h12v3a6 6 0 0 1-12 0V8Z" /><path d="M12 17v5" /></svg>
);
export const Code = (p: I) => (
  <svg {...base} {...p}><path d="m8 6-6 6 6 6M16 6l6 6-6 6" /></svg>
);
export const Sparkle = (p: I) => (
  <svg {...base} {...p}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6.3 6.3l3.4 3.4M14.3 14.3l3.4 3.4M17.7 6.3l-3.4 3.4M9.7 14.3l-3.4 3.4" /></svg>
);
export const Check = (p: I) => (
  <svg {...base} {...p}><path d="m4 12 5 5L20 6" /></svg>
);
export const Clock = (p: I) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const Puzzle = (p: I) => (
  <svg {...base} {...p}><path d="M9 3h4a1 1 0 0 1 1 1v1.5a1.5 1.5 0 0 0 3 0V4a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1.5a1.5 1.5 0 0 0 0 3H20a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1.5a1.5 1.5 0 0 0-3 0V20a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-4a1 1 0 0 0-1-1H4.5a1.5 1.5 0 0 1 0-3H6a1 1 0 0 0 1-1V4a1 1 0 0 1 1-1Z" /></svg>
);
export const Server = (p: I) => (
  <svg {...base} {...p}><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /><path d="M7 7.5h.01M7 16.5h.01" /></svg>
);
export const Book = (p: I) => (
  <svg {...base} {...p}><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5Z" /><path d="M18 17H6a2 2 0 0 0-2 2" /></svg>
);
export const Dice = (p: I) => (
  <svg {...base} {...p}><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M8 8h.01M16 8h.01M8 16h.01M16 16h.01M12 12h.01" /></svg>
);
