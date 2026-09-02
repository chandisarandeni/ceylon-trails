import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "../components/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const ibmMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Ceylon Trails - Smart Tourism Decision Support System",
  description: "Personalized trip planning, attraction selection, route optimization, network analysis, and MCDM plan ranking for Sri Lanka.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-canvas text-ink">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
