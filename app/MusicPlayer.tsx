"use client";

import { useEffect, useRef, useState } from "react";

const musicSessionKey = "ohbyeongeo-church-music-state-v1";

type SavedMusicState = {
  currentTime: number;
  playing: boolean;
};

type PlayerStatus =
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "blocked"
  | "error";

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return "0:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function readSavedMusicState(): SavedMusicState | null {
  try {
    const value = window.sessionStorage.getItem(musicSessionKey);

    if (!value) {
      return null;
    }

    const saved = JSON.parse(value) as Partial<SavedMusicState>;
    if (
      typeof saved.currentTime !== "number" ||
      !Number.isFinite(saved.currentTime) ||
      typeof saved.playing !== "boolean"
    ) {
      return null;
    }

    return {
      currentTime: Math.max(0, saved.currentTime),
      playing: saved.playing,
    };
  } catch {
    return null;
  }
}

function saveMusicState(audio: HTMLAudioElement, playing = !audio.paused) {
  try {
    window.sessionStorage.setItem(
      musicSessionKey,
      JSON.stringify({
        currentTime: Number.isFinite(audio.currentTime)
          ? Math.max(0, audio.currentTime)
          : 0,
        playing,
      } satisfies SavedMusicState),
    );
  } catch {
    // Private browsing modes can disable storage. Playback still works in the
    // current document even when cross-page restoration is unavailable.
  }
}

function PlayerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <g className="music-player__icon-play">
        <path d="m9 7 8 5-8 5V7Z" fill="currentColor" stroke="none" />
      </g>
      <g className="music-player__icon-pause">
        <rect x="7.5" y="6.5" width="3.5" height="11" rx="1" fill="currentColor" stroke="none" />
        <rect x="13" y="6.5" width="3.5" height="11" rx="1" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const unloadingRef = useRef(false);
  const restoredRef = useRef(false);
  const lastSavedSecondRef = useRef(-1);
  const [status, setStatus] = useState<PlayerStatus>("loading");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    let disposed = false;
    const saved = readSavedMusicState();
    const shouldPlay = saved?.playing ?? true;
    audio.volume = 0.55;

    const syncDuration = () => {
      if (disposed) {
        return;
      }

      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDuration(nextDuration);
    };

    const restorePlayback = () => {
      if (disposed || restoredRef.current) {
        return;
      }

      syncDuration();
      restoredRef.current = true;

      if (saved && saved.currentTime > 0) {
        const restoredTime =
          Number.isFinite(audio.duration) && audio.duration > 0
            ? Math.min(saved.currentTime, Math.max(0, audio.duration - 0.1))
            : saved.currentTime;

        try {
          audio.currentTime = restoredTime;
          setCurrentTime(restoredTime);
        } catch {
          // A few embedded browsers expose metadata before seeking is ready.
          // Their next canplay event will retry this restoration.
          restoredRef.current = false;
          return;
        }
      }

      if (!shouldPlay) {
        audio.pause();
        setIsPlaying(false);
        setStatus("paused");
        saveMusicState(audio, false);
        return;
      }

      const playAttempt = audio.play();
      if (playAttempt) {
        void playAttempt.catch(() => {
          if (!disposed && audio.paused) {
            setIsPlaying(false);
            setStatus("blocked");
          }
        });
      }
    };

    const persistBeforeNavigation = () => {
      unloadingRef.current = true;
      saveMusicState(audio, !audio.paused);
    };

    const musicWindow = window as Window & {
      churchMusicPersistNow?: () => void;
    };
    musicWindow.churchMusicPersistNow = () =>
      saveMusicState(audio, !audio.paused);
    window.addEventListener("pagehide", persistBeforeNavigation);
    audio.addEventListener("loadedmetadata", restorePlayback);
    audio.addEventListener("canplay", restorePlayback);
    audio.addEventListener("durationchange", syncDuration);

    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
      syncDuration();
      restorePlayback();
    }

    return () => {
      disposed = true;
      window.removeEventListener("pagehide", persistBeforeNavigation);
      audio.removeEventListener("loadedmetadata", restorePlayback);
      audio.removeEventListener("canplay", restorePlayback);
      audio.removeEventListener("durationchange", syncDuration);
      if (musicWindow.churchMusicPersistNow) {
        delete musicWindow.churchMusicPersistNow;
      }
    };
  }, []);

  const rememberProgress = (
    audio: HTMLAudioElement,
    playing = !audio.paused,
    force = false,
  ) => {
    const currentSecond = Math.floor(audio.currentTime);
    if (!force && currentSecond === lastSavedSecondRef.current) {
      return;
    }

    lastSavedSecondRef.current = currentSecond;
    saveMusicState(audio, playing);
  };

  const updateDuration = (audio: HTMLAudioElement) => {
    const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
    setDuration(nextDuration);

    if (audio.paused && nextDuration > 0) {
      setStatus((current) =>
        current === "blocked" || current === "paused" ? current : "ready",
      );
    }
  };

  const togglePlayback = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      audio.muted = false;
      audio.volume = 0.55;
      setStatus("loading");
      setIsPlaying(true);

      // Keep play() directly inside the click handler. Delaying it until after
      // metadata is loaded loses the user gesture in Chrome and Android WebView.
      const playAttempt = audio.play();
      if (playAttempt) {
        void playAttempt.catch(() => {
          setIsPlaying(false);
          setStatus("error");
        });
      }
    } else {
      setIsPlaying(false);
      setStatus("paused");
      rememberProgress(audio, false, true);
      audio.pause();
    }
  };

  const seek = (value: number) => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const boundedValue = Math.min(Math.max(value, 0), duration || value);

    try {
      audio.currentTime = boundedValue;
      setCurrentTime(boundedValue);
      rememberProgress(audio, !audio.paused, true);
    } catch {
      // Some in-app browsers briefly expose an unseekable media element while
      // metadata is loading. A later input event retries once it is ready.
    }
  };

  const statusLabel = (() => {
    switch (status) {
      case "blocked":
        return "재생 버튼을 눌러 음악을 시작하세요";
      case "loading":
        return "음악을 불러오는 중입니다";
      case "error":
        return "다시 재생 버튼을 눌러주세요";
      case "playing":
        return "Church praise · 재생 중";
      case "paused":
        return "Church praise · 일시정지";
      default:
        return "Church praise";
    }
  })();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <aside
      className={`music-player${isPlaying ? " is-playing" : ""}`}
      aria-label="찬양 음악 플레이어"
    >
      <audio
        id="church-praise-audio"
        ref={audioRef}
        loop
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => updateDuration(event.currentTarget)}
        onDurationChange={(event) => updateDuration(event.currentTarget)}
        onCanPlay={(event) => updateDuration(event.currentTarget)}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
          rememberProgress(event.currentTarget);
        }}
        onPlay={(event) => {
          setIsPlaying(true);
          setStatus("playing");
          rememberProgress(event.currentTarget, true, true);
          window.dispatchEvent(new Event("church-music-playing"));
        }}
        onPlaying={(event) => {
          setIsPlaying(true);
          setStatus("playing");
          rememberProgress(event.currentTarget, true, true);
        }}
        onPause={(event) => {
          setIsPlaying(false);
          setStatus("paused");
          if (!unloadingRef.current) {
            rememberProgress(event.currentTarget, false, true);
          }
        }}
        onError={() => {
          setIsPlaying(false);
          setStatus("error");
        }}
        onEnded={() => {
          setIsPlaying(false);
          setStatus("paused");
          setCurrentTime(0);
        }}
      >
        <source src="/audio/grace-gathered-us.m4a" type="audio/mp4" />
      </audio>

      <button
        className="music-player__toggle"
        type="button"
        onClick={togglePlayback}
        onPointerDown={(event) => event.stopPropagation()}
        aria-label={isPlaying ? "은혜로 모인 우리 일시정지" : "은혜로 모인 우리 재생"}
        aria-pressed={isPlaying}
      >
        <PlayerIcon />
      </button>

      <div className="music-player__body">
        <div className="music-player__top">
          <div className="music-player__title">
            <span aria-live="polite">{statusLabel}</span>
            <strong>은혜로 모인 우리</strong>
          </div>
          <div className="music-player__wave" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>

        <div className="music-player__timeline">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            disabled={duration <= 0}
            onInput={(event) => seek(Number(event.currentTarget.value))}
            onChange={(event) => seek(Number(event.currentTarget.value))}
            onPointerDown={(event) => event.stopPropagation()}
            aria-label="음악 재생 위치"
            style={{
              background: `linear-gradient(to right, #c95f3d 0%, #c95f3d ${progress}%, rgba(47, 43, 36, 0.14) ${progress}%, rgba(47, 43, 36, 0.14) 100%)`,
            }}
          />
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </aside>
  );
}
