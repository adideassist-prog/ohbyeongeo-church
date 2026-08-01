"use client";

import { useEffect, useMemo, useState } from "react";

type PublicComment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

const deviceStorageKey = "ohbyeongeo-comment-device-v1";
const nameStorageKey = "ohbyeongeo-comment-name-v1";
const liveSiteOrigin = "https://ohbyeongeo-church.modoomoa365.chatgpt.site";

function commentsApiUrl(search = "") {
  const path = `/api/comments${search}`;
  return window.location.hostname.endsWith("github.io")
    ? `${liveSiteOrigin}${path}`
    : path;
}

function createDeviceId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(24)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function getDeviceId() {
  try {
    const saved = window.localStorage.getItem(deviceStorageKey);
    if (saved) return saved;
    const created = createDeviceId();
    window.localStorage.setItem(deviceStorageKey, created);
    return created;
  } catch {
    return createDeviceId();
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function WordComments({
  wordKey,
  wordLabel,
}: {
  wordKey: string;
  wordLabel: string;
}) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [authorName, setAuthorName] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return window.localStorage.getItem(nameStorageKey) ?? "";
    } catch {
      return "";
    }
  });
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const commentCountLabel = useMemo(
    () => `${comments.length.toLocaleString("ko-KR")}개의 나눔`,
    [comments.length],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetch(commentsApiUrl(`?wordKey=${encodeURIComponent(wordKey)}`), {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as {
          comments?: PublicComment[];
          error?: string;
        };
        if (!response.ok) throw new Error(data.error || "댓글을 불러오지 못했습니다.");
        setComments(data.comments ?? []);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError("댓글을 불러오지 못했어요. 잠시 후 다시 확인해 주세요.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [wordKey]);

  const submitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const cleanName = authorName.trim();
    const cleanBody = body.trim();
    if (!cleanName || cleanBody.length < 2) {
      setError("이름과 두 글자 이상의 댓글을 적어 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(commentsApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wordKey,
          wordLabel,
          authorName: cleanName,
          body: cleanBody,
          website,
          deviceId: getDeviceId(),
        }),
      });
      const data = (await response.json()) as {
        comment?: PublicComment;
        error?: string;
      };
      if (!response.ok || !data.comment) {
        throw new Error(data.error || "댓글을 등록하지 못했습니다.");
      }

      setComments((current) => [data.comment as PublicComment, ...current]);
      setBody("");
      setNotice("소중한 나눔이 등록되었어요.");
      try {
        window.localStorage.setItem(nameStorageKey, cleanName);
      } catch {
        // 이름 저장 실패는 댓글 등록 결과에 영향을 주지 않습니다.
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "댓글을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="word-comments" aria-labelledby="word-comments-title">
      <div className="word-comments__intro">
        <div>
          <span>Grace shared together</span>
          <h2 id="word-comments-title">이 말씀을 통해 받은 은혜를 나눠주세요.</h2>
        </div>
        <p>
          말씀을 읽으며 마음에 남은 생각과 기도를 자유롭게 나눠보세요.
          <strong>{commentCountLabel}</strong>
        </p>
      </div>

      <div className="word-comments__layout">
        <form className="word-comment-form" onSubmit={submitComment}>
          <div className="word-comment-form__heading">
            <span aria-hidden="true">+</span>
            <div>
              <strong>은혜 나눔 남기기</strong>
              <small>작성한 이름과 내용은 이 페이지에 공개됩니다.</small>
            </div>
          </div>

          <label>
            <span>이름</span>
            <input
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              maxLength={20}
              placeholder="이름을 적어주세요"
              autoComplete="name"
              required
            />
          </label>

          <label>
            <span>댓글</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={500}
              rows={6}
              placeholder="이 말씀을 통해 받은 은혜를 나눠주세요."
              required
            />
            <small className="word-comment-form__count">{body.length} / 500</small>
          </label>

          <label className="word-comment-form__website" aria-hidden="true">
            웹사이트
            <input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? "등록하고 있어요…" : "댓글 남기기"}
            <span aria-hidden="true">→</span>
          </button>
          {notice ? <p className="word-comment-form__notice" role="status">{notice}</p> : null}
          {error ? <p className="word-comment-form__error" role="alert">{error}</p> : null}
        </form>

        <div className="word-comment-list" aria-live="polite">
          {loading ? <p className="word-comment-list__empty">나눔을 불러오고 있어요…</p> : null}
          {!loading && comments.length === 0 ? (
            <div className="word-comment-list__empty">
              <span>첫 번째 나눔을 기다리고 있어요.</span>
              <p>오늘 받은 은혜를 가장 먼저 들려주세요.</p>
            </div>
          ) : null}
          {comments.map((comment) => (
            <article className="word-comment" key={comment.id}>
              <div className="word-comment__avatar" aria-hidden="true">
                {comment.author_name.slice(0, 1)}
              </div>
              <div>
                <header>
                  <strong>{comment.author_name}</strong>
                  <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
                </header>
                <p>{comment.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
