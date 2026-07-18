import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers, config } from "./providers";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fundsmith | Batch Fund Monad Testnet Wallets with Precision",
  description: "Fundsmith is the most efficient tool to batch distribute $MON tokens to multiple testnet wallets simultaneously on the Monad network. Built for Web3 builders.",
  openGraph: {
    title: "Fundsmith | Batch Fund Monad Testnet Wallets with Precision",
    description: "Fundsmith is the most efficient tool to batch distribute $MON tokens to multiple testnet wallets on the Monad network.",
    url: "https://fundsmith.vercel.app",
    siteName: "Fundsmith",
    images: [
      {
        url: "https://fundsmith.vercel.app/og-image.png",
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
    title: "Fundsmith | Batch Fund Monad Testnet Wallets with Precision",
    description: "Fundsmith is the most efficient tool to batch distribute $MON tokens to multiple testnet wallets on the Monad network.",
    images: ["https://fundsmith.vercel.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(config, headers().get("cookie"));
  
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}
