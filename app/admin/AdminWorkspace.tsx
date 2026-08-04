"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  bulletinFromItem,
  defaultBulletin,
  defaultNews,
  defaultWord,
  mergePublishedWords,
  newsFromItem,
  type BulletinDraft,
  type ContentItem,
  type ContentType,
  type NewsDraft,
  type WordDraft,
  wordFromItem,
} from "../../lib/church-content";
import { createClient } from "../../utils/supabase/client";
import { LogoMark } from "../ChurchShell";
import AdminCommentsPanel from "./AdminCommentsPanel";

type AdminSection = "home" | "bulletin" | "today" | "news" | "comments";

const sectionLabels: Record<AdminSection, string> = {
  home: "관리 홈",
  bulletin: "이번 주 주보",
  today: "오늘의 말씀",
  news: "교회소식",
  comments: "댓글 관리",
};

function DashboardIcon({ name }: { name: AdminSection }) {
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 11 12 4l8 7v9H4v-9Z" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (name === "bulletin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3h9l3 3v15H6V3Z" />
        <path d="M14 3v4h4M9 11h6M9 15h6" />
      </svg>
    );
  }

  if (name === "today") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23V5.5Z" />
        <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v18h4.5A3.5 3.5 0 0 1 20 23V5.5Z" />
      </svg>
    );
  }

  if (name === "comments") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        <path d="M7.5 8.5h9M7.5 12.5h6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v14H4V5Z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

function StatusDot() {
  return <span className="admin-status-dot" aria-hidden="true" />;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="admin-field">
      <span>
        <strong>{label}</strong>
        {hint ? <small>{hint}</small> : null}
      </span>
      {children}
    </label>
  );
}

function PreviewCard({
  section,
  bulletin,
  word,
  news,
  mediaUrl,
  mediaType,
}: {
  section: AdminSection;
  bulletin: BulletinDraft;
  word: WordDraft;
  news: NewsDraft;
  mediaUrl?: string;
  mediaType?: "image" | "pdf" | null;
}) {
  if (section === "bulletin") {
    return (
      <div className="admin-preview-card admin-preview-card--bulletin">
        {mediaUrl && mediaType === "image" ? (
          <img className="admin-preview-card__media" src={mediaUrl} alt="선택한 주보 미리보기" />
        ) : null}
        <div className="admin-preview-card__eyebrow">
          WEEKLY BULLETIN · {bulletin.volume}
        </div>
        <p>{bulletin.date}</p>
        <h3>{bulletin.title || "말씀 제목을 입력해 주세요"}</h3>
        <blockquote>{bulletin.passage}</blockquote>
        <strong>{bulletin.preacher}</strong>
        {mediaUrl && mediaType === "pdf" ? <small>PDF 주보가 함께 게시됩니다.</small> : null}
      </div>
    );
  }

  if (section === "today") {
    return (
      <div className="admin-preview-card admin-preview-card--word">
        <div className="admin-preview-card__eyebrow">
          TODAY&apos;S WORD · {word.date}
        </div>
        <blockquote>“{word.verse || "성경 말씀을 입력해 주세요"}”</blockquote>
        <p>{word.passage}</p>
        <h3>{word.title}</h3>
        <small>{word.question}</small>
      </div>
    );
  }

  return (
    <div className="admin-preview-card admin-preview-card--news">
      {mediaUrl ? <img className="admin-preview-card__media" src={mediaUrl} alt="선택한 교회소식 사진 미리보기" /> : null}
      <div className="admin-preview-card__eyebrow">
        {news.category} · {news.date}
      </div>
      <h3>{news.title || "소식 제목을 입력해 주세요"}</h3>
      <p>{news.summary}</p>
      <span>자세히 보기 →</span>
    </div>
  );
}

function toDatabaseDate(value: string) {
  const parts = value.match(/(20\d{2})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!parts) return new Date().toISOString().slice(0, 10);
  return `${parts[1]}-${parts[2].padStart(2, "0")}-${parts[3].padStart(2, "0")}`;
}

function toDisplayDate(value: string) {
  const date = new Date(`${value}T12:00:00+09:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
    timeZone: "Asia/Seoul",
  })
    .format(date)
    .replace(/\. /g, ". ");
}

function uniqueDailyWords(items: ContentItem[]) {
  const seenDates = new Set<string>();
  const uniqueItems = items
    .filter((item) => item.content_type === "daily_word")
    .sort((a, b) => b.content_date.localeCompare(a.content_date))
    .filter((item) => {
      if (seenDates.has(item.content_date)) return false;
      seenDates.add(item.content_date);
      return true;
    });

  return mergePublishedWords(uniqueItems);
}

function safeFilename(filename: string) {
  const extension = filename.includes(".") ? `.${filename.split(".").pop()}` : "";
  const basename = filename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-");
  return `${basename || "church-file"}${extension.toLowerCase()}`;
}

function sectionToContentType(section: AdminSection): ContentType | null {
  if (section === "bulletin") return "bulletin";
  if (section === "today") return "daily_word";
  if (section === "news") return "news";
  return null;
}

export function AdminConnectionUnavailable() {
  return (
    <main className="admin-page admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-connection-title">
        <div className="admin-login-brand">
          <LogoMark />
          <div>
            <strong>오병이어교회</strong>
            <span>홈페이지 관리</span>
          </div>
        </div>
        <div className="admin-login-copy">
          <p>ADMIN</p>
          <h1 id="admin-connection-title">관리 화면 연결을<br />확인하고 있어요.</h1>
          <span>잠시 후 새로고침해 주세요. 문제가 계속되면 홈페이지 관리자에게 알려주세요.</span>
        </div>
      </section>
    </main>
  );
}

export default function AdminWorkspace({
  supabaseUrl,
  supabasePublishableKey,
}: {
  supabaseUrl?: string;
  supabasePublishableKey?: string;
}) {
  const supabase = useMemo(
    () => {
      try {
        return createClient({
          url: supabaseUrl,
          publishableKey: supabasePublishableKey,
        });
      } catch {
        // The render below checks this sentinel before any editor action can
        // run. Keeping the client type stable avoids nullable checks in every
        // authenticated operation.
        return null as never;
      }
    },
    [supabasePublishableKey, supabaseUrl],
  );
  const [authReady, setAuthReady] = useState(() => !supabase);
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);
  const [section, setSection] = useState<AdminSection>("home");
  const [previewOpen, setPreviewOpen] = useState(true);
  const [notice, setNotice] = useState("");
  const [lastSavedLabel, setLastSavedLabel] = useState("아직 저장 기록 없음");
  const [bulletin, setBulletin] = useState<BulletinDraft>({ ...defaultBulletin });
  const [word, setWord] = useState<WordDraft>({ ...defaultWord });
  const [dailyWords, setDailyWords] = useState<ContentItem[]>([]);
  const [news, setNews] = useState<NewsDraft>({ ...defaultNews });
  const [newsFile, setNewsFile] = useState<File | null>(null);
  const [newsMedia, setNewsMedia] = useState<{ url: string; type: "image" | "pdf" } | null>(null);

  useEffect(() => {
    if (!supabase) return;

    let active = true;

    const loadContent = async () => {
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .order("published_at", { ascending: false, nullsFirst: false });

      if (!active || error || !data) return;

      const items = data as ContentItem[];
      const latestBulletin = items.find((item) => item.content_type === "bulletin");
      const latestWord = items.find((item) => item.content_type === "daily_word");
      const latestNews = items.find((item) => item.content_type === "news");

      setBulletin(bulletinFromItem(latestBulletin));
      setWord(wordFromItem(latestWord));
      setDailyWords(uniqueDailyWords(items));
      setNews(newsFromItem(latestNews));

      if (latestNews?.media_url && latestNews.media_type) {
        setNewsMedia({ url: latestNews.media_url, type: latestNews.media_type });
      }

      const mostRecent = items[0];
      if (mostRecent?.updated_at) {
        setLastSavedLabel(
          new Intl.DateTimeFormat("ko-KR", {
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }).format(new Date(mostRecent.updated_at)),
        );
      }
    };

    const acceptSession = async (session: Session | null) => {
      if (!session) {
        if (active) {
          setSignedIn(false);
          setUserEmail("");
          setAuthReady(true);
        }
        return;
      }

      const { data: isAdmin, error } = await supabase.rpc("is_admin");
      if (!active) return;

      if (error || !isAdmin) {
        await supabase.auth.signOut();
        setSignedIn(false);
        setLoginError("이 계정에는 홈페이지 관리자 권한이 없습니다.");
        setAuthReady(true);
        return;
      }

      setSignedIn(true);
      setUserEmail(session.user.email ?? "관리자");
      setLoginError("");
      setAuthReady(true);
      await loadContent();
    };

    supabase.auth
      .getSession()
      .then(({ data }) => acceptSession(data.session))
      .catch(() => {
        if (!active) return;
        setSignedIn(false);
        setLoginError("관리자 연결을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setAuthReady(true);
      });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => void acceptSession(session), 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setLoginError("");

    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError("이메일 또는 비밀번호를 다시 확인해 주세요.");
      setBusy(false);
      return;
    }

    setPassword("");
    setBusy(false);
  };

  const signOut = async () => {
    setBusy(true);
    if (!supabase) return;
    await supabase.auth.signOut();
    setSection("home");
    setBusy(false);
  };

  const navigate = (next: AdminSection) => {
    setSection(next);
    setPreviewOpen(next !== "home");
    setNotice("");
  };

  const startNewWord = () => {
    const today = new Date(Date.now() + 9 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    setWord({
      date: toDisplayDate(today),
      passage: "",
      verse: "",
      title: "",
      meditation: "",
      question: "",
      prayer: "",
    });
    setNotice("새 말씀을 입력할 수 있도록 빈 화면을 준비했어요.");
  };

  const editSavedWord = (item: ContentItem) => {
    setWord(wordFromItem(item));
    setNotice(`${item.content_date} 말씀을 불러왔어요. 수정 후 게시하면 같은 날짜의 내용이 바뀝니다.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const uploadFile = async (contentType: ContentType, file: File) => {
    const path = `${contentType}/${Date.now()}-${safeFilename(file.name)}`;
    const { error } = await supabase.storage.from("church-media").upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

    if (error) throw error;
    const { data } = supabase.storage.from("church-media").getPublicUrl(path);
    return {
      url: data.publicUrl,
      type: file.type === "application/pdf" ? ("pdf" as const) : ("image" as const),
    };
  };

  const publish = async () => {
    const contentType = sectionToContentType(section);
    if (!contentType) return;

    setBusy(true);
    setNotice("게시 내용을 안전하게 저장하고 있어요…");

    try {
      let media = section === "news" ? newsMedia : null;
      const bulletinDraft = bulletin;
      const selectedFile = section === "news" ? newsFile : null;
      if (selectedFile) media = await uploadFile(contentType, selectedFile);

      const draft = contentType === "bulletin" ? bulletinDraft : contentType === "daily_word" ? word : news;
      const contentDate = toDatabaseDate(draft.date);
      const now = new Date().toISOString();

      const record = {
        content_type: contentType,
        title: draft.title,
        content_date: contentDate,
        status: "published" as const,
        data: draft,
        media_url: media?.url ?? null,
        media_type: media?.type ?? null,
        is_featured: contentType !== "news",
        published_at: now,
      };

      let savedItem: ContentItem | null = null;

      if (contentType === "daily_word") {
        const { error: revealError } = await supabase
          .from("content_items")
          .update({ status: "published", is_featured: false })
          .eq("content_type", "daily_word")
          .in("status", ["published", "archived"]);
        if (revealError) throw revealError;

        const existing = dailyWords.find((item) => item.content_date === contentDate);
        const persistedExisting = existing && !existing.id.startsWith("default-daily-word-");
        const result = persistedExisting
          ? await supabase
              .from("content_items")
              .update({ ...record, is_featured: true })
              .eq("id", existing.id)
              .select("*")
              .single()
          : await supabase
              .from("content_items")
              .insert({
                ...record,
                slug: `daily_word-${contentDate}`,
                is_featured: true,
              })
              .select("*")
              .single();

        if (result.error) throw result.error;
        savedItem = result.data as ContentItem;
        setDailyWords((current) =>
          uniqueDailyWords([
            savedItem as ContentItem,
            ...current.map((item) => ({
              ...item,
              status: "published" as const,
              is_featured: false,
            })),
          ]),
        );
      } else {
        const { data: inserted, error } = await supabase
          .from("content_items")
          .insert({ ...record, slug: `${contentType}-${Date.now()}` })
          .select("*")
          .single();

        if (error) throw error;
        savedItem = inserted as ContentItem;
      }

      if (contentType === "bulletin" && savedItem?.id) {
        const { error: archiveError } = await supabase
          .from("content_items")
          .update({ status: "archived" })
          .eq("content_type", contentType)
          .eq("status", "published")
          .neq("id", savedItem.id);
        if (archiveError) throw archiveError;
      }

      if (section === "bulletin") {
        setBulletin(bulletinDraft);
      }
      if (section === "news") {
        setNewsFile(null);
        setNewsMedia(media);
      }

      setLastSavedLabel(
        new Intl.DateTimeFormat("ko-KR", {
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date()),
      );
      setNotice("게시가 완료됐어요. 홈페이지에 새 내용이 반영되었습니다.");
    } catch (error) {
      console.error(error);
      setNotice("저장 중 문제가 생겼어요. 잠시 후 다시 눌러 주세요.");
    } finally {
      setBusy(false);
    }
  };

  if (!supabase) {
    return <AdminConnectionUnavailable />;
  }

  if (!authReady) {
    return (
      <main className="admin-page admin-login-page">
        <div className="admin-login-loading" role="status">관리 화면을 준비하고 있어요…</div>
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className="admin-page admin-login-page">
        <section className="admin-login-card" aria-labelledby="admin-login-title">
          <div className="admin-login-brand">
            <LogoMark />
            <div>
              <strong>오병이어교회</strong>
              <span>홈페이지 관리</span>
            </div>
          </div>
          <div className="admin-login-copy">
            <p>ADMIN</p>
            <h1 id="admin-login-title">교회 소식을<br />쉽게 전해보세요.</h1>
            <span>주보와 말씀, 교회소식을 휴대전화에서도 편하게 관리할 수 있습니다.</span>
          </div>
          <form className="admin-login-form" onSubmit={signIn} aria-label="관리자 로그인">
            <Field label="관리자 이메일">
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            </Field>
            <Field label="비밀번호">
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
            </Field>
            {loginError ? <p className="admin-login-error" role="alert">{loginError}</p> : null}
            <button type="submit" disabled={busy}>{busy ? "로그인 중…" : "관리자 로그인"}</button>
            <small>Supabase에서 만든 관리자 이메일과 비밀번호를 입력하세요.</small>
          </form>
        </section>
      </main>
    );
  }

  const selectedMedia = section === "news" ? newsMedia : null;
  const selectedMediaUrl = selectedMedia?.url;

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <LogoMark />
          <div><strong>오병이어교회</strong><span>홈페이지 관리</span></div>
        </div>
        <nav aria-label="관리 메뉴">
          {(Object.keys(sectionLabels) as AdminSection[]).map((item) => (
            <button key={item} type="button" className={section === item ? "is-active" : ""} onClick={() => navigate(item)}>
              <DashboardIcon name={item} />
              <span>{sectionLabels[item]}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar__help">
          <span>로그인 계정</span>
          <p>{userEmail}</p>
        </div>
      </aside>

      <section className="admin-workspace">
        <header className="admin-topbar">
          <div><p>오병이어교회 홈페이지</p><strong>{sectionLabels[section]}</strong></div>
          <div className="admin-topbar__actions">
            <a href="/" target="_blank" rel="noreferrer">홈페이지 보기 ↗</a>
            <button type="button" onClick={signOut} disabled={busy} aria-label="관리자 로그아웃">나가기</button>
          </div>
        </header>

        <div className="admin-mobile-tabs" role="navigation" aria-label="모바일 관리 메뉴">
          {(Object.keys(sectionLabels) as AdminSection[]).map((item) => (
            <button key={item} type="button" className={section === item ? "is-active" : ""} onClick={() => navigate(item)}>{sectionLabels[item]}</button>
          ))}
        </div>

        <div className="admin-stage-banner admin-stage-banner--connected" role="status">
          <StatusDot />
          <div><strong>저장공간이 연결됐어요</strong><span>관리자만 내용을 수정할 수 있고, 게시한 내용은 홈페이지에 바로 표시됩니다.</span></div>
        </div>

        {section === "home" ? (
          <section className="admin-dashboard" aria-labelledby="admin-dashboard-title">
            <div className="admin-dashboard__heading">
              <div><p>{new Intl.DateTimeFormat("ko-KR", { dateStyle: "full" }).format(new Date())}</p><h1 id="admin-dashboard-title">안녕하세요.<br />무엇을 수정할까요?</h1></div>
              <span>최근 저장 · {lastSavedLabel}</span>
            </div>

            <div className="admin-content-cards">
              {(["bulletin", "today", "news", "comments"] as AdminSection[]).map((item, index) => (
                <button key={item} type="button" onClick={() => navigate(item)} className={`admin-content-card admin-content-card--${item}`}>
                  <span className="admin-content-card__number">0{index + 1}</span>
                  <DashboardIcon name={item} />
                  <strong>{sectionLabels[item]}</strong>
                  <small>{item === "bulletin" ? "예배 순서·선교편지·섬김" : item === "today" ? "성경 구절·묵상·기도" : item === "news" ? "공지·행사·사진" : "댓글 공개·숨김·삭제"}</small>
                  <i>{item === "comments" ? "확인하기 →" : "수정하기 →"}</i>
                </button>
              ))}
            </div>

            <div className="admin-ready-panel admin-ready-panel--connected">
              <div><span>사용 방법</span><h2>내용을 입력하고<br />게시하기만 누르세요.</h2></div>
              <ol>
                <li><b>1</b><span><strong>내용 수정</strong><small>글과 사진을 편하게 입력</small></span></li>
                <li><b>2</b><span><strong>미리보기 확인</strong><small>현재 디자인 그대로 확인</small></span></li>
                <li><b>3</b><span><strong>홈페이지 게시</strong><small>성도들에게 바로 공개</small></span></li>
              </ol>
            </div>
          </section>
        ) : section === "comments" ? (
          <AdminCommentsPanel
            supabaseUrl={supabaseUrl}
            supabasePublishableKey={supabasePublishableKey}
          />
        ) : (
          <section className="admin-editor" aria-label={`${sectionLabels[section]} 편집`}>
            <div className="admin-editor__heading">
              <div><span>{section === "news" ? "새 소식 작성" : section === "today" ? "날짜별 말씀 작성" : "현재 게시 내용"}</span><h1>{sectionLabels[section]} 수정</h1><p>{section === "today" ? "날짜마다 새 말씀을 게시해도 지난 말씀과 댓글은 그대로 보관됩니다." : "필요한 내용만 바꾸고 오른쪽에서 실제 화면을 확인하세요."}</p></div>
              <div className="admin-editor__heading-actions">
                {section === "today" ? <button type="button" className="admin-button admin-button--ghost" onClick={startNewWord}>+ 새 말씀 작성</button> : null}
                <button type="button" className="admin-button admin-button--ghost" onClick={() => setPreviewOpen((value) => !value)}>{previewOpen ? "미리보기 닫기" : "미리보기 열기"}</button>
                <button type="button" className="admin-button admin-button--primary" onClick={publish} disabled={busy}>{busy ? "게시 중…" : "게시하기"}</button>
              </div>
            </div>

            {notice ? <div className="admin-toast" role="status">{notice}</div> : null}

            <div className={`admin-editor__layout${previewOpen ? " has-preview" : ""}`}>
              <form className="admin-form" onSubmit={(event) => event.preventDefault()}>
                {section === "bulletin" ? (
                  <>
                    <div className="admin-form__group">
                      <div className="admin-form__group-title"><b>01</b><span><strong>기본 정보</strong><small>주보 첫 화면에 표시됩니다.</small></span></div>
                      <div className="admin-field-grid">
                        <Field label="주보 날짜"><input value={bulletin.date} onChange={(event) => setBulletin({ ...bulletin, date: event.target.value })} /></Field>
                        <Field label="주보 호수"><input value={bulletin.volume} onChange={(event) => setBulletin({ ...bulletin, volume: event.target.value })} /></Field>
                        <Field label="성경 본문"><input value={bulletin.passage} onChange={(event) => setBulletin({ ...bulletin, passage: event.target.value })} /></Field>
                        <Field label="말씀 제목"><input value={bulletin.title} onChange={(event) => setBulletin({ ...bulletin, title: event.target.value })} /></Field>
                        <Field label="설교자"><input value={bulletin.preacher} onChange={(event) => setBulletin({ ...bulletin, preacher: event.target.value })} /></Field>
                      </div>
                      <Field label="말씀 본문 요약" hint="말씀 카드에 인용문으로 표시됩니다."><textarea rows={4} value={bulletin.verse} onChange={(event) => setBulletin({ ...bulletin, verse: event.target.value })} /></Field>
                    </div>
                    <div className="admin-form__group">
                      <div className="admin-form__group-title"><b>02</b><span><strong>이번 주 안내</strong><small>한 줄에 한 항목씩 입력하세요.</small></span></div>
                      <Field label="예배 순서" hint="항목 | 담당자 형식으로 한 줄씩 입력"><textarea rows={9} value={bulletin.worshipOrder} onChange={(event) => setBulletin({ ...bulletin, worshipOrder: event.target.value })} /></Field>
                      <Field label="기도 제목"><textarea rows={7} value={bulletin.prayerPoints} onChange={(event) => setBulletin({ ...bulletin, prayerPoints: event.target.value })} /></Field>
                      <Field label="교회소식"><textarea rows={7} value={bulletin.announcements} onChange={(event) => setBulletin({ ...bulletin, announcements: event.target.value })} /></Field>
                    </div>
                    <div className="admin-form__group">
                      <div className="admin-form__group-title"><b>03</b><span><strong>선교편지</strong><small>제목 | 본문 형식으로 한 줄씩 입력하세요.</small></span></div>
                      <Field label="선교편지 네 가지 소식" hint="한 줄마다 제목 | 본문"><textarea rows={18} value={bulletin.missionLetter} onChange={(event) => setBulletin({ ...bulletin, missionLetter: event.target.value })} /></Field>
                      <Field label="선교편지 맺음말" hint="문단 사이는 한 줄을 비워 주세요."><textarea rows={10} value={bulletin.missionClosing} onChange={(event) => setBulletin({ ...bulletin, missionClosing: event.target.value })} /></Field>
                      <Field label="선교편지 서명"><input value={bulletin.missionSignature} onChange={(event) => setBulletin({ ...bulletin, missionSignature: event.target.value })} /></Field>
                    </div>
                    <div className="admin-form__group">
                      <div className="admin-form__group-title"><b>04</b><span><strong>협력 사역</strong><small>한 줄에 한 곳씩 입력하세요.</small></span></div>
                      <Field label="국내 협력"><textarea rows={10} value={bulletin.partnersDomestic} onChange={(event) => setBulletin({ ...bulletin, partnersDomestic: event.target.value })} /></Field>
                      <Field label="해외 협력"><textarea rows={18} value={bulletin.partnersOverseas} onChange={(event) => setBulletin({ ...bulletin, partnersOverseas: event.target.value })} /></Field>
                      <Field label="군선교"><textarea rows={3} value={bulletin.partnerMilitary} onChange={(event) => setBulletin({ ...bulletin, partnerMilitary: event.target.value })} /></Field>
                      <Field label="협력 기관"><textarea rows={4} value={bulletin.partnerInstitutions} onChange={(event) => setBulletin({ ...bulletin, partnerInstitutions: event.target.value })} /></Field>
                    </div>
                    <div className="admin-form__group">
                      <div className="admin-form__group-title"><b>05</b><span><strong>예배위원과 교회 섬김이</strong><small>원본 주보의 이름과 순서를 그대로 관리합니다.</small></span></div>
                      <Field label="월간 대표기도" hint="날짜 | 담당자 형식으로 한 줄씩 입력"><textarea rows={6} value={bulletin.monthlyPrayer} onChange={(event) => setBulletin({ ...bulletin, monthlyPrayer: event.target.value })} /></Field>
                      <Field label="헌금위원"><textarea rows={3} value={bulletin.offeringCommittee} onChange={(event) => setBulletin({ ...bulletin, offeringCommittee: event.target.value })} /></Field>
                      <Field label="교회와 섬김이" hint="직분 | 이름 형식으로 한 줄씩 입력"><textarea rows={8} value={bulletin.churchTeam} onChange={(event) => setBulletin({ ...bulletin, churchTeam: event.target.value })} /></Field>
                    </div>
                  </>
                ) : null}

                {section === "today" ? (
                  <>
                    <div className="admin-form__group">
                      <div className="admin-form__group-title"><b>01</b><span><strong>오늘의 성경 말씀</strong><small>날짜와 말씀을 입력하세요.</small></span></div>
                      <div className="admin-field-grid">
                        <Field label="날짜" hint="날짜별로 각각 보관됩니다."><input type="date" value={toDatabaseDate(word.date)} onChange={(event) => setWord({ ...word, date: toDisplayDate(event.target.value) })} /></Field>
                        <Field label="성경 구절"><input value={word.passage} onChange={(event) => setWord({ ...word, passage: event.target.value })} /></Field>
                      </div>
                      <Field label="말씀 내용"><textarea rows={4} value={word.verse} onChange={(event) => setWord({ ...word, verse: event.target.value })} /></Field>
                    </div>
                    <div className="admin-form__group">
                      <div className="admin-form__group-title"><b>02</b><span><strong>묵상과 기도</strong><small>성도들에게 전할 내용을 입력하세요.</small></span></div>
                      <Field label="묵상 제목"><input value={word.title} onChange={(event) => setWord({ ...word, title: event.target.value })} /></Field>
                      <Field label="묵상 내용"><textarea rows={7} value={word.meditation} onChange={(event) => setWord({ ...word, meditation: event.target.value })} /></Field>
                      <Field label="묵상 질문"><input value={word.question} onChange={(event) => setWord({ ...word, question: event.target.value })} /></Field>
                      <Field label="오늘의 기도"><textarea rows={5} value={word.prayer} onChange={(event) => setWord({ ...word, prayer: event.target.value })} /></Field>
                    </div>
                    <div className="admin-word-history">
                      <div className="admin-word-history__heading">
                        <div><span>말씀 보관함</span><strong>지난 말씀 {dailyWords.length}개</strong></div>
                        <small>날짜를 누르면 불러와 다시 수정할 수 있어요.</small>
                      </div>
                      <div className="admin-word-history__list">
                        {dailyWords.length > 0 ? dailyWords.map((item) => {
                          const savedWord = wordFromItem(item);
                          const isEditing = toDatabaseDate(word.date) === item.content_date;
                          return (
                            <button key={item.id} type="button" className={isEditing ? "is-active" : ""} onClick={() => editSavedWord(item)}>
                              <time>{item.content_date}</time>
                              <strong>{savedWord.passage}</strong>
                              <span>{savedWord.title}</span>
                            </button>
                          );
                        }) : <p>첫 말씀을 게시하면 여기에 날짜별로 쌓입니다.</p>}
                      </div>
                    </div>
                  </>
                ) : null}

                {section === "news" ? (
                  <>
                    <div className="admin-form__group">
                      <div className="admin-form__group-title"><b>01</b><span><strong>소식 기본 정보</strong><small>새로운 소식 카드에 표시됩니다.</small></span></div>
                      <div className="admin-field-grid">
                        <Field label="분류"><select value={news.category} onChange={(event) => setNews({ ...news, category: event.target.value })}><option>예배</option><option>모임</option><option>다음세대</option><option>섬김과 나눔</option><option>공지</option></select></Field>
                        <Field label="게시 날짜"><input value={news.date} onChange={(event) => setNews({ ...news, date: event.target.value })} /></Field>
                      </div>
                      <Field label="소식 제목"><input value={news.title} onChange={(event) => setNews({ ...news, title: event.target.value })} /></Field>
                      <Field label="짧은 설명" hint="목록 카드에 보이는 두 줄 설명"><textarea rows={3} value={news.summary} onChange={(event) => setNews({ ...news, summary: event.target.value })} /></Field>
                      <Field label="자세한 내용"><textarea rows={8} value={news.body} onChange={(event) => setNews({ ...news, body: event.target.value })} /></Field>
                    </div>
                    <UploadField label="대표 사진" accept="image/*" file={newsFile} currentUrl={newsMedia?.url} onFileChange={(file) => { setNewsFile(file); if (file) setNewsMedia({ url: URL.createObjectURL(file), type: "image" }); }} />
                  </>
                ) : null}
              </form>

              {previewOpen ? (
                <aside className="admin-preview" aria-label="홈페이지 미리보기">
                  <div className="admin-preview__top"><span>홈페이지 미리보기</span><small>입력 즉시 반영</small></div>
                  <div className="admin-preview__browser">
                    <div className="admin-preview__browser-bar"><i /><i /><i /><span>오병이어교회</span></div>
                    <PreviewCard section={section} bulletin={bulletin} word={word} news={news} mediaUrl={selectedMediaUrl || undefined} mediaType={selectedMedia?.type ?? null} />
                  </div>
                </aside>
              ) : null}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function UploadField({
  label,
  accept,
  file,
  currentUrl,
  onFileChange,
}: {
  label: string;
  accept: string;
  file: File | null;
  currentUrl?: string;
  onFileChange: (file: File | null) => void;
}) {
  return (
    <div className="admin-form__group">
      <div className="admin-form__group-title"><b>03</b><span><strong>{label}</strong><small>사진을 끌어놓거나 휴대전화에서 선택하세요.</small></span></div>
      <label className="admin-upload">
        <input type="file" accept={accept} onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} />
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></svg>
        <strong>{file?.name || (currentUrl ? "현재 등록된 파일" : "파일 선택")}</strong>
        <span>{file ? "게시할 새 파일이 선택되었습니다." : currentUrl ? "새 파일을 선택하지 않으면 현재 파일을 유지합니다." : "JPG, PNG, WEBP 또는 PDF"}</span>
      </label>
    </div>
  );
}
