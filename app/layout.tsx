import type { Metadata } from "next";
import { Urbanist, DM_Sans } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/lib/auth-context";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "LowFi.app - AI Tools for Small Businesses",
  description: "Save hours every week. LowFi handles invoices, follow-ups, and support so you don't have to.",
  keywords: [
    "SME",
    "operations",
    "automation",
    "invoices",
    "workflow",
    "AI",
  ],
  authors: [{ name: "LowFi.app" }],
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "LowFi.app",
    description: "AI tools that help small businesses save time",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#FAFAF8" />
      </head>
      <body
        className={`${urbanist.variable} ${dmSans.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
