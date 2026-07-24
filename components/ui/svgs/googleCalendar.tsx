import type { SVGProps } from "react";

const GoogleCalendar = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 64 64" fill="none">
    <path d="M12 18h40v34a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V18Z" fill="#fff" />
    <path d="M12 18h40v10H12V18Z" fill="#4285F4" />
    <path d="M18 6h28a6 6 0 0 1 6 6v6H12v-6a6 6 0 0 1 6-6Z" fill="#1A73E8" />
    <path d="M12 28h10v30h-4a6 6 0 0 1-6-6V28Z" fill="#34A853" />
    <path d="M42 28h10v24a6 6 0 0 1-6 6h-4V28Z" fill="#FBBC04" />
    <path d="M20 58h24V28H20v30Z" fill="#fff" />
    <path
      d="M25.6 45.5h5.2v-14h-4.4l-4.2 2.9 2 3.2 1.4-.9v8.8Zm11.2.3c4.2 0 7-2.4 7-6.1 0-3.4-2.5-5.7-6.3-5.7-.5 0-1 .1-1.4.2l.3-2.7h6.5v-3.8h-10l-.9 9.6 2.7 1.3c.7-.5 1.4-.7 2.3-.7 1.2 0 2 .7 2 1.8s-.9 1.9-2.2 1.9c-1.4 0-2.6-.5-3.8-1.6l-2.4 3.2c1.6 1.7 3.8 2.6 6.2 2.6Z"
      fill="#3C4043"
    />
    <path d="M18 6h28a6 6 0 0 1 6 6v40a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6Z" stroke="#DADCE0" strokeWidth="2" />
  </svg>
);

export { GoogleCalendar };
