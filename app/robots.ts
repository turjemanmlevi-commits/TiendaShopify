import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const launched = process.env.STOREFRONT_LAUNCH_READY === "true";
  return {
    rules: {
      userAgent: "*",
      ...(launched ? { allow: "/", disallow: "/api/" } : { disallow: "/" }),
    },
    ...(launched ? { sitemap: `${site.url}/sitemap.xml` } : {}),
  };
}
