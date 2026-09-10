import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Moon, Sparkles } from "lucide-react";
import { Bow } from "@/components/brand-mark";
import { ProductCard } from "@/components/product-card";
import { MoodRibbon } from "@/components/motion";
import { getProducts } from "@/lib/shopify";
import type { NailMood } from "@/lib/types";

const edits: {
  mood: Exclude<NailMood, "All">;
  title: string;
  copy: string;
  className: string;
  image: string;
  alt: string;
}[] = [
  {
    mood: "Gothic Romance",
    title: "Sweetheart.\nDark soul.",
    copy: "For the romantics with a little edge.",
    className: "romance",
    image: "/images/products/haunted-tips-noir-halo-styled.webp",
    alt: "Noir Halo black almond nails with silver-toned stud borders on burgundy satin; AI-styled product photograph",
  },
  {
    mood: "Little Frights",
    title: "Scary cute.",
    copy: "A little playful. Entirely you.",
    className: "frights",
    image: "/images/products/haunted-tips-pastel-pumpkin-party-styled.webp",
    alt: "Pastel Pumpkin Party pink and lilac square nails with a friendly spider, ghost, pumpkin, webs and BOO details; AI-styled product photograph",
  },
  {
    mood: "After Dark",
    title: "Midnight muse.",
    copy: "Meet your after-hours alter ego.",
    className: "dark",
    image: "/images/products/haunted-tips-copper-coven-styled.webp",
    alt: "Copper Coven long black and orange nails with yellow pumpkins, drips, spiders, webs and bats; AI-styled product photograph",
  },
];

export default async function HomePage() {
  const products = await getProducts();
  return (
    <>
      <section className="hero" aria-labelledby="hero-heading">
        <Image
          className="hero-photo"
          src="/images/products/haunted-tips-night-crawlers-styled.webp"
          alt="Night Crawlers black and ivory nails with insects, centipedes and skeletal artwork on burgundy satin; AI-styled product photograph"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-shade" />
        <div className="hero-charms" aria-hidden="true">
          <span className="hero-charm hero-charm--star">✧</span>
          <Moon className="hero-charm hero-charm--moon" size={26} strokeWidth={1} />
          <span className="hero-charm hero-charm--little-star">✦</span>
        </div>
        <div className="shell hero-inner">
          <div className="hero-copy">
            <h1 id="hero-heading">
              Wicked nails.
              <br />
              <i>Sweet screams.</i>
            </h1>
            <p>
              For the sweet ones, the strange ones,
              <br className="desktop-break" /> and the beautifully both.
              Halloween nails
              <br className="desktop-break" /> with a personality all their own.
            </p>
            <Link className="button button-blush" href="/shop">
              Find your nail obsession <ArrowUpRight size={18} />
            </Link>
            <Link className="hero-story" href="/our-story">
              Enter our little world <span aria-hidden="true">→</span>
            </Link>
            <Bow className="hero-bow" />
          </div>
          <span className="hero-side-note">
            PRETTY LITTLE DARK THINGS · EST. 2026
          </span>
          <a
            className="hero-scroll"
            href="#the-edit"
            aria-label="Explore the nail edit"
          >
            <ArrowDown size={15} />
            <span>FALL UNDER THE SPELL</span>
          </a>
        </div>
        <div className="hero-lace" aria-hidden="true" />
      </section>
      <MoodRibbon />
      <section className="section shell featured-section" id="the-edit">
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow">YOUR NEXT LITTLE OBSESSION</p>
            <h2>
              Love at first <i>fright.</i>
            </h2>
          </div>
          <Link className="text-link" href="/shop">
            Explore all nails <ArrowUpRight size={17} />
          </Link>
        </div>
        {products[0]?.source === "preview" && (
          <p className="collection-preview-note">
            Collection preview · Checkout opens after availability is confirmed.
          </p>
        )}
        <div className="product-grid">
          {products.slice(0, 8).map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
        {products.length === 0 && (
          <div className="empty-catalog">
            <Bow />
            <h3>The next edit is on its way.</h3>
            <p>
              We&apos;re putting the finishing touches on our Halloween
              collection.
            </p>
            <Link href="/contact" className="text-link">
              Get in touch <ArrowUpRight size={15} />
            </Link>
          </div>
        )}
        <div className="section-footnote">
          <span aria-hidden="true">✧</span>
          <p>Every mood has its manicure. Find yours.</p>
          <span aria-hidden="true">✧</span>
        </div>
      </section>
      <section className="mood-section section">
        <div className="shell">
          <div className="section-heading centered" data-reveal>
            <Bow className="section-bow" />
            <p className="eyebrow">THREE WAYS TO BEWITCH</p>
            <h2>
              Which kind of <i>haunted</i> are you?
            </h2>
            <p>Follow your mood. The details will follow.</p>
          </div>
          <div className="editorial-grid">
            {edits.map((edit) => {
              return (
                <Link
                  className={`mood-card mood-card--${edit.className}`}
                  href={`/shop?mood=${encodeURIComponent(edit.mood)}`}
                  key={edit.mood}
                  data-reveal
                >
                  <div className="mood-card-photo">
                    <Image
                      src={edit.image}
                      alt={edit.alt}
                      fill
                      sizes="(max-width: 700px) 100vw, 33vw"
                    />
                  </div>
                  <div className="mood-card-top">
                    <span>{edit.mood}</span>
                    <ArrowUpRight size={22} />
                  </div>
                  <div className="mood-card-copy">
                    <h3>
                      {edit.title.split("\n").map((line, index) => (
                        <span key={line}>
                          {index > 0 && <br />}
                          {line}
                        </span>
                      ))}
                    </h3>
                    <p>{edit.copy}</p>
                    <span className="mood-card-link">
                      Discover the edit <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section className="brand-story section">
        <div className="shell story-layout">
          <div className="story-photo" data-reveal>
            <Image src="/images/products/haunted-tips-pumpkin-web-french-styled.webp" alt="Pumpkin Web French long nude square nails with orange jack-o-lanterns, black webs, spiders and flame accents; AI-styled product photograph" fill sizes="(max-width: 700px) 100vw, 50vw" />
          </div>
          <div className="story-copy" data-reveal>
            <p className="eyebrow">OUR PRETTY LITTLE WORLD</p>
            <h2>
              Because your nails
              <br />
              should have a <i>dark side.</i>
            </h2>
            <p>
              We&apos;re drawn to the details that make you look twice. The tiny
              ghost. The midnight finish. A little romance where you least
              expect it.
            </p>
            <p>
              Haunted Tips is a home for Halloween nail designs with character —
              sweet, strange, and entirely your own.
            </p>
            <Link className="text-link" href="/our-story">
              A little more about us <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="guide-teaser section">
        <div className="shell guide-layout">
          <div className="guide-photo-copy" data-reveal>
            <div className="guide-photo"><Image src="/images/products/haunted-tips-pumpkin-peek-styled.webp" alt="Pumpkin Peek pink square nails with black cat tips, orange pumpkins, white ghosts and spider accents; AI-styled product photograph" fill sizes="(max-width: 700px) 100vw, 50vw" /></div>
            <p className="eyebrow">FIRST TIME UNDER THE SPELL?</p>
            <h2>
              A little prep.
              <br />
              <i>A lovely finish.</i>
            </h2>
            <Link className="text-link" href="/nail-guide">
              Meet the nail guide <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="guide-steps">
            <div data-reveal>
              <span>01</span>
              <div>
                <h3>Find your fit.</h3>
                <p>
                  Check the shape, length and sizing details on your chosen set.
                </p>
              </div>
            </div>
            <div data-reveal>
              <span>02</span>
              <div>
                <h3>Prep with care.</h3>
                <p>
                  Start with clean, healthy nails and follow your
                  adhesive&apos;s instructions.
                </p>
              </div>
            </div>
            <div data-reveal>
              <span>03</span>
              <div>
                <h3>Make it your moment.</h3>
                <p>
                  Style your look, enjoy the details, and remove gently as
                  directed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="closing-note shell" data-reveal>
        <div className="closing-photo"><Image src="/images/products/haunted-tips-pastel-pumpkin-party-styled.webp" alt="Pastel Pumpkin Party pink and lilac square nails with a friendly spider, ghost, pumpkin, webs and BOO details; AI-styled product photograph" fill sizes="180px" /></div>
        <Sparkles size={22} strokeWidth={1} />
        <p>
          Your next obsession
          <br />
          is at your <i>fingertips.</i>
        </p>
        <Link className="button button-dark" href="/shop">
          Find your favorite <ArrowUpRight size={17} />
        </Link>
      </section>
    </>
  );
}
