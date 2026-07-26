import type { SVGProps } from "react";

const GoogleCalendar = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path fill="#fff" d="M13 6h22l7 7v27a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4h3Z" />
    <path fill="#4285F4" d="M6 17h36v-4l-7-7H10a4 4 0 0 0-4 4v7Z" />
    <path fill="#34A853" d="M6 17h9v27h-5a4 4 0 0 1-4-4V17Z" />
    <path fill="#FBBC04" d="M33 17h9v23a4 4 0 0 1-4 4h-5V17Z" />
    <path fill="#EA4335" d="M15 6h20v11H15V6Z" />
    <path fill="#fff" d="M15 17h18v27H15V17Z" />
    <path
      fill="#3C4043"
      d="M21.2 34.8h2.9V22.6h-2.5l-3.5 2.5 1.3 2.1 1.8-1.2v8.8Zm8.6.3c3.4 0 5.6-1.9 5.6-4.7 0-2.6-1.9-4.3-4.7-4.3-.5 0-1 .1-1.4.2l.2-1.4h5.2v-2.5h-7.5l-.7 6 1.8.9c.6-.4 1.2-.6 2-.6 1.3 0 2.2.7 2.2 1.8 0 1.2-.9 1.9-2.3 1.9-1.2 0-2.3-.4-3.2-1.2l-1.5 2c1.1 1.2 2.6 1.9 4.3 1.9Z"
    />
    <path fill="#185ABC" d="m35 6 7 7h-7V6Z" />
  </svg>
);

export { GoogleCalendar };
