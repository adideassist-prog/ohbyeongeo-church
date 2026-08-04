"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { newsFromItem, type ContentItem } from "../../lib/church-content";
import { loadClientPublishedContent } from "../../lib/client-content";
import {
  ArrowIcon,
  ChurchFooter,
  ChurchHeader,
  PageNotice,
} from "../ChurchShell";

const fallbackNewsItems = [
  { category: "예배", date: "8월 2일", title: "8월 첫째 주 주일예배 안내", body: "민수기 14장 21–24절, ‘하나님을 온전히 따르는 교회’ 말씀을 나눕니다.", detail: "서광봉 목사님과 함께 민수기 14장 21–24절의 말씀을 나눕니다.", tone: "terracotta", mediaUrl: null },
  { category: "말씀", date: "8월 2일", title: "2부 예배 말씀묵상 강의", body: "양성자 전도사님의 ‘말씀묵상은 마음의 거울이다’ 강의가 진행됩니다.", detail: "2부 예배에서 양성자 전도사님의 ‘말씀묵상은 마음의 거울이다’ 강의가 진행됩니다.", tone: "blue", mediaUrl: null },
  { category: "선교", date: "7월 30일–8월 6일", title: "공주·대전 JDM 지체 단기선교", body: "캠퍼스 복음 전도와 초청 잔치를 위해 함께 기도해 주세요.", detail: "간사 다섯 분과 대학생 40명이 캠퍼스 복음 전도와 초청 잔치를 위해 함께합니다.", tone: "gold", mediaUrl: null },
  { category: "선교", date: "8월", title: "베트남 최민철 선교사 선교편지", body: "선교편지를 함께 읽고 현지 사역을 위해 기도해 주세요.", detail: "베트남 최민철 선교사님의 선교편지를 함께 읽고 현지 사역을 위해 기도해 주세요.", tone: "navy", mediaUrl: null },
];

function shapeNewsItems(items: ContentItem[]) {
  const tones = ["terracotta", "blue", "gold", "navy"];
  if (!items.length) return fallbackNewsItems;
  return items.map((item, index) => {
    const news = newsFromItem(item);
    return {
      category: news.category,
      date: news.date,
      title: news.title,
      body: news.summary,
      detail: news.body,
      tone: tones[index % tones.length],
      mediaUrl: item.media_url,
    };
  });
}

export default function NewsExperience({ initialItems }: { initialItems: ContentItem[] }) {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    let active = true;
    loadClientPublishedContent("news", 12).then((latest) => {
      if (active) setItems(latest);
    });
    return () => {
      active = false;
    };
  }, []);

  const newsItems = useMemo(() => shapeNewsItems(items), [items]);
  const featured = newsItems[0];

  return (
    <main className="content-page news-page">
      <ChurchHeader active="news" />

      <section className="news-hero">
        <div className="news-hero__heading"><p>Church news</p><h1>함께 울고 웃으며,<br />한 주를 살아갑니다.</h1></div>
        <div className="news-hero__intro"><p>예배와 모임, 다음세대와 섬김의 소식을 전합니다.<br />오병이어교회의 오늘을 함께 확인해 보세요.</p><span>2026 · AUGUST</span></div>
        <div className="news-hero__motif" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      </section>

      <div className="content-wrap">
        <PageNotice />

        <nav className="news-filter" aria-label="교회소식 분류">
          <span className="is-active">전체</span><span>예배</span><span>모임</span><span>다음세대</span><span>섬김과 나눔</span>
        </nav>

        <section className="news-feature" aria-label="주요 교회소식">
          <div className="news-feature__visual">
            {featured.mediaUrl ? <img src={featured.mediaUrl} alt="" /> : (
              <><div className="news-feature__sun" /><div className="news-feature__symbol" aria-hidden="true"><span>5</span><i /><span>2</span></div><p>Grace<br />grows<br />when<br />shared.</p></>
            )}
          </div>
          <article className="news-feature__copy">
            <div className="news-feature__meta"><span>{featured.category}</span><time>{featured.date}</time></div>
            <h2>{featured.title}</h2><p>{featured.detail}</p>
            <Link href="/bulletin">이번 주 주보에서 자세히 보기 <ArrowIcon /></Link>
          </article>
        </section>

        <section className="news-list" aria-labelledby="news-list-title">
          <div className="content-section-title"><div><span>Latest stories</span><h2 id="news-list-title">새로운 소식</h2></div><small>가장 최근에 등록된 소식부터 표시됩니다.</small></div>
          <div className="news-card-grid">
            {newsItems.map((item, index) => (
              <article className={`news-card news-card--${item.tone}`} key={`${item.title}-${index}`}>
                {item.mediaUrl ? <img className="news-card__image" src={item.mediaUrl} alt="" /> : null}
                <div className="news-card__meta"><span>{item.category}</span><time>{item.date}</time></div>
                <div className="news-card__number">0{index + 1}</div>
                <h3>{item.title}</h3><p>{item.body}</p><Link className="news-card__more" href="/bulletin">이번 주 주보에서 확인 <ArrowIcon /></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="notice-board" aria-labelledby="notice-board-title">
          <div className="content-section-title"><div><span>Notice board</span><h2 id="notice-board-title">알려드립니다</h2></div></div>
          <div className="notice-board__list">
            <article><time>08.02</time><span>말씀</span><strong>2부 예배 말씀묵상 강의</strong><small>양성자 전도사</small></article>
            <article><time>07.30</time><span>선교</span><strong>공주·대전 JDM 지체 단기선교</strong><small>8월 6일까지</small></article>
            <article><time>08월</time><span>기도</span><strong>시편 쓰기·말씀 묵상·성경 통독</strong><small>전 교인</small></article>
          </div>
        </section>

        <section className="news-contact"><div><span>Share your story</span><h2>함께 나누고 싶은<br />교회소식이 있나요?</h2></div><p>새로운 소식은 관리자 화면에서 편하게 작성하고 바로 게시할 수 있습니다.</p></section>
      </div>

      <ChurchFooter />
    </main>
  );
}
