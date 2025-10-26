import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AppProviders } from "@ainexsuite/ui/providers/app-providers";
import { AppShell } from "@ainexsuite/ui/layout/app-shell";

export const metadata: Metadata = {
  title: "{{APP_NAME_CAPITALIZED}} | AINexSuite",
  description: "{{APP_NAME_CAPITALIZED}} app - part of the AINexSuite productivity suite",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <AppProviders appName="{{APP_NAME}}">
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
