"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  defaultBulletin,
  defaultNews,
  defaultWord,
} from "../lib/church-content";
import AdminWorkspace from "./admin/AdminWorkspace";
import BulletinExperience from "./bulletin/BulletinExperience";
import HomePageView from "./HomePageView";
import NewsExperience from "./news/NewsExperience";
import TodayExperience from "./today/TodayExperience";

const githubBasePath = "/ohbyeongeo-church";
const supportedPaths = new Set(["/", "/bulletin", "/today", "/news", "/admin"]);

type GitHubRoute = "/" | "/bulletin" | "/today" | "/news" | "/admin";

function normalizePath(pathname: string): GitHubRoute {
  let path = pathname;

  if (path === githubBasePath) {
    path = "/";
  } else if (path.startsWith(`${githubBasePath}/`)) {
    path = path.slice(githubBasePath.length) || "/";
  }

  if (path.length > 1) {
    path = path.replace(/\/+$/, "");
  }

  return supportedPaths.has(path) ? (path as GitHubRoute) : "/";
}

function browserRoute() {
  if (typeof window === "undefined") return "/" as GitHubRoute;
  return normalizePath(window.location.pathname);
}

function publicPath(route: GitHubRoute, search = "", hash = "") {
  const base = route === "/" ? `${githubBasePath}/` : `${githubBasePath}${route}`;
  return `${base}${search}${hash}`;
}

const routeTitles: Record<GitHubRoute, string> = {
  "/": "오병이어교회 | 작은 나눔이 큰 은혜가 되는 교회",
  "/bulletin": "이번 주 주보 | 오병이어교회",
  "/today": "오늘의 말씀 | 오병이어교회",
  "/news": "교회소식 | 오병이어교회",
  "/admin": "교회 홈페이지 관리 | 오병이어교회",
};

export default function GitHubApp({ initialPath = "/" }: { initialPath?: string }) {
  const initialRoute = useMemo(() => normalizePath(initialPath), [initialPath]);
  const [route, setRoute] = useState<GitHubRoute>(initialRoute);
  const [showOpening, setShowOpening] = useState(initialRoute === "/");

  const applyRoute = useCallback((next: URL, historyMode: "push" | "replace" | "none") => {
    const nextRoute = normalizePath(next.pathname);
    setShowOpening(false);
    setRoute(nextRoute);

    if (historyMode !== "none") {
      const nextUrl = publicPath(nextRoute, next.search, next.hash);
      window.history[historyMode === "push" ? "pushState" : "replaceState"]({}, "", nextUrl);
    }

    document.title = routeTitles[nextRoute];
    window.requestAnimationFrame(() => {
      if (next.hash) {
        document.getElementById(next.hash.slice(1))?.scrollIntoView({ block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    });
  }, []);

  useEffect(() => {
    const current = browserRoute();
    setRoute(current);
    document.title = routeTitles[current];

    const hideOpening = window.setTimeout(() => setShowOpening(false), 3100);

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const next = new URL(anchor.href, window.location.href);
      if (next.origin !== window.location.origin) return;

      const normalized = normalizePath(next.pathname);
      const isSupported = supportedPaths.has(normalized);
      const isGitHubProjectPath =
        next.pathname === githubBasePath || next.pathname.startsWith(`${githubBasePath}/`);
      const isLocalAppPath = supportedPaths.has(next.pathname.replace(/\/+$/, "") || "/");

      if (!isSupported || (!isGitHubProjectPath && !isLocalAppPath)) return;

      event.preventDefault();
      event.stopPropagation();

      const sameRoute = normalized === route;
      if (sameRoute && next.hash) {
        window.history.pushState({}, "", publicPath(normalized, next.search, next.hash));
        document.getElementById(next.hash.slice(1))?.scrollIntoView({ block: "start" });
        return;
      }

      applyRoute(next, "push");
    };

    const handlePopState = () => {
      applyRoute(new URL(window.location.href), "none");
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.clearTimeout(hideOpening);
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [applyRoute, route]);

  if (route === "/admin") {
    return <AdminWorkspace />;
  }

  if (route === "/bulletin") {
    return <BulletinExperience initialItem={null} />;
  }

  if (route === "/today") {
    return <TodayExperience initialItems={[]} initialSelectedDate={null} />;
  }

  if (route === "/news") {
    return <NewsExperience initialItems={[]} />;
  }

  return (
    <HomePageView
      bulletin={{ ...defaultBulletin }}
      word={{ ...defaultWord }}
      news={{ ...defaultNews }}
      showOpening={showOpening}
    />
  );
}
