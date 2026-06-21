import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CineSeek | Intelligent Movie Discovery",
  description: "A premium movie discovery and information retrieval platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-accent-foreground pt-16`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
