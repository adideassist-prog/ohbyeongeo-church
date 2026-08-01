import type { Metadata } from "next";
import { loadPublishedContent } from "../../lib/load-content";
import NewsExperience from "./NewsExperience";

export const metadata: Metadata = {
  title: "교회소식",
  description:
    "오병이어교회의 예배, 모임, 다음세대, 섬김과 나눔 소식을 확인하세요.",
  alternates: { canonical: "/news" },
};

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const savedItems = await loadPublishedContent("news", 12);
  return <NewsExperience initialItems={savedItems} />;
}
