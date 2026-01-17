import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Plus_Jakarta_Sans, Inter, DM_Sans, Kanit, Bebas_Neue, League_Spartan } from "next/font/google";
import { AuthProvider } from "@ainexsuite/auth";
import { ThemeProvider, AppColorProvider, themeSyncScriptContent } from "@ainexsuite/theme";
import { getServerTheme } from "@ainexsuite/theme/server";
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
  title: "{{APP_NAME_CAPITALIZED}} - AINexSpace",
  description: "{{APP_NAME_CAPITALIZED}} app - part of the AINexSpace productivity suite",
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getServerTheme();

  return (
    <html lang="en" suppressHydrationWarning className={theme}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeSyncScriptContent }} />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} ${GeistSans.variable} ${dmSans.variable} ${GeistMono.variable} ${kanit.variable} ${bebasNeue.variable} ${leagueSpartan.variable} font-sans antialiased`}
      >
        <ThemeProvider defaultTheme={theme} enableSystem={true} storageKey="ainex-theme">
          <AuthProvider>
            <AppColorProvider appId="{{APP_NAME}}" fallbackPrimary="{{PRIMARY_COLOR}}" fallbackSecondary="{{SECONDARY_COLOR}}">
              {children}
              <Toaster />
            </AppColorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
