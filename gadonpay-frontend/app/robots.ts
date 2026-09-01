import type { MetadataRoute } from "next";

// Seules les zones privées (dashboard marchand + admin) sont bloquées.
// La landing page, /login et /register restent indexables.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/admin/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://gadonpay.lat"}/sitemap.xml`,
  };
}
