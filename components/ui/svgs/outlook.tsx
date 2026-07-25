import type { SVGProps } from "react";

const Outlook = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
    <path fill="#0a5eb8" d="M4 12.5 21 9v30L4 35.5z" />
    <path fill="#0078d4" d="M20 12h20a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H20z" />
    <path fill="#28a8ea" d="M27 17h16v7H27z" />
    <path fill="#50d9ff" d="M27 24h16v7H27z" />
    <path fill="#0a5eb8" d="M27 31h16v3a4 4 0 0 1-4 4H27z" />
    <path fill="#fff" d="M43.3 17.6 33.9 25l9.4 7.4V17.6z" opacity=".92" />
    <path fill="#fff" d="m27 18 8.9 7L27 32z" opacity=".7" />
    <rect width="22" height="22" x="4" y="13" fill="#106ebe" rx="2.5" />
    <path
      fill="#fff"
      d="M15.2 30.5c-3.5 0-5.9-2.6-5.9-6.1 0-3.6 2.4-6.2 6-6.2s5.9 2.6 5.9 6.1c0 3.6-2.4 6.2-6 6.2Zm.1-2.4c1.8 0 2.9-1.5 2.9-3.7 0-2.3-1.1-3.8-2.9-3.8s-3 1.5-3 3.8c0 2.2 1.2 3.7 3 3.7Z"
    />
  </svg>
);

export { Outlook };
