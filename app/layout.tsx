import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { inter } from "./fonts";

export const metadata: Metadata = {
  title: "Iso Middle Earth — Isometric Realm Builder",
  description: "Build your own isometric realm in Middle-earth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <GoogleAnalytics gaId="G-3J7N3BKGKM" />
      </body>
    </html>
  );
}
