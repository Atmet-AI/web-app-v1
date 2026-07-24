import type { SVGProps } from "react";

const Instagram = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="18" fill="#E4405F" />
    <path
      d="M20.5 31.9c0-6.1 5-11.1 11.1-11.1h.8c6.1 0 11.1 5 11.1 11.1v.8c0 6.1-5 11.1-11.1 11.1h-.8c-6.1 0-11.1-5-11.1-11.1v-.8Z"
      fill="#FCAF45"
      opacity=".95"
    />
    <path
      d="M10 24.6C10 16.5 16.5 10 24.6 10h14.8C47.5 10 54 16.5 54 24.6v14.8C54 47.5 47.5 54 39.4 54H24.6C16.5 54 10 47.5 10 39.4V24.6Z"
      fill="none"
      stroke="white"
      strokeWidth="4"
    />
    <circle cx="32" cy="32" r="9" fill="none" stroke="white" strokeWidth="4" />
    <circle cx="42.5" cy="21.5" r="3" fill="white" />
  </svg>
);

export { Instagram };
