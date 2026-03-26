import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Change this import to switch themes:
// '@/styles/themes/default.css'  -> Professional Blue (default)
// '@/styles/themes/minimal.css'  -> Clean & Minimal
// '@/styles/themes/modern.css'   -> Vibrant & Bold
import { CartProvider } from "@/contexts/CartContext";
import { StoreSettingsProvider } from "@/contexts/StoreSettingsContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { getStoreSettings } from "@/lib/storeSettings";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();

  return {
    title: settings.seoTitle,
    description: settings.seoDescription,
    metadataBase: settings.domain ? new URL(settings.domain) : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();
  const themeKey = ['default', 'minimal', 'modern', 'green'].includes(settings.themeKey)
    ? settings.themeKey
    : 'default';

  return (
    <html lang="en" data-theme={themeKey} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        <StoreSettingsProvider value={settings}>
          <CartProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>
                {children}
              </RecentlyViewedProvider>
            </WishlistProvider>
          </CartProvider>
        </StoreSettingsProvider>
      </body>
    </html>
  );
}
