"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, Search, X } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { CartTrigger } from "./cart";

const collections = [
  { name: "All nails", href: "/shop", note: "Every pretty little detail" },
  {
    name: "Gothic Romance",
    href: "/shop?mood=Gothic%20Romance",
    note: "Dark hearts & delicate drama",
  },
  {
    name: "Little Frights",
    href: "/shop?mood=Little%20Frights",
    note: "Sweet, with a mischievous side",
  },
  {
    name: "After Dark",
    href: "/shop?mood=After%20Dark",
    note: "For your midnight mood",
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const dropdown = useRef<HTMLDetailsElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const close = () => {
    setMobileOpen(false);
    if (dropdown.current) dropdown.current.open = false;
  };
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        if (dropdown.current?.open) {
          dropdown.current.open = false;
          dropdown.current.querySelector("summary")?.focus();
        } else if (menuButton.current?.offsetParent) menuButton.current.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (
        dropdown.current?.open &&
        event.target instanceof Node &&
        !dropdown.current.contains(event.target)
      )
        dropdown.current.open = false;
    };
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
    };
  }, []);
  return (
    <>
      <div className="announcement">
        <span aria-hidden="true">✧</span> A little lovely. A little wicked.{" "}
        <span aria-hidden="true">✧</span>
      </div>
      <header className="site-header">
        <div className="header-inner shell">
          <button
            ref={menuButton}
            className="icon-button mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <Link
            href="/"
            className="logo-link"
            aria-label="Haunted Tips home"
            onClick={close}
          >
            <BrandMark />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <details className="shop-dropdown" ref={dropdown}>
              <summary className={pathname === "/shop" ? "nav-active" : ""}>
                Shop nails <ChevronDown size={13} />
              </summary>
              <div className="dropdown-panel">
                <p className="eyebrow">PICK YOUR PRETTY</p>
                {collections.map((item) => (
                  <Link onClick={close} href={item.href} key={item.name}>
                    <span>
                      {item.name}
                      <small>{item.note}</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
              </div>
            </details>
            <Link
              href="/our-story"
              className={pathname === "/our-story" ? "nav-active" : ""}
            >
              Our story
            </Link>
            <Link
              href="/nail-guide"
              className={pathname === "/nail-guide" ? "nav-active" : ""}
            >
              The nail guide
            </Link>
            <Link
              href="/faqs"
              className={pathname === "/faqs" ? "nav-active" : ""}
            >
              Need a hand?
            </Link>
          </nav>
          <div className="header-actions">
            <Link
              href="/shop?search="
              className="icon-button search-link"
              aria-label="Search nail designs"
            >
              <Search size={19} />
            </Link>
            <CartTrigger />
          </div>
        </div>
        {mobileOpen && (
          <nav
            id="mobile-navigation"
            className="mobile-navigation"
            aria-label="Mobile navigation"
          >
            <p className="eyebrow">SHOP YOUR HALLOWEEN MOOD</p>
            {collections.map((item) => (
              <Link onClick={close} href={item.href} key={item.name}>
                {item.name}
                <ArrowUpRight size={18} />
              </Link>
            ))}
            <div className="mobile-nav-secondary">
              <Link onClick={close} href="/our-story">
                Our story
              </Link>
              <Link onClick={close} href="/nail-guide">
                The nail guide
              </Link>
              <Link onClick={close} href="/faqs">
                FAQs
              </Link>
              <Link onClick={close} href="/contact">
                Contact
              </Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
