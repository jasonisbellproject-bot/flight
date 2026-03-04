import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocGen — Flight & Receipt Generator",
  description: "Generate professional flight itineraries and receipts as PDFs instantly.",
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
