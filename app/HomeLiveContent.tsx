"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  bulletinFromItem,
  newsFromItem,
  type BulletinDraft,
  type NewsDraft,
  type WordDraft,
  wordFromItem,
} from "../lib/church-content";
import { loadClientPublishedContent } from "../lib/client-content";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 7 8 5-8 5V7Z" />
    </svg>
  );
}

export default function HomeLiveContent({
  initialBulletin,
  initialWord,
  initialNews,
}: {
  initialBulletin: BulletinDraft;
  initialWord: WordDraft;
  initialNews: NewsDraft;
}) {
  const [bulletin, setBulletin] = useState(initialBulletin);
  const [word, setWord] = useState(initialWord);
  const [news, setNews] = useState(initialNews);

  useEffect(() => {
    let active = true;
    Promise.all([
      loadClientPublishedContent("bulletin"),
      loadClientPublishedContent("daily_word"),
      loadClientPublishedContent("news"),
    ]).then(([[bulletinItem], [wordItem], [newsItem]]) => {
      if (!active) return;
      setBulletin(bulletinFromItem(bulletinItem));
      setWord(wordFromItem(wordItem));
      setNews(newsFromItem(newsItem));
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className="message__feature">
        <div className="message__symbol" aria-hidden="true">
          <span>5</span>
          <i />
          <span>2</span>
        </div>
        <div className="message__copy">
          <span className="message__category">오늘의 말씀</span>
          <h3>{word.title}</h3>
          <p>{word.meditation}</p>
          <div className="message__meta">
            <span>{word.passage}</span>
            <span>{word.date}</span>
          </div>
        </div>
        <Link className="message__play" href="/today" aria-label="오늘의 말씀 보기">
          <PlayIcon />
          <span>오늘의 말씀 보기</span>
        </Link>
      </div>

      <div className="message__cards">
        <article>
          <span>Church news</span>
          <h3>{news.title}</h3>
          <p>{news.summary}</p>
          <small>{news.date}</small>
        </article>
        <article>
          <span>Weekly bulletin</span>
          <h3>{bulletin.title}</h3>
          <p>{bulletin.passage} · {bulletin.preacher}</p>
          <small>{bulletin.date}</small>
        </article>
        <article>
          <span>Prayer request</span>
          <h3>기도 나눔</h3>
          <p>함께 기도할 제목을 나누고 서로를 위해 마음을 모읍니다.</p>
          <small>서로를 위해 함께 기도합니다</small>
        </article>
      </div>
    </>
  );
}
