"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  bulletinFromItem,
  splitLines,
  type ContentItem,
} from "../../lib/church-content";
import { loadClientPublishedContent } from "../../lib/client-content";
import {
  ArrowIcon,
  ChurchFooter,
  ChurchHeader,
  PageNotice,
} from "../ChurchShell";

const worshipOrder = [
  ["예배의 부름", "말씀 앞에 마음을 모읍니다"],
  ["찬양", "다 함께 기쁨으로 찬양합니다"],
  ["대표기도", "교회와 이웃을 위해 기도합니다"],
  ["성경봉독", "요한복음 6장 1–13절"],
  ["특별찬양", "찬양대"],
  ["말씀선포", "작은 나눔, 큰 은혜"],
  ["봉헌과 기도", "감사함으로 드립니다"],
  ["축도", "서광봉 담임목사"],
];

export default function BulletinExperience({
  initialItem,
}: {
  initialItem: ContentItem | null;
}) {
  const [item, setItem] = useState<ContentItem | null>(initialItem);

  useEffect(() => {
    let active = true;
    loadClientPublishedContent("bulletin").then(([latest]) => {
      if (active && latest) setItem(latest);
    });
    return () => {
      active = false;
    };
  }, []);

  const bulletin = useMemo(() => bulletinFromItem(item), [item]);
  const scheduleLines = useMemo(() => splitLines(bulletin.schedule), [bulletin.schedule]);
  const serviceLines = useMemo(() => splitLines(bulletin.service), [bulletin.service]);

  return (
    <main className="content-page bulletin-page">
      <ChurchHeader active="bulletin" />

      <section className="content-hero content-hero--bulletin">
        <div className="content-hero__topline">
          <p>Weekly bulletin</p>
          <span>{bulletin.volume}</span>
        </div>
        <div className="content-hero__main">
          <div>
            <p className="content-kicker">{bulletin.date}</p>
            <h1>이번 주 주보</h1>
            <p className="content-hero__lead">
              예배의 흐름과 교회 가족이 함께 기억할 소식을
              <br />한눈에 살펴보세요.
            </p>
          </div>
          <div className="bulletin-date" aria-label={bulletin.date}>
            <span>AUG</span>
            <strong>02</strong>
            <small>SUNDAY</small>
          </div>
        </div>
        <div className="content-hero__symbol" aria-hidden="true">
          <span>5</span><i /><span>2</span>
        </div>
      </section>

      <div className="content-wrap">
        <PageNotice />

        {item?.media_url ? (
          <section className="published-media" aria-label="등록된 주보 파일">
            {item.media_type === "image" ? (
              <img src={item.media_url} alt={`${bulletin.date} 주보`} />
            ) : (
              <div className="published-media__pdf">
                <div>
                  <span>Weekly bulletin PDF</span>
                  <h2>이번 주 주보 원본을 확인하세요.</h2>
                </div>
                <a href={item.media_url} target="_blank" rel="noreferrer">
                  PDF 주보 열기 <ArrowIcon />
                </a>
              </div>
            )}
          </section>
        ) : null}

        <section className="bulletin-grid" aria-label="이번 주 예배 안내">
          <article className="sermon-card">
            <div className="sermon-card__top"><span>Sunday message</span><small>주일 말씀</small></div>
            <div className="sermon-card__body">
              <p>{bulletin.passage}</p>
              <h2>{bulletin.title}</h2>
              <blockquote>우리가 가진 것이 작아 보여도 사랑으로 내어놓을 때, 하나님은 풍성하게 사용하십니다.</blockquote>
            </div>
            <div className="sermon-card__pastor"><span>말씀</span><strong>{bulletin.preacher}</strong></div>
          </article>

          <article className="worship-order" id="worship-order">
            <div className="content-section-title">
              <div><span>Order of worship</span><h2>주일예배 순서</h2></div>
              <small>예배 순서는 교회 사정에 따라 변경될 수 있습니다.</small>
            </div>
            <ol>
              {worshipOrder.map(([title, description], index) => (
                <li key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </li>
              ))}
            </ol>
          </article>
        </section>

        <section className="bulletin-info-grid" aria-label="이번 주 일정과 섬김">
          <article className="info-panel info-panel--warm">
            <div className="content-section-title"><div><span>This week</span><h2>이번 주 일정</h2></div></div>
            <ul className="schedule-list">
              {scheduleLines.map((line) => {
                const [date, ...title] = line.split(/\s+/);
                return (
                  <li key={line}>
                    <time>{date}</time>
                    <div><strong>{title.join(" ") || line}</strong><span>자세한 내용은 교회 안내로 확인해 주세요.</span></div>
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="info-panel">
            <div className="content-section-title"><div><span>Serve together</span><h2>이번 주 섬김</h2></div></div>
            <div className="service-table">
              {serviceLines.map((line) => {
                const [role, person = "담당자 안내 예정"] = line.split(/\s*[·|]\s*/, 2);
                return <div key={line}><span>{role}</span><strong>{person}</strong></div>;
              })}
            </div>
          </article>
        </section>

        <section className="bulletin-bottom">
          <div><p className="section-label">Church news</p><h2>예배 후, 교회소식도<br />함께 확인해 주세요.</h2></div>
          <Link className="content-link-button" href="/news">이번 주 교회소식 보기 <ArrowIcon /></Link>
        </section>
      </div>

      <ChurchFooter />
    </main>
  );
}
