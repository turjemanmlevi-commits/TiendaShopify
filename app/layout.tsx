import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Motion } from "@/components/motion";
import { CartProvider } from "@/components/cart";
import { site } from "@/lib/site";

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
        url: "/images/haunted-hero.webp",
        width: 1536,
        height: 1024,
        alt: "Haunted Tips Halloween nail edit",
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
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <CartProvider>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </CartProvider>
        <Motion />
      </body>
    </html>
  );
}
