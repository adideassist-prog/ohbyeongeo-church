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
  { category: "예배", date: "8월 2일", title: "8월 첫째 주 주일예배 안내", body: "온 세대가 함께 모여 찬양하고 말씀을 나누는 예배로 초대합니다.", detail: "온 세대가 함께 모여 찬양하고 말씀을 나누는 예배로 초대합니다.", tone: "terracotta", mediaUrl: null },
  { category: "다음세대", date: "8월 중", title: "여름 다음세대 특별활동", body: "아이와 청소년이 말씀 안에서 즐겁게 성장하는 시간을 준비합니다.", detail: "아이와 청소년이 말씀 안에서 즐겁게 성장하는 시간을 준비합니다.", tone: "blue", mediaUrl: null },
  { category: "섬김", date: "상시 모집", title: "함께 섬길 봉사자를 기다립니다", body: "안내, 찬양, 식사 나눔 등 작은 손길로 함께해 주세요.", detail: "안내, 찬양, 식사 나눔 등 작은 손길로 함께해 주세요.", tone: "gold", mediaUrl: null },
  { category: "모임", date: "매주", title: "소그룹과 교제 모임 안내", body: "삶과 믿음을 편안하게 나누는 따뜻한 공동체 모임입니다.", detail: "삶과 믿음을 편안하게 나누는 따뜻한 공동체 모임입니다.", tone: "navy", mediaUrl: null },
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
                <h3>{item.title}</h3><p>{item.body}</p><span className="news-card__more">자세히 보기 <ArrowIcon /></span>
              </article>
            ))}
          </div>
        </section>

        <section className="notice-board" aria-labelledby="notice-board-title">
          <div className="content-section-title"><div><span>Notice board</span><h2 id="notice-board-title">알려드립니다</h2></div></div>
          <div className="notice-board__list">
            <article><time>07.31</time><span>공지</span><strong>주일예배에 처음 오시는 분을 위한 안내</strong><small>새가족</small></article>
            <article><time>07.29</time><span>모집</span><strong>예배 안내와 식사 나눔 봉사자 모집</strong><small>섬김</small></article>
            <article><time>07.27</time><span>안내</span><strong>다음세대 예배와 부서별 모임 안내</strong><small>다음세대</small></article>
          </div>
        </section>

        <section className="news-contact"><div><span>Share your story</span><h2>함께 나누고 싶은<br />교회소식이 있나요?</h2></div><p>관리 화면이 연결되면 담당자가 휴대전화로 소식을 작성하고 바로 게시할 수 있습니다.</p></section>
      </div>

      <ChurchFooter />
    </main>
  );
}
