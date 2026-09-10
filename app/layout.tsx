import type { Metadata } from "next";
import localFont from "next/font/local";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "./globals.css";
import "./halloween.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Motion } from "@/components/motion";
import { CartProvider } from "@/components/cart";
import { isNativeCatalogMode } from "@/lib/shopify";
import { site } from "@/lib/site";

const creepster = localFont({
  src: "../public/fonts/Creepster-Regular.ttf",
  variable: "--font-haunted-display",
  weight: "400",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Haunted Tips — Pretty Little Dark Things",
    template: "%s | Haunted Tips",
  },
  description: site.description,
  openGraph: {
    title: "Haunted Tips",
    description: site.description,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/images/products/haunted-tips-night-crawlers-styled.webp",
        width: 1254,
        height: 1254,
        alt: "Night Crawlers Halloween press-on nails by Haunted Tips",
      },
    ],
  },
  robots: {
    index: process.env.STOREFRONT_LAUNCH_READY === "true",
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={creepster.variable}>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <CartProvider nativeMode={isNativeCatalogMode}>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </CartProvider>
        <Motion />
      </body>
    </html>
  );
}
