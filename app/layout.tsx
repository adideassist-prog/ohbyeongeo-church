import type { Metadata } from "next";
import MusicPlayer from "./MusicPlayer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://ohbyeongeo-church.modoomoa365.chatgpt.site",
  ),
  title: {
    default: "오병이어교회 | 작은 나눔이 큰 은혜가 되는 교회",
    template: "%s | 오병이어교회",
  },
  description:
    "서광봉 담임목사와 함께 말씀으로 자라고, 사랑으로 나누며, 세상을 섬기는 오병이어교회입니다.",
  keywords: [
    "오병이어교회",
    "서광봉 목사",
    "교회",
    "예배",
    "새가족",
    "다음세대",
  ],
  openGraph: {
    title: "오병이어교회",
    description: "작은 나눔이 큰 은혜가 되는 교회",
    type: "website",
    locale: "ko_KR",
    url: "https://ohbyeongeo-church.modoomoa365.chatgpt.site",
    siteName: "오병이어교회",
    images: [
      {
        url: "/images/church-social-preview.png",
        width: 1200,
        height: 630,
        alt: "따뜻한 햇살 아래 놓인 다섯 개의 떡과 두 마리 생선",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "오병이어교회",
    description: "작은 나눔이 큰 은혜가 되는 교회",
    images: ["/images/church-social-preview.png"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <MusicPlayer />
      </body>
    </html>
  );
}
