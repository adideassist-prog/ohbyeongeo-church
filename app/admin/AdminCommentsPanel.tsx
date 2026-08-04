"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "../../utils/supabase/client";

type AdminComment = {
  id: string;
  word_key: string;
  word_label: string;
  author_name: string;
  body: string;
  status: "visible" | "hidden";
  created_at: string;
};

type Filter = "all" | "visible" | "hidden";
const liveSiteOrigin = "https://ohbyeongeo-church.modoomoa365.chatgpt.site";

function commentsApiUrl(search = "") {
  const path = `/api/comments${search}`;
  return window.location.hostname.endsWith("github.io")
    ? `${liveSiteOrigin}${path}`
    : path;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminCommentsPanel({
  supabaseUrl,
  supabasePublishableKey,
}: {
  supabaseUrl?: string;
  supabasePublishableKey?: string;
}) {
  const supabase = useMemo(
    () =>
      createClient({
        url: supabaseUrl,
        publishableKey: supabasePublishableKey,
      }),
    [supabasePublishableKey, supabaseUrl],
  );
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");

  const adminFetch = useCallback(async (search: string, init: RequestInit = {}) => {
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    const headers = new Headers(init.headers);
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    return fetch(commentsApiUrl(search), {
      ...init,
      headers,
      cache: "no-store",
      credentials: window.location.hostname.endsWith("github.io")
        ? "omit"
        : "same-origin",
    });
  }, [supabase]);

  const loadComments = async () => {
    setLoading(true);
    setNotice("");
    try {
      const response = await adminFetch("?scope=admin");
      const data = (await response.json()) as {
        comments?: AdminComment[];
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "댓글을 불러오지 못했습니다.");
      setComments(data.comments ?? []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "댓글을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    adminFetch("?scope=admin", { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as {
          comments?: AdminComment[];
          error?: string;
        };
        if (!response.ok) throw new Error(data.error || "댓글을 불러오지 못했습니다.");
        setComments(data.comments ?? []);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setNotice(error instanceof Error ? error.message : "댓글을 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [adminFetch]);

  const counts = useMemo(
    () => ({
      all: comments.length,
      visible: comments.filter((comment) => comment.status === "visible").length,
      hidden: comments.filter((comment) => comment.status === "hidden").length,
    }),
    [comments],
  );

  const filtered = useMemo(
    () => comments.filter((comment) => filter === "all" || comment.status === filter),
    [comments, filter],
  );

  const changeStatus = async (comment: AdminComment) => {
    const nextStatus = comment.status === "visible" ? "hidden" : "visible";
    setBusyId(comment.id);
    setNotice("");
    try {
      const response = await adminFetch("", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: comment.id, status: nextStatus }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "댓글 상태를 바꾸지 못했습니다.");
      setComments((current) =>
        current.map((item) =>
          item.id === comment.id ? { ...item, status: nextStatus } : item,
        ),
      );
      setNotice(nextStatus === "hidden" ? "댓글을 홈페이지에서 숨겼어요." : "댓글을 다시 공개했어요.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "댓글 상태를 바꾸지 못했습니다.");
    } finally {
      setBusyId("");
    }
  };

  const removeComment = async (comment: AdminComment) => {
    if (!window.confirm(`${comment.author_name}님의 댓글을 완전히 삭제할까요?`)) return;
    setBusyId(comment.id);
    setNotice("");
    try {
      const response = await adminFetch(`?id=${encodeURIComponent(comment.id)}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "댓글을 삭제하지 못했습니다.");
      setComments((current) => current.filter((item) => item.id !== comment.id));
      setNotice("댓글을 삭제했어요.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "댓글을 삭제하지 못했습니다.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <section className="admin-comments" aria-labelledby="admin-comments-title">
      <div className="admin-editor__heading">
        <div>
          <span>성도들의 은혜 나눔</span>
          <h1 id="admin-comments-title">댓글 관리</h1>
          <p>오늘의 말씀에 남겨진 댓글을 확인하고 공개 여부를 관리하세요.</p>
        </div>
        <button className="admin-button admin-button--ghost" type="button" onClick={() => void loadComments()} disabled={loading}>
          {loading ? "불러오는 중…" : "새로고침"}
        </button>
      </div>

      <div className="admin-comment-stats" aria-label="댓글 현황">
        <div><span>전체 댓글</span><strong>{counts.all}</strong></div>
        <div><span>공개 중</span><strong>{counts.visible}</strong></div>
        <div><span>숨긴 댓글</span><strong>{counts.hidden}</strong></div>
      </div>

      <div className="admin-comment-toolbar">
        <div role="group" aria-label="댓글 상태 필터">
          {(["all", "visible", "hidden"] as Filter[]).map((item) => (
            <button key={item} type="button" className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)}>
              {item === "all" ? "전체" : item === "visible" ? "공개" : "숨김"} {counts[item]}
            </button>
          ))}
        </div>
        {notice ? <p role="status">{notice}</p> : null}
      </div>

      <div className="admin-comment-list">
        {loading ? <div className="admin-comment-empty">댓글을 불러오고 있어요…</div> : null}
        {!loading && filtered.length === 0 ? (
          <div className="admin-comment-empty">해당하는 댓글이 아직 없어요.</div>
        ) : null}
        {filtered.map((comment) => (
          <article className={`admin-comment-row${comment.status === "hidden" ? " is-hidden" : ""}`} key={comment.id}>
            <div className="admin-comment-row__avatar" aria-hidden="true">{comment.author_name.slice(0, 1)}</div>
            <div className="admin-comment-row__content">
              <header>
                <strong>{comment.author_name}</strong>
                <span className={`admin-comment-status admin-comment-status--${comment.status}`}>
                  {comment.status === "visible" ? "공개" : "숨김"}
                </span>
                <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
              </header>
              <p>{comment.body}</p>
              <small>{comment.word_label}</small>
            </div>
            <div className="admin-comment-row__actions">
              <button type="button" onClick={() => void changeStatus(comment)} disabled={busyId === comment.id}>
                {comment.status === "visible" ? "숨기기" : "다시 공개"}
              </button>
              <button type="button" className="is-danger" onClick={() => void removeComment(comment)} disabled={busyId === comment.id}>
                삭제
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
