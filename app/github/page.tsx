import type { Metadata } from "next";
import { headers } from "next/headers";
import { loadPublishedContent, loadPublishedWords } from "../../lib/load-content";
import GitHubApp from "../GitHubApp";

export const dynamic = "force-dynamic";

const routeMetadata: Record<string, { title: string; description: string }> = {
  "/": {
    title: "오병이어교회 | 작은 나눔이 큰 은혜가 되는 교회",
    description: "말씀으로 자라고, 사랑으로 나누며, 세상을 섬기는 오병이어교회입니다.",
  },
  "/bulletin": {
    title: "이번 주 주보 | 오병이어교회",
    description: "오병이어교회의 이번 주 예배 순서와 말씀, 일정, 봉사 안내를 확인하세요.",
  },
  "/today": {
    title: "오늘의 말씀 | 오병이어교회",
    description: "오병이어교회와 함께 오늘의 성경 말씀을 읽고 묵상하며 기도하세요.",
  },
  "/news": {
    title: "교회소식 | 오병이어교회",
    description: "오병이어교회의 예배, 모임, 다음세대, 섬김과 나눔 소식을 확인하세요.",
  },
  "/admin": {
    title: "교회 홈페이지 관리 | 오병이어교회",
    description: "오병이어교회 주보, 오늘의 말씀, 교회소식을 관리하는 화면입니다.",
  },
};

function requestedRoute(value: string | string[] | undefined) {
  return typeof value === "string" && routeMetadata[value] ? value : "/";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ route?: string | string[] }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const route = requestedRoute(params.route);
  const meta = routeMetadata[route];
  const isAdmin = route === "/admin";

  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: route },
    robots: isAdmin ? { index: false, follow: false } : undefined,
    openGraph: isAdmin
      ? undefined
      : {
          title: meta.title,
          description: meta.description,
          url: route,
          siteName: "오병이어교회",
          locale: "ko_KR",
          type: "website",
          images: [
            {
              url: "/images/church-social-preview.png",
              width: 1200,
              height: 630,
              alt: "따뜻한 햇살 아래 놓인 다섯 개의 떡과 두 마리 생선",
            },
          ],
        },
    twitter: isAdmin
      ? undefined
      : {
          card: "summary_large_image",
          title: meta.title,
          description: meta.description,
          images: ["/images/church-social-preview.png"],
        },
  };
}

export default async function GitHubPage({
  searchParams,
}: {
  searchParams: Promise<{ route?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialPath = requestedRoute(params.route);
  const [[bulletinItem], wordItems, newsItems] = await Promise.all([
    loadPublishedContent("bulletin"),
    loadPublishedWords(),
    loadPublishedContent("news", 12),
  ]);
  const requestHeaders = await headers();
  const supabaseUrl =
    requestHeaders.get("x-church-supabase-url") ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    requestHeaders.get("x-church-supabase-key") ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return (
    <GitHubApp
      initialPath={initialPath}
      initialBulletinItem={bulletinItem ?? null}
      initialWordItems={wordItems}
      initialNewsItems={newsItems}
      supabaseUrl={supabaseUrl}
      supabasePublishableKey={supabasePublishableKey}
    />
  );
}
