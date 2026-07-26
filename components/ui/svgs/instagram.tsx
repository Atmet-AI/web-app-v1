import type { SVGProps } from "react";

const Instagram = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="instagram-glow" cx="0" cy="0" r="1" gradientTransform="matrix(5.5 -25 28 6.2 16 58)" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFD600" />
        <stop offset=".48" stopColor="#FF7A00" />
        <stop offset="1" stopColor="#FF0169" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="instagram-blue" cx="0" cy="0" r="1" gradientTransform="matrix(-18 -8 8 -18 56 10)" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7638FA" />
        <stop offset="1" stopColor="#7638FA" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="instagram-base" x1="8" x2="56" y1="56" y2="8" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFD600" />
        <stop offset=".28" stopColor="#FF7A00" />
        <stop offset=".48" stopColor="#FF0169" />
        <stop offset=".75" stopColor="#D300C5" />
        <stop offset="1" stopColor="#7638FA" />
      </linearGradient>
    </defs>
    <rect width="56" height="56" x="4" y="4" fill="url(#instagram-base)" rx="16" />
    <rect width="56" height="56" x="4" y="4" fill="url(#instagram-glow)" rx="16" />
    <rect width="56" height="56" x="4" y="4" fill="url(#instagram-blue)" rx="16" />
    <path
      d="M19.5 12h25C48.6 12 52 15.4 52 19.5v25c0 4.1-3.4 7.5-7.5 7.5h-25c-4.1 0-7.5-3.4-7.5-7.5v-25c0-4.1 3.4-7.5 7.5-7.5Z"
      fill="none"
      stroke="white"
      strokeWidth="4"
    />
    <circle cx="32" cy="32" r="10" fill="none" stroke="white" strokeWidth="4" />
    <circle cx="43" cy="21" r="3.2" fill="white" />
  </svg>
);

export { Instagram };
