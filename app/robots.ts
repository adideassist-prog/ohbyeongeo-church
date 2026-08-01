import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap:
      "https://ohbyeongeo-church.modoomoa365.chatgpt.site/sitemap.xml",
    host: "https://ohbyeongeo-church.modoomoa365.chatgpt.site",
  };
}
