export type BulletinDraft = {
  date: string;
  volume: string;
  passage: string;
  title: string;
  preacher: string;
  schedule: string;
  service: string;
};

export type WordDraft = {
  date: string;
  passage: string;
  verse: string;
  title: string;
  meditation: string;
  question: string;
  prayer: string;
};

export type NewsDraft = {
  category: string;
  date: string;
  title: string;
  summary: string;
  body: string;
};

export type ContentType = "bulletin" | "daily_word" | "news";

export type ContentItem = {
  id: string;
  content_type: ContentType;
  slug: string | null;
  title: string;
  content_date: string;
  status: "draft" | "published" | "archived";
  data: Record<string, unknown>;
  media_url: string | null;
  media_type: "image" | "pdf" | null;
  is_featured: boolean;
  sort_order: number;
  published_at: string | null;
  updated_at: string;
};

export const defaultBulletin: BulletinDraft = {
  date: "2026년 8월 2일 · 주일",
  volume: "Vol. 001",
  passage: "요한복음 6장 1–13절",
  title: "작은 나눔, 큰 은혜",
  preacher: "서광봉 담임목사",
  schedule: "8.05 수요 말씀예배\n8.07 금요 기도모임\n매일 새벽기도회",
  service: "대표기도 · 담당자 안내 예정\n예배안내 · 안내위원\n봉헌 · 봉헌위원\n식사봉사 · 봉사팀",
};

export const defaultWord: WordDraft = {
  date: "2026. 08. 01. 토요일",
  passage: "요한복음 6장 9절",
  verse:
    "여기 한 아이가 있어 보리떡 다섯 개와 물고기 두 마리를 가지고 있나이다.",
  title: "내 손에 있는 작은 것을 주님께 드릴 때",
  meditation:
    "하나님은 우리가 얼마나 많이 가졌는지를 먼저 묻지 않으십니다. 지금 내 손에 있는 작은 시간과 따뜻한 말 한마디를 기쁨으로 드리는 마음을 보십니다.",
  question: "내가 오늘 기쁨으로 나눌 수 있는 한 가지는 무엇인가요?",
  prayer:
    "사랑의 주님, 제가 가진 것이 작다고 주저하지 않게 하시고 기쁨으로 내어놓는 믿음을 주세요.",
};

export const defaultNews: NewsDraft = {
  category: "예배",
  date: "2026. 08. 02",
  title: "8월 첫째 주 주일예배 안내",
  summary: "온 세대가 함께 모여 찬양하고 말씀을 나누는 예배로 초대합니다.",
  body:
    "새로운 달을 감사로 시작합니다. 이번 주 예배와 공동체 모임, 다음세대 활동과 함께 섬길 자리를 확인해 주세요.",
};

function readString(
  data: Record<string, unknown>,
  key: string,
  fallback: string,
) {
  const value = data[key];
  return typeof value === "string" ? value : fallback;
}

export function bulletinFromItem(item?: ContentItem | null): BulletinDraft {
  if (!item) return defaultBulletin;
  return {
    date: readString(item.data, "date", defaultBulletin.date),
    volume: readString(item.data, "volume", defaultBulletin.volume),
    passage: readString(item.data, "passage", defaultBulletin.passage),
    title: readString(item.data, "title", item.title || defaultBulletin.title),
    preacher: readString(item.data, "preacher", defaultBulletin.preacher),
    schedule: readString(item.data, "schedule", defaultBulletin.schedule),
    service: readString(item.data, "service", defaultBulletin.service),
  };
}

export function wordFromItem(item?: ContentItem | null): WordDraft {
  if (!item) return defaultWord;
  return {
    date: readString(item.data, "date", defaultWord.date),
    passage: readString(item.data, "passage", defaultWord.passage),
    verse: readString(item.data, "verse", defaultWord.verse),
    title: readString(item.data, "title", item.title || defaultWord.title),
    meditation: readString(item.data, "meditation", defaultWord.meditation),
    question: readString(item.data, "question", defaultWord.question),
    prayer: readString(item.data, "prayer", defaultWord.prayer),
  };
}

export function newsFromItem(item?: ContentItem | null): NewsDraft {
  if (!item) return defaultNews;
  return {
    category: readString(item.data, "category", defaultNews.category),
    date: readString(item.data, "date", defaultNews.date),
    title: readString(item.data, "title", item.title || defaultNews.title),
    summary: readString(item.data, "summary", defaultNews.summary),
    body: readString(item.data, "body", defaultNews.body),
  };
}

export function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
