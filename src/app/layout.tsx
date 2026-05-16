import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Domain Checker — Instant Availability Search",
  description:
    "Check domain availability across 14+ TLDs instantly using IANA RDAP. Find your perfect domain name — fast, accurate, and free.",
  keywords: ["domain checker", "domain availability", "RDAP", "TLD", "domain search"],
  openGraph: {
    title: "Domain Checker — Instant Availability Search",
    description:
      "Check domain availability across 14+ TLDs instantly using IANA RDAP.",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
