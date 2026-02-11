import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Change this import to switch themes:
// '@/styles/themes/default.css'  -> Professional Blue (default)
// '@/styles/themes/minimal.css'  -> Clean & Minimal
// '@/styles/themes/modern.css'   -> Vibrant & Bold
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "onlyinkani.in - Your Ultimate Online Store for Unique Products",
  description: "onlyinkani.in is your go-to destination for unique and high-quality products. Discover exclusive deals, new arrivals, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <WishlistProvider>
            <RecentlyViewedProvider>
              {children}
            </RecentlyViewedProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
