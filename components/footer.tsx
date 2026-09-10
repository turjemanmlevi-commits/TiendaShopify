import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandMark, Bow } from "./brand-mark";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-lace" aria-hidden="true" />
      <div className="shell footer-main">
        <div className="footer-brand">
          <Bow className="footer-bow" />
          <Link href="/" aria-label="Haunted Tips home">
            <BrandMark />
          </Link>
          <p>
            For the sweet ones.
            <br />
            The strange ones.
            <br />
            <i>The beautifully both.</i>
          </p>
        </div>
        <div className="footer-link-group">
          <h2>Find your pretty</h2>
          <Link href="/shop">All nail designs</Link>
          <Link href="/shop?mood=Gothic%20Romance">Gothic Romance</Link>
          <Link href="/shop?mood=Little%20Frights">Little Frights</Link>
          <Link href="/shop?mood=After%20Dark">After Dark</Link>
        </div>
        <div className="footer-link-group">
          <h2>A little help</h2>
          <Link href="/nail-guide">The nail guide</Link>
          <Link href="/faqs">Frequently asked questions</Link>
          <Link href="/shipping-returns#shipping">Shipping & delivery</Link>
          <Link href="/shipping-returns#returns">Returns & refunds</Link>
          <Link href="/contact">Contact us</Link>
        </div>
        <div className="footer-note">
          <p className="eyebrow">A NOTE FROM US</p>
          <h2>
            Good things start
            <br />
            <i>with a hello.</i>
          </h2>
          <p>
            A question about your next set?
            <br />
            We&apos;re just an email away.
          </p>
          <a className="text-link" href={`mailto:${site.email}`}>
            Say hello <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <p>© {new Date().getFullYear()} Haunted Tips</p>
        <div>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms of service</Link>
          <span>USD $</span>
        </div>
      </div>
    </footer>
  );
}
