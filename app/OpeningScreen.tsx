"use client";

import { useEffect } from "react";

const introSeenKey = "ohbyeongeo-church-intro-seen-v1";

export default function OpeningScreen() {
  useEffect(() => {
    const root = document.documentElement;

    try {
      if (window.sessionStorage.getItem(introSeenKey) === "1") {
        root.classList.add("intro-seen");
        return;
      }
      window.sessionStorage.setItem(introSeenKey, "1");
    } catch {
      // The animation still works when session storage is unavailable.
    }

    const finishIntro = window.setTimeout(() => {
      root.classList.add("intro-seen");
    }, 3000);

    return () => window.clearTimeout(finishIntro);
  }, []);

  return (
    <div className="opening-screen" aria-hidden="true">
      <span className="opening-screen__brand">
        <img
          src="/images/church-logo-lockup.png"
          alt=""
          width="273"
          height="96"
        />
        <span className="opening-screen__english">
          FIVE LOAVES &amp; TWO FISHES CHURCH
        </span>
      </span>
    </div>
  );
}
