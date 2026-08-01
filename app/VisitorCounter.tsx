"use client";

import { useEffect, useState } from "react";

const counterNamespace = "adideassist-prog-ohbyeongeo-church-live-v1";
const counterApiBase = "https://api.counterapi.dev/v1";
const visitorStorageKey = "ohbyeongeo-anonymous-visitor-v1";

type VisitorCounts = {
  today: number;
  total: number;
};

function getKoreaDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function createVisitorId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const random = Array.from(crypto.getRandomValues(new Uint8Array(24)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `visitor-${random}`;
}

function getVisitorId() {
  try {
    const saved = window.localStorage.getItem(visitorStorageKey);
    if (saved) return saved;

    const created = createVisitorId();
    window.localStorage.setItem(visitorStorageKey, created);
    return created;
  } catch {
    return createVisitorId();
  }
}

async function requestPublicCount(signal: AbortSignal) {
  const day = getKoreaDay();
  const dailyStorageKey = `ohbyeongeo-visitor-counted-${day}`;
  const totalStorageKey = `ohbyeongeo-total-counted-${day}`;
  const dailyCookieName = "ohbyeongeo_visitor_day";
  const totalCookieName = "ohbyeongeo_total_day";
  let dailyAlreadyCounted = false;
  let totalAlreadyCounted = false;

  try {
    dailyAlreadyCounted =
      window.localStorage.getItem(dailyStorageKey) === "1";
    totalAlreadyCounted =
      window.localStorage.getItem(totalStorageKey) === "1";
  } catch {
    // Continue without device-local deduplication when storage is blocked.
  }

  if (!dailyAlreadyCounted) {
    dailyAlreadyCounted = document.cookie
      .split(";")
      .some((item) => item.trim() === `${dailyCookieName}=${day}`);
  }

  if (!totalAlreadyCounted) {
    totalAlreadyCounted = document.cookie
      .split(";")
      .some((item) => item.trim() === `${totalCookieName}=${day}`);
  }

  const requestCounter = async (key: string, shouldIncrement: boolean) => {
    const action = shouldIncrement ? "/up" : "/";
    const response = await fetch(
      `${counterApiBase}/${counterNamespace}/${key}${action}`,
      { cache: "no-store", signal },
    );

    if (!response.ok) throw new Error("Unable to load visitor count");
    const data = (await response.json()) as { count?: number };
    if (typeof data.count !== "number") {
      throw new Error("Visitor count is unavailable");
    }
    return data.count;
  };

  const rememberDailyVisit = () => {
    try {
      window.localStorage.setItem(dailyStorageKey, "1");
    } catch {
      // The current count still remains usable without local storage.
    }
    document.cookie = `${dailyCookieName}=${day}; Max-Age=172800; Path=/; SameSite=Lax; Secure`;
  };

  const rememberTotalVisit = () => {
    try {
      window.localStorage.setItem(totalStorageKey, "1");
    } catch {
      // The current count still remains usable without local storage.
    }
    document.cookie = `${totalCookieName}=${day}; Max-Age=172800; Path=/; SameSite=Lax; Secure`;
  };

  const dailyRequest = requestCounter(
    `visitors-${day}`,
    !dailyAlreadyCounted,
  ).then((count) => {
    if (!dailyAlreadyCounted) rememberDailyVisit();
    return count;
  });

  const totalRequest = requestCounter(
    "visitors-total-from-2026-08-01",
    !totalAlreadyCounted,
  ).then((count) => {
    if (!totalAlreadyCounted) rememberTotalVisit();
    return count;
  });

  const [today, total] = await Promise.all([dailyRequest, totalRequest]);

  // The cumulative count began after the first daily counter. Keep the
  // public invariant intact even if an older or partially completed request
  // temporarily leaves the cumulative counter behind the daily counter.
  return { today, total: Math.max(total, today) };
}

async function requestSiteCount(signal: AbortSignal) {
  const response = await fetch("/api/visitors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId: getVisitorId() }),
    cache: "no-store",
    signal,
  });

  if (!response.ok) throw new Error("Unable to load visitor count");
  const data = (await response.json()) as {
    count?: number;
    todayCount?: number;
    totalCount?: number;
  };
  const today = data.todayCount ?? data.count;
  if (typeof today !== "number" || typeof data.totalCount !== "number") {
    throw new Error("Visitor count is unavailable");
  }
  return { today, total: data.totalCount };
}

export default function VisitorCounter() {
  const [counts, setCounts] = useState<VisitorCounts | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const request = window.location.hostname.endsWith("github.io")
      ? requestPublicCount(controller.signal)
      : requestSiteCount(controller.signal);

    request
      .then((value) => {
        setCounts(value);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  return (
    <div className="visitor-counter" aria-live="polite">
      <span className="visitor-counter__dot" aria-hidden="true" />
      <div className="visitor-counter__counts">
        <p>
          <span>오늘 방문</span>
          <strong data-visitor-count="today">
            {counts === null ? "—" : counts.today.toLocaleString("ko-KR")}
          </strong>
          <small>명</small>
        </p>
        <i aria-hidden="true" />
        <p>
          <span>누적 방문</span>
          <strong data-visitor-count="total">
            {counts === null ? "—" : counts.total.toLocaleString("ko-KR")}
          </strong>
          <small>명</small>
        </p>
      </div>
    </div>
  );
}
