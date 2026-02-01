import type { Metadata } from "next";
import { Orbitron, Inter } from "next/font/google";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { Toaster } from "sonner";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "REVA TECHNO-CULTURAL UTSAV 2026",
  description: "Join us for the ultimate techno-cultural fest at REVA University.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/api/theme" />
      </head>
      <body
        className={`${orbitron.variable} ${inter.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <SmoothScrollProvider>
          {children}
          <Toaster richColors position="top-center" />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
