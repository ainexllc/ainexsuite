import type { Metadata } from "next";
import { Geist, Geist_Mono, Kanit } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: "NoteNex • Capture and organize ideas effortlessly",
  description:
    "A modern note-taking surface inspired by Google Keep with powerful organization, collaboration, and insight features.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${kanit.variable} bg-surface-base text-ink-900 antialiased transition-colors duration-300`}
      >
        <AppProviders>{children}</AppProviders>
        <Toaster />
      </body>
    </html>
  );
}
