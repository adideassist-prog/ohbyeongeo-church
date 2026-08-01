import type { Metadata } from "next";
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

  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: route },
    robots: route === "/admin" ? { index: false, follow: false } : undefined,
  };
}

export default async function GitHubPage({
  searchParams,
}: {
  searchParams: Promise<{ route?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialPath = requestedRoute(params.route);
  return <GitHubApp initialPath={initialPath} />;
}
