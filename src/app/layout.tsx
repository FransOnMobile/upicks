import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { TempoInit } from "@/components/tempo-init";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: '#7b1113',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "UPicks - Rate Your UP Professors",
    template: "%s | UPicks"
  },
  description: "The anonymous, student-driven professor rating platform for the UP community. Find the best mentors and share your campus experiences.",
  keywords: ["UP", "University of the Philippines", "professor rating", "campus review", "student community"],
  authors: [{ name: "UPicks Team" }],
  openGraph: {
    title: "UPicks - Rate Your UP Professors",
    description: "The anonymous, student-driven professor rating platform for the UP community.",
    type: "website",
    locale: "en_PH",
    siteName: "UPicks",
  },
  twitter: {
    card: "summary_large_image",
    title: "UPicks - Rate Your UP Professors",
    description: "The anonymous, student-driven professor rating platform for the UP community.",
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body className={inter.className}>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3086021868950910"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <TempoInit />
      </body>
    </html>
  );
}
