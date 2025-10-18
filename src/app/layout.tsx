import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import {
  ClerkProvider,
} from "@clerk/nextjs";
import { siteMetadata } from "@/lib/brand-config";
import { AnalyticsPixels } from "@/components/analytics/pixels";

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-br" suppressHydrationWarning>
        <body
          className="antialiased text-foreground font-sans"
        >
          <AnalyticsPixels />
          <QueryProvider>
            <ThemeProvider>
              {children}
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
