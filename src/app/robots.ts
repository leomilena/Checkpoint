import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/redactor", "/perfil", "/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
