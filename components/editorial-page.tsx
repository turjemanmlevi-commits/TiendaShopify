import Link from "next/link";
import type { ReactNode } from "react";
import "./editorial-page.css";

export function EditorialPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <article className="editorial-page">
      <div className="editorial-page__head">
        <Link href="/" className="editorial-page__back">
          ← Back to the haunt
        </Link>
        <p className="editorial-page__eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="editorial-page__intro">{intro}</p>
      </div>
      <div className="editorial-page__body">{children}</div>
      <div className="editorial-page__end">
        <span aria-hidden="true">✧</span>
        <p>Your next little obsession awaits.</p>
        <Link href="/shop">
          Explore the Halloween edit <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
