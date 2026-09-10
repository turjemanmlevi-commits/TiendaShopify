"use client";

import Link from "next/link";
import { EditorialPage } from "@/components/editorial-page";

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <EditorialPage
      eyebrow="A moment in the shadows"
      title="Let’s try that again."
      intro="We couldn’t load this part of the collection. Please try again in a moment."
    >
      <button
        type="button"
        className="button button-dark"
        onClick={() => retry()}
      >
        Try again
      </button>
      <p style={{ marginTop: 24 }}>
        Still having trouble? <Link href="/contact">Get in touch</Link> and we
        will help.
      </p>
    </EditorialPage>
  );
}
