"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { wordFromItem, type ContentItem } from "../../lib/church-content";
import { loadClientPublishedWords } from "../../lib/client-content";
import {
  ArrowIcon,
  ChurchFooter,
  ChurchHeader,
  PageNotice,
} from "../ChurchShell";
import WordComments from "./WordComments";

function dateParts(value: string) {
  const date = new Date(`${value}T12:00:00+09:00`);
  if (Number.isNaN(date.getTime())) return { day: "말씀", date: value.slice(-2), month: "" };
  return {
    day: new Intl.DateTimeFormat("ko-KR", { weekday: "short", timeZone: "Asia/Seoul" }).format(date),
    date: new Intl.DateTimeFormat("ko-KR", { day: "2-digit", timeZone: "Asia/Seoul" }).format(date),
    month: new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", timeZone: "Asia/Seoul" }).format(date),
  };
}

function selectedDateFromLocation(fallback: string | null) {
  if (typeof window === "undefined") return fallback;
  const date = new URLSearchParams(window.location.search).get("date");
  return date && /^20\d{2}-\d{2}-\d{2}$/.test(date) ? date : fallback;
}

export default function TodayExperience({
  initialItems,
  initialSelectedDate,
}: {
  initialItems: ContentItem[];
  initialSelectedDate: string | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [selectedDate, setSelectedDate] = useState(() => selectedDateFromLocation(initialSelectedDate));

  useEffect(() => {
    let active = true;
    const syncSelectedDate = () => setSelectedDate(selectedDateFromLocation(initialSelectedDate));
    syncSelectedDate();
    window.addEventListener("popstate", syncSelectedDate);
    loadClientPublishedWords().then((latest) => {
      if (active && latest.length) setItems(latest);
    });
    return () => {
      active = false;
      window.removeEventListener("popstate", syncSelectedDate);
    };
  }, [initialSelectedDate]);

  const selectedItem = useMemo(
    () => (selectedDate ? items.find((item) => item.content_date === selectedDate) : null) ?? items[0],
    [items, selectedDate],
  );
  const word = wordFromItem(selectedItem);
  const wordKey = selectedItem?.content_date ?? "2026-08-04";
  const selectedIndex = items.findIndex((item) => item.id === selectedItem?.id);
  const newerWord = selectedIndex > 0 ? items[selectedIndex - 1] : null;
  const olderWord = selectedIndex >= 0 && selectedIndex < items.length - 1 ? items[selectedIndex + 1] : null;

  return (
    <main className="content-page today-page">
      <ChurchHeader active="today" />

      <section className="word-hero">
        <div className="word-hero__date"><span>Today&apos;s word</span><time>{word.date}</time></div>
        <div className="word-hero__verse"><span className="word-hero__chapter">TODAY&apos;S SCRIPTURE</span><blockquote>“{word.verse}”</blockquote><p>{word.passage}</p></div>
        <div className="word-hero__rings" aria-hidden="true"><i /><i /><i /></div>
        <div className="word-hero__numbers" aria-hidden="true"><span>5</span><span>2</span></div>
      </section>

      <div className="content-wrap">
        <PageNotice />

        <section className="meditation-layout">
          <article className="meditation-copy">
            <div className="content-section-title"><div><span>Daily meditation</span><h1>{word.title}</h1></div></div>
            <div className="meditation-copy__body"><p className="meditation-copy__lead">{word.meditation}</p><div className="meditation-question"><span>오늘의 묵상 질문</span><strong>{word.question}</strong></div></div>
          </article>
          <aside className="prayer-card"><span>Today&apos;s prayer</span><h2>오늘의 기도</h2><p>{word.prayer}</p><strong>예수님의 이름으로 기도드립니다. 아멘.</strong><div className="prayer-card__mark" aria-hidden="true">+</div></aside>
        </section>

        <section className="word-week" aria-labelledby="word-week-title">
          <div className="content-section-title"><div><span>Daily word archive</span><h2 id="word-week-title">지난 말씀 다시보기</h2></div><small>날짜를 누르면 그날의 말씀과 은혜 나눔 댓글이 함께 열립니다.</small></div>
          <div className="word-week__grid">
            {items.length ? items.map((item) => {
              const parts = dateParts(item.content_date);
              const itemWord = wordFromItem(item);
              const isSelected = item.content_date === wordKey;
              return (
                <Link className={isSelected ? "is-today" : ""} href={`/today?date=${item.content_date}`} key={item.id} aria-current={isSelected ? "page" : undefined}>
                  <span>{parts.day}</span><strong>{parts.date}</strong><small>{parts.month}</small><em>{itemWord.title}</em>
                </Link>
              );
            }) : <div className="word-week__empty">첫 말씀을 준비하고 있습니다.</div>}
          </div>
          {items.length > 1 ? (
            <nav className="word-archive-nav" aria-label="날짜별 말씀 이동">
              {olderWord ? <Link href={`/today?date=${olderWord.content_date}`}>← 이전 말씀</Link> : <span />}
              {newerWord ? <Link href={`/today?date=${newerWord.content_date}`}>다음 말씀 →</Link> : <Link href="/today">가장 최근 말씀 →</Link>}
            </nav>
          ) : null}
        </section>

        <WordComments key={wordKey} wordKey={wordKey} wordLabel={`${word.date} · ${word.passage}`} />

        <section className="word-next">
          <div><span>Sunday message</span><h2>이번 주 주일 말씀을<br />다시 만나보세요.</h2><p>민수기 14장 21–24절 · 하나님을 온전히 따르는 교회</p></div>
          <Link className="content-link-button content-link-button--light" href="/bulletin">이번 주 주보 보기 <ArrowIcon /></Link>
        </section>
      </div>

      <ChurchFooter />
    </main>
  );
}
