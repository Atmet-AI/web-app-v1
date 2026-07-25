import type { SVGProps } from "react";

const Outlook = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 256 256" aria-hidden="true" {...props}>
    <defs>
      <linearGradient id="outlook-back" x1="112" x2="216" y1="36" y2="216">
        <stop stopColor="#35B8F1" />
        <stop offset="1" stopColor="#0078D4" />
      </linearGradient>
      <linearGradient id="outlook-front" x1="31" x2="132" y1="68" y2="187">
        <stop stopColor="#0A86D9" />
        <stop offset="1" stopColor="#064E9E" />
      </linearGradient>
    </defs>
    <rect width="148" height="148" x="86" y="50" fill="url(#outlook-back)" rx="18" />
    <path fill="#50D9FF" d="M112 76h96v38h-96z" />
    <path fill="#0078D4" d="M112 114h96v42h-96z" />
    <path fill="#005A9E" d="M112 156h96v22c0 11-9 20-20 20h-76z" />
    <path fill="#fff" d="m208 86-54 48 54 44z" opacity=".95" />
    <path fill="#fff" d="m112 88 54 46-54 44z" opacity=".72" />
    <path fill="#004B8D" d="M36 68 126 50v156l-90-18z" opacity=".35" />
    <rect width="112" height="112" x="24" y="72" fill="url(#outlook-front)" rx="16" />
    <path
      fill="#fff"
      d="M80 154c-23 0-38-17-38-42 0-26 16-43 39-43s38 17 38 42c0 26-16 43-39 43Zm1-18c13 0 20-10 20-25s-8-25-20-25c-13 0-20 10-20 25s8 25 20 25Z"
    />
  </svg>
);

export { Outlook };
