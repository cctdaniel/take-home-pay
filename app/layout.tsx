import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TAX_YEAR } from "@/lib/constants/tax-year";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `Take Home Pay Calculator ${TAX_YEAR} | US Salary After Tax`,
  description:
    `Free ${TAX_YEAR} take home pay calculator for all 50 US states. Calculate your salary after taxes including federal, state, Social Security, Medicare, 401(k), HSA, and IRA deductions. Supports California, New York, Texas, Florida, Washington, and 17 more states.`,
  keywords: [
    "take home pay calculator",
    "salary after tax calculator",
    "paycheck calculator",
    `${TAX_YEAR} tax calculator`,
    "net pay calculator",
    "us salary calculator",
    "california paycheck calculator",
    "new york salary calculator",
    "texas take home pay",
    "florida salary calculator",
    "401k tax savings calculator",
    "federal tax calculator",
    "state tax calculator",
    "how much will i take home",
    "salary to hourly calculator",
  ],
  openGraph: {
    title: `Take Home Pay Calculator ${TAX_YEAR} | US Salary After Tax`,
    description: `Calculate your actual take home pay after federal & state taxes. Free ${TAX_YEAR} calculator for CA, NY, TX, FL, WA and 17 more states.`,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `Take Home Pay Calculator ${TAX_YEAR}`,
    description: `Calculate your actual take home pay after federal & state taxes across 22 US states.`,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="author" content="Take Home Pay Calculator" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
