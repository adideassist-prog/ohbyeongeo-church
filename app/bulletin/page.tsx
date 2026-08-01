import type { Metadata } from "next";
import { loadPublishedContent } from "../../lib/load-content";
import BulletinExperience from "./BulletinExperience";

export const metadata: Metadata = {
  title: "이번 주 주보",
  description:
    "오병이어교회의 이번 주 예배 순서와 말씀, 일정, 봉사 안내를 확인하세요.",
  alternates: { canonical: "/bulletin" },
};

export const dynamic = "force-dynamic";

export default async function BulletinPage() {
  const [bulletinItem] = await loadPublishedContent("bulletin");
  return <BulletinExperience initialItem={bulletinItem ?? null} />;
}
