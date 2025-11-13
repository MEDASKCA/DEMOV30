import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProviderWrapper from "@/components/AuthProviderWrapper";
import { DataSourceProvider } from "@/contexts/DataSourceContext";
import { ListeningProvider } from "@/contexts/ListeningContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { HospitalProvider } from "@/lib/hospitalContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TOM by MEDASKCA™",
  description: "Theatre Operations Manager - Intelligent theatre operations management for NHS trusts",
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%2306B6D4"/><text x="50" y="70" font-size="60" font-weight="bold" text-anchor="middle" fill="white" font-family="sans-serif">T</text></svg>',
        type: 'image/svg+xml',
      },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
        style={{fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}
      >
        <ThemeProvider>
          <HospitalProvider>
            <ListeningProvider>
              <DataSourceProvider>
                <AuthProviderWrapper>
                  {children}
                </AuthProviderWrapper>
              </DataSourceProvider>
            </ListeningProvider>
          </HospitalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
