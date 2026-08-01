import type { Metadata } from "next";
import AdminWorkspace from "./AdminWorkspace";

export const metadata: Metadata = {
  title: "교회 홈페이지 관리",
  description: "오병이어교회 주보, 오늘의 말씀, 교회소식을 관리하는 화면입니다.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminWorkspace />;
}
