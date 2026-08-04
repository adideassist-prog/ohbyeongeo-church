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

const monthNames = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

function splitPair(line: string) {
  const [title, description = ""] = line.split(/\s*\|\s*/, 2);
  return [title, description] as const;
}

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
  const worshipOrder = useMemo(
    () => splitLines(bulletin.worshipOrder).map(splitPair),
    [bulletin.worshipOrder],
  );
  const scheduleLines = useMemo(() => splitLines(bulletin.schedule), [bulletin.schedule]);
  const serviceLines = useMemo(() => splitLines(bulletin.service), [bulletin.service]);
  const prayerLines = useMemo(
    () => splitLines(bulletin.prayerPoints),
    [bulletin.prayerPoints],
  );
  const announcementLines = useMemo(
    () => splitLines(bulletin.announcements),
    [bulletin.announcements],
  );
  const missionItems = useMemo(
    () => splitLines(bulletin.missionLetter).map(splitPair),
    [bulletin.missionLetter],
  );
  const domesticPartners = useMemo(
    () => splitLines(bulletin.partnersDomestic),
    [bulletin.partnersDomestic],
  );
  const overseasPartners = useMemo(
    () => splitLines(bulletin.partnersOverseas),
    [bulletin.partnersOverseas],
  );
  const militaryPartners = useMemo(
    () => splitLines(bulletin.partnerMilitary),
    [bulletin.partnerMilitary],
  );
  const institutionPartners = useMemo(
    () => splitLines(bulletin.partnerInstitutions),
    [bulletin.partnerInstitutions],
  );
  const monthlyPrayer = useMemo(
    () => splitLines(bulletin.monthlyPrayer).map(splitPair),
    [bulletin.monthlyPrayer],
  );
  const offeringCommittee = useMemo(
    () => splitLines(bulletin.offeringCommittee),
    [bulletin.offeringCommittee],
  );
  const churchTeam = useMemo(
    () => splitLines(bulletin.churchTeam).map(splitPair),
    [bulletin.churchTeam],
  );

  const [year = "2026", month = "08", day = "02"] =
    (item?.content_date || "2026-08-02").split("-");
  const monthLabel = monthNames[Math.max(0, Number(month) - 1)] || "AUG";

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
              <br />읽기 편한 웹 주보로 전합니다.
            </p>
          </div>
          <div className="bulletin-date" aria-label={bulletin.date}>
            <span>{monthLabel}</span>
            <strong>{day}</strong>
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

        <section className="bulletin-editorial" aria-labelledby="bulletin-theme-title">
          <div className="bulletin-editorial__art">
            <img
              src="/images/hero-warm-symbolic.webp"
              alt="보리떡 다섯 개와 물고기 두 마리, 펼쳐진 성경을 담은 따뜻한 이미지"
            />
          </div>
          <div className="bulletin-editorial__copy">
            <span>{year} · {monthLabel}</span>
            <p>더 큰 선교를 꿈꾸며</p>
            <h2 id="bulletin-theme-title">예배 하는 자들</h2>
            <div>
              <strong>{bulletin.title}</strong>
              <small>{bulletin.passage}</small>
            </div>
            <blockquote>{bulletin.verse}</blockquote>
            <p className="bulletin-editorial__church">대한예수교 장로회 오병이어교회</p>
          </div>
        </section>

        <section className="bulletin-grid" aria-label="이번 주 예배 안내">
          <article className="sermon-card">
            <div className="sermon-card__top"><span>Sunday message</span><small>주일 말씀</small></div>
            <div className="sermon-card__body">
              <p>{bulletin.passage}</p>
              <h2>{bulletin.title}</h2>
              <blockquote>{bulletin.verse}</blockquote>
            </div>
            <div className="sermon-card__pastor"><span>말씀</span><strong>{bulletin.preacher}</strong></div>
          </article>

          <article className="worship-order" id="worship-order">
            <div className="content-section-title">
              <div><span>Worship &amp; praise</span><h2>주일예배 순서</h2></div>
              <small>{bulletin.date}</small>
            </div>
            <ol>
              {worshipOrder.map(([title, description], index) => (
                <li key={`${title}-${index}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{title}</strong>
                  <p>{description || "다 같이"}</p>
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

        <section className="bulletin-community" aria-label="기도 제목과 교회소식">
          <article className="bulletin-prayer">
            <div className="content-section-title">
              <div><span>Prayer points</span><h2>기도 제목</h2></div>
              <small>한마음으로 교회와 선교를 위해 기도해 주세요.</small>
            </div>
            <ol>
              {prayerLines.map((line, index) => (
                <li key={line}><span>{String(index + 1).padStart(2, "0")}</span><p>{line}</p></li>
              ))}
            </ol>
          </article>
          <article className="bulletin-announcements">
            <div className="content-section-title"><div><span>Church news</span><h2>교회소식</h2></div></div>
            <ol>
              {announcementLines.map((line, index) => (
                <li key={line}><b>{index + 1}</b><p>{line}</p></li>
              ))}
            </ol>
            <div className="bulletin-mission-note">
              <span>8월 선교편지</span>
              <strong>베트남 · 최민철 선교사</strong>
              <p>Mission 26 선교대회와 V국 캠퍼스 사역을 위해 함께 기도합니다.</p>
            </div>
          </article>
        </section>

        <section className="mission-letter" aria-labelledby="mission-letter-title">
          <header className="mission-letter__header">
            <div>
              <span>Mission letter · August</span>
              <h2 id="mission-letter-title">8월 선교편지</h2>
              <p>베트남 · 최민철 선교사님</p>
            </div>
            <svg className="mission-flame" viewBox="0 0 72 92" aria-hidden="true">
              <path d="M39 4c4 20-10 25-10 40 0 8 5 13 11 16-2-9 4-14 11-22 2 7 9 13 9 25 0 15-10 25-24 25S11 78 11 62c0-20 17-29 28-58Z" />
              <path d="M36 84c-7-2-12-8-12-16 0-8 5-13 10-18-1 9 4 11 7 17 4-5 7-9 8-15 5 6 8 11 8 18 0 9-8 16-21 14Z" />
            </svg>
          </header>
          <div className="mission-letter__items">
            {missionItems.map(([title, body], index) => (
              <article key={`${title}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{title}</h3><p>{body}</p></div>
              </article>
            ))}
          </div>
          <div className="mission-letter__closing">
            {bulletin.missionClosing.split(/\n\s*\n/).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <strong>{bulletin.missionSignature}</strong>
          </div>
        </section>

        <section className="partner-section" aria-labelledby="partner-title">
          <header className="partner-section__header">
            <span>Together in mission</span>
            <h2 id="partner-title">오병이어교회가 협력하는 곳</h2>
            <p>국내와 세계 곳곳의 교회·선교사·기관과 함께 기도합니다.</p>
          </header>
          <div className="partner-section__grid">
            <PartnerCard label="01 · 국내" items={domesticPartners} className="partner-card--domestic" />
            <PartnerCard label="02 · 해외" items={overseasPartners} className="partner-card--overseas" />
            <PartnerCard label="03 · 군선교" items={militaryPartners} className="partner-card--compact" />
            <PartnerCard label="04 · 기관" items={institutionPartners} className="partner-card--compact" />
          </div>
        </section>

        <section className="bulletin-people" aria-label="8월 예배위원과 교회 섬김이">
          <article className="monthly-committee">
            <div className="content-section-title"><div><span>August service</span><h2>8월 예배 위원 안내</h2></div></div>
            <div className="monthly-committee__table">
              {monthlyPrayer.map(([date, person]) => (
                <div key={date}><time>{date}</time><span>대표기도</span><strong>{person}</strong></div>
              ))}
            </div>
            <div className="monthly-committee__offering">
              <span>헌금위원</span>
              {offeringCommittee.map((line) => <strong key={line}>{line}</strong>)}
            </div>
          </article>
          <article className="church-team">
            <div className="content-section-title"><div><span>Ohbyeongeo church</span><h2>교회와 섬김이</h2></div></div>
            <dl>
              {churchTeam.map(([role, people], index) => (
                <div key={`${role}-${index}`}><dt>{role}</dt><dd>{people}</dd></div>
              ))}
            </dl>
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

function PartnerCard({
  label,
  items,
  className,
}: {
  label: string;
  items: string[];
  className: string;
}) {
  return (
    <article className={`partner-card ${className}`}>
      <span>{label}</span>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </article>
  );
}
