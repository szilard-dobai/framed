import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Framed — Device Mockup Generator",
  description:
    "Create beautiful device mockups in seconds. Upload a screenshot, pick a device frame, and download a high-res PNG — free, instant, no signup.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Framed — Device Mockup Generator",
    description:
      "Upload a screenshot, pick a device frame, and download a high-res mockup. Free, instant, no signup.",
    type: "website",
    siteName: "Framed",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Framed — Device Mockup Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Framed — Device Mockup Generator",
    description:
      "Upload a screenshot, pick a device frame, and download a high-res mockup. Free, instant, no signup.",
    images: ["/og-image.png"],
  },
  metadataBase: new URL("https://framed.vercel.app"),
  keywords: [
    "device mockup",
    "mockup generator",
    "screenshot mockup",
    "iPhone mockup",
    "MacBook mockup",
    "iPad mockup",
    "free mockup tool",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
