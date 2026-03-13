import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
// Fallback for OG/Twitter image resolution when SITE_URL is unset (e.g. localhost)
const baseUrl =
  siteUrl || (typeof process.env.VERCEL_URL === "string" ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
// Share image: add public/media/og.jpg (1200×630) for best results; else crawlers may use a default.
const ogImage = `${baseUrl}${baseUrl.endsWith("/") ? "" : "/"}media/og.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Belicia — Happy Birthday",
  description: "A special birthday for Belicia",
  manifest: "/manifest.json",
  alternates: { canonical: siteUrl || baseUrl },
  openGraph: {
    title: "Belicia — Happy Birthday",
    description: "A special birthday for Belicia",
    url: siteUrl || baseUrl,
    siteName: "Belicia",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Belicia" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Belicia — Happy Birthday",
    description: "A special birthday for Belicia",
    images: [ogImage],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Belicia — Happy Birthday",
  description: "A special birthday for Belicia",
  ...(siteUrl && { url: siteUrl }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${sourceSans.variable}`}>
      <body className="relative min-h-screen antialiased bg-background text-cream font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
