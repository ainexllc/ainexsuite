import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Plus_Jakarta_Sans, Inter, DM_Sans, Kanit, Bebas_Neue, League_Spartan } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { ThemeProvider, AppColorProvider, themeSyncScriptContent } from "@ainexsuite/theme";
import { getServerTheme } from "@ainexsuite/theme/server";
import { AuthProvider } from "@ainexsuite/auth";
import { Toaster } from "@ainexsuite/ui";
import "@ainexsuite/ui/styles";
import "./globals.css";

// Primary fonts - user-selectable via Settings > Appearance
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
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
  icons: {
    icon: '/favicon.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getServerTheme();

  return (
    <html lang="en" suppressHydrationWarning className={theme}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeSyncScriptContent }} />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} ${GeistSans.variable} ${dmSans.variable} ${GeistMono.variable} ${kanit.variable} ${bebasNeue.variable} ${leagueSpartan.variable} font-sans antialiased`}
      >
        <ThemeProvider defaultTheme={theme} enableSystem={false} storageKey="ainex-theme">
          <AuthProvider>
            <AppColorProvider appId="notes" fallbackPrimary="#f59e0b" fallbackSecondary="#d97706">
              <AppProviders>{children}</AppProviders>
              <Toaster />
            </AppColorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
