import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Kanit, Bebas_Neue, League_Spartan } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { ThemeProvider, AppColorProvider } from "@ainexsuite/theme";
import { AuthProvider } from "@ainexsuite/auth";
import { Toaster } from "@ainexsuite/ui";
import "@ainexsuite/ui/styles";
import "./globals.css";

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
        className={`${GeistSans.variable} ${GeistMono.variable} ${kanit.variable} ${bebasNeue.variable} ${leagueSpartan.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <AppColorProvider appId="notes" fallbackPrimary="#eab308" fallbackSecondary="#fde047">
              <AppProviders>{children}</AppProviders>
              <Toaster />
            </AppColorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
