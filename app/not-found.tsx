import Link from "next/link";
import { EditorialPage } from "@/components/editorial-page";
export default function NotFound() {
  return (
    <EditorialPage
      eyebrow="404 · A little lost"
      title="This page has vanished."
      intro="Even the best spells take an unexpected turn."
    >
      <p style={{ textAlign: "center" }}>
        <Link href="/shop">Find your way back to the Halloween edit.</Link>
      </p>
    </EditorialPage>
  );
}
