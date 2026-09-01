import type { MetadataRoute } from "next";

// Le dashboard est une application privée authentifiée — jamais indexée.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
