import type { Metadata } from "next";
import localFont from "next/font/local";
import { Crimson_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  display: "swap",
});

const cinzel = localFont({
  src: "./fonts/cinzel-latin-wght-normal.woff2",
  variable: "--font-cinzel",
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-crimson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Duskvow — Forge Your Path",
  description: "AI-powered RPG skill trees for real-world self-improvement. Turn your goals into epic talent trees.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Duskvow",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${inter.variable} ${crimsonPro.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
