import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocGen — Flight & Receipt Generator",
  description: "Generate professional flight itineraries and receipts as PDFs instantly.",
  keywords: ["flight itinerary", "receipt generator", "PDF export", "travel documents"],
  authors: [{ name: "DocGen Team" }],
  viewport: "width=device-width, initial-scale=1.0",
  robots: "index, follow",
  openGraph: {
    title: "DocGen — Flight & Receipt Generator",
    description: "Generate professional flight itineraries and receipts as PDFs instantly.",
    type: "website",
    url: process.env.NEXT_PUBLIC_API_URL || "https://docgenpdf.vercel.app/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DocGen - Flight & Receipt Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DocGen — Flight & Receipt Generator",
    description: "Generate professional flight itineraries and receipts as PDFs instantly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
