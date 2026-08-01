import type { Metadata } from "next";
import { loadPublishedWords } from "../../lib/load-content";
import TodayExperience from "./TodayExperience";

export const metadata: Metadata = {
  title: "오늘의 말씀",
  description:
    "오병이어교회와 함께 오늘의 성경 말씀을 읽고 묵상하며 기도하세요.",
  alternates: { canonical: "/today" },
};

export const dynamic = "force-dynamic";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedDate =
    typeof params.date === "string" && /^20\d{2}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : null;
  const wordItems = await loadPublishedWords();
  return (
    <TodayExperience
      initialItems={wordItems}
      initialSelectedDate={requestedDate}
    />
  );
}
