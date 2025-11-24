import type { Metadata } from "next";
import { Geist, Geist_Mono, Kanit, Bebas_Neue, League_Spartan } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { ThemeProvider, AppColorProvider } from "@ainexsuite/theme";
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

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas-neue",
});

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-league-spartan",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${kanit.variable} ${bebasNeue.variable} ${leagueSpartan.variable} font-sans bg-surface-base text-ink-900 antialiased transition-colors duration-300`}
      >
        <ThemeProvider>
          <AppColorProvider appId="notes" fallbackPrimary="#3b82f6" fallbackSecondary="#60a5fa">
            <AppProviders>{children}</AppProviders>
            <Toaster />
          </AppColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
