import type { SVGProps } from "react";

const Outlook = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 256 256" aria-hidden="true" {...props}>
    <defs>
      <linearGradient id="outlook-mail-back" x1="134" x2="224" y1="40" y2="214">
        <stop stopColor="#28A8EA" />
        <stop offset="1" stopColor="#0078D4" />
      </linearGradient>
      <linearGradient id="outlook-o-front" x1="24" x2="136" y1="72" y2="184">
        <stop stopColor="#0F78D4" />
        <stop offset="1" stopColor="#106EBE" />
      </linearGradient>
    </defs>
    <rect width="142" height="142" x="92" y="56" fill="url(#outlook-mail-back)" rx="16" />
    <path fill="#50D9FF" d="M116 78h94v40h-94z" />
    <path fill="#0078D4" d="M116 118h94v38h-94z" />
    <path fill="#005A9E" d="M116 156h94v21c0 12-9 21-21 21h-73z" />
    <path fill="#fff" d="m210 86-55 48 55 44z" opacity=".96" />
    <path fill="#fff" d="m116 88 55 46-55 44z" opacity=".72" />
    <path fill="#064E9E" d="M36 72 130 54v148L36 184z" opacity=".36" />
    <rect width="112" height="112" x="24" y="72" fill="url(#outlook-o-front)" rx="14" />
    <path
      fill="#fff"
      d="M80 154c-23 0-38-17-38-42s15-42 38-42 38 17 38 42-15 42-38 42Zm0-18c13 0 21-10 21-24s-8-24-21-24-21 10-21 24 8 24 21 24Z"
    />
  </svg>
);

export { Outlook };
