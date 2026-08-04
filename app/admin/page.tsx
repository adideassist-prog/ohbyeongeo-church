import type { Metadata } from "next";
import AdminWorkspace from "./AdminWorkspace";

export const metadata: Metadata = {
  title: "교회 홈페이지 관리",
  description: "오병이어교회 주보, 오늘의 말씀, 교회소식을 관리하는 화면입니다.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: { canonical: "/admin" },
};

export default function AdminPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return (
    <AdminWorkspace
      supabaseUrl={supabaseUrl}
      supabasePublishableKey={supabasePublishableKey}
    />
  );
}
