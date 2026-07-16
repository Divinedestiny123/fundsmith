import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fundsmith | Monad",
  description: "Batch fund Monad wallets efficiently",
  openGraph: {
    title: "Fundsmith | Monad",
    description: "Batch fund Monad wallets efficiently",
    url: "https://fundsmith.vercel.app", // Adjust if your domain is different
    siteName: "Fundsmith",
    images: [
      {
        url: "/og-image.png", // This points to public/og-image.png
        width: 1200,
        height: 630,
        alt: "Fundsmith - Batch fund Monad wallets efficiently",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fundsmith | Monad",
    description: "Batch fund Monad wallets efficiently",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
