import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const interHeading = Inter({ subsets: ["latin"], variable: "--font-heading" });
const interMono = Inter({ subsets: ["latin"], variable: "--font-mono" });

const appUrl = "https://atmetai.com";
const faviconUrl = "/Atmet%20Logos/Atmet%20Light%20mode.svg";
const previewImageUrl = "/Preview%20Image%20Link.png";
const appDescription =
  "Atmet connects your team's tools into one permission-aware AI workspace for sourced answers, agents, and automations.";

export const metadata: Metadata = {
  title: "Atmet | One AI workspace for every tool",
  description: appDescription,
  metadataBase: new URL(appUrl),
  alternates: {
    canonical: appUrl,
  },
  icons: {
    icon: [{ url: faviconUrl, type: "image/svg+xml" }],
    shortcut: [{ url: faviconUrl, type: "image/svg+xml" }],
    apple: [{ url: faviconUrl, type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Atmet | One AI workspace for every tool",
    description: appDescription,
    url: appUrl,
    siteName: "Atmet",
    images: [
      {
        url: previewImageUrl,
        width: 1200,
        height: 630,
        alt: "Atmet",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atmet | One AI workspace for every tool",
    description: appDescription,
    images: [previewImageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        inter.variable,
        interHeading.variable,
        interMono.variable,
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
