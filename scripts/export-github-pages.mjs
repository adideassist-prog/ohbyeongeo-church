import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const distClient = path.join(root, "dist", "client");
const docs = path.join(root, "docs");
const publicUrl = "https://adideassist-prog.github.io/ohbyeongeo-church";
const githubPagesBasePath = "/ohbyeongeo-church/";
// These are Supabase's public browser credentials, not service-role secrets.
// GitHub Pages has no server-side environment, so keep a deploy-safe fallback
// to ensure the administrator and live content still hydrate after a clean
// build from a fresh checkout.
const githubRuntimeDefaults = {
  NEXT_PUBLIC_SUPABASE_URL: "https://sbylghthpkkwivolhjcz.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    "sb_publishable_GIX0l-omcNIGk_OFHHeC5Q_Y8w1xn3Z",
};
const publicRoutes = ["/", "/bulletin", "/today", "/news"];
const routes = [...publicRoutes, "/admin"];

function rewriteForGitHub(content) {
  return content
    .replaceAll("https://ohbyeongeo-church.modoomoa365.chatgpt.site", publicUrl)
    .replaceAll('href="/assets/', `href="${githubPagesBasePath}assets/`)
    .replaceAll('src="/assets/', `src="${githubPagesBasePath}assets/`)
    .replaceAll('import("/assets/', `import("${githubPagesBasePath}assets/`)
    .replaceAll('\\"/assets/', `\\"${githubPagesBasePath}assets/`)
    .replaceAll('href="/images/', `href="${githubPagesBasePath}images/`)
    .replaceAll('src="/images/', `src="${githubPagesBasePath}images/`)
    .replaceAll('src="/audio/', `src="${githubPagesBasePath}audio/`)
    .replaceAll('\\"/images/', `\\"${githubPagesBasePath}images/`)
    .replaceAll('\\"/audio/', `\\"${githubPagesBasePath}audio/`)
    .replaceAll('href="/favicon.svg', `href="${githubPagesBasePath}favicon.svg`)
    .replaceAll('href="/bulletin"', `href="${githubPagesBasePath}bulletin"`)
    .replaceAll('href="/today"', `href="${githubPagesBasePath}today"`)
    .replaceAll('href="/today?', `href="${githubPagesBasePath}today?`)
    .replaceAll('href="/news"', `href="${githubPagesBasePath}news"`)
    .replaceAll('href="/admin"', `href="${githubPagesBasePath}admin"`)
    .replaceAll('href="/#', `href="${githubPagesBasePath}#`)
    .replaceAll('href="/"', `href="${githubPagesBasePath}"`)
    // Vinext serializes server-rendered Link props into the RSC payload. The
    // visible HTML above is rewritten first, but hydration would otherwise
    // restore these root-relative hrefs and send GitHub Pages to /bulletin.
    .replaceAll('\\"href\\":\\"/bulletin\\"', `\\"href\\":\\"${githubPagesBasePath}bulletin\\"`)
    .replaceAll('\\"href\\":\\"/today\\"', `\\"href\\":\\"${githubPagesBasePath}today\\"`)
    .replaceAll('\\"href\\":\\"/today?', `\\"href\\":\\"${githubPagesBasePath}today?`)
    .replaceAll('\\"href\\":\\"/news\\"', `\\"href\\":\\"${githubPagesBasePath}news\\"`)
    .replaceAll('\\"href\\":\\"/admin\\"', `\\"href\\":\\"${githubPagesBasePath}admin\\"`)
    .replaceAll('\\"href\\":\\"/#', `\\"href\\":\\"${githubPagesBasePath}#`)
    .replaceAll('\\"href\\":\\"/\\"', `\\"href\\":\\"${githubPagesBasePath}\\"`)
    .replaceAll('src:`/images/', `src:\`${githubPagesBasePath}images/`)
    .replaceAll('src:`/audio/', `src:\`${githubPagesBasePath}audio/`)
    .replaceAll('`/images/', `\`${githubPagesBasePath}images/`)
    .replaceAll('`/audio/', `\`${githubPagesBasePath}audio/`)
    .replace(
      /<meta name="codex-preview" content="development"\/?>(?:<\/meta>)?/g,
      "",
    );
}

const openingFallback = `
<script>
(() => {
  const opening = document.querySelector(".opening-screen");
  const releasePage = () => {
    document.documentElement.classList.remove("intro-pending");
  };

  if (!opening) {
    releasePage();
    return;
  }

  // Match the live Site exactly: keep the intro visible for 1.8 seconds,
  // then let the same 1.15-second upward motion reveal the homepage.
  window.setTimeout(() => {
    opening.classList.add("opening-screen--settled");
    releasePage();
  }, 3000);
})();
</script>`;

const openingCriticalStyle = `<style id="opening-critical">
html.intro-pending,
html.intro-pending body{margin:0;overflow:hidden}
html.intro-pending .opening-screen{position:fixed;z-index:2147483647;inset:0;display:grid;width:100%;height:100%;overflow:hidden;place-items:center;padding:0;background:#f8f3eb;box-shadow:0 24px 70px rgba(55,42,30,.16);color:inherit;text-align:center;transform:translateY(0);will-change:transform;animation:opening-screen-critical-leave 1.15s 1.8s forwards cubic-bezier(.76,0,.24,1)}
html .opening-screen.opening-screen--settled{visibility:hidden;pointer-events:none;transform:translateY(-105%)}
html.intro-pending .opening-screen__brand{display:flex;align-items:center;flex-direction:column;gap:13px;animation:opening-brand-critical-in .8s .12s both cubic-bezier(.2,.75,.25,1)}
html.intro-pending .opening-screen__brand img{display:block;width:min(330px,82vw);height:auto;object-fit:contain}
html.intro-pending .opening-screen__english{color:rgba(68,55,43,.5);font-family:"Iowan Old Style","Times New Roman",serif;font-size:9px;font-weight:600;letter-spacing:.24em}
@keyframes opening-brand-critical-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes opening-screen-critical-leave{0%{visibility:visible;transform:translateY(0)}99%{visibility:visible;transform:translateY(-105%)}100%{visibility:hidden;pointer-events:none;transform:translateY(-105%)}}
@media (max-width:700px){html.intro-pending .opening-screen__brand{gap:9px}html.intro-pending .opening-screen__brand img{width:min(292px,84vw)}html.intro-pending .opening-screen__english{font-size:7px;letter-spacing:.19em}}
</style><noscript><style>html.intro-pending,html.intro-pending body{overflow:auto}html.intro-pending body>main>*{visibility:visible!important}html.intro-pending .opening-screen{display:none!important}</style></noscript>`;

function prepareOpeningPage(html) {
  return html
    .replace('<html lang="ko">', '<html lang="ko" class="intro-pending">')
    .replace("</head>", `${openingCriticalStyle}</head>`);
}

const musicPlayerFallback = `
<script>
(() => {
  const attachFallbackPlayer = () => {
    // The normal client bundle owns the player when hydration succeeds.
    if (window.__VINEXT_HYDRATED_AT) return;

    const player = document.querySelector(".music-player");
    const audio = document.querySelector("#church-praise-audio");
    const button = player?.querySelector(".music-player__toggle");
    const label = player?.querySelector(".music-player__title span");
    const timeline = player?.querySelector('input[type="range"]');
    const time = player?.querySelector(".music-player__timeline > span");

    if (!player || !audio || !button || !label || !timeline || !time) return;

    const musicSessionKey = "ohbyeongeo-church-music-state-v1";
    let restored = false;
    let unloading = false;

    const readSavedState = () => {
      try {
        const saved = JSON.parse(sessionStorage.getItem(musicSessionKey) || "null");
        if (
          !saved ||
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
    };

    const persist = (playing = !audio.paused) => {
      try {
        sessionStorage.setItem(
          musicSessionKey,
          JSON.stringify({
            currentTime: Number.isFinite(audio.currentTime)
              ? Math.max(0, audio.currentTime)
              : 0,
            playing,
          }),
        );
      } catch {}
    };

    const saved = readSavedState();

    const formatTime = (value) => {
      if (!Number.isFinite(value) || value < 0) return "0:00";
      const minutes = Math.floor(value / 60);
      const seconds = Math.floor(value % 60).toString().padStart(2, "0");
      return minutes + ":" + seconds;
    };

    const renderIcon = (playing) => {
      button.innerHTML = playing
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7.5" y="6.5" width="3.5" height="11" rx="1" fill="currentColor" stroke="none"></rect><rect x="13" y="6.5" width="3.5" height="11" rx="1" fill="currentColor" stroke="none"></rect></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5V7Z" fill="currentColor" stroke="none"></path></svg>';
    };

    const update = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
      const progress = duration > 0 ? (current / duration) * 100 : 0;

      player.classList.toggle("is-playing", !audio.paused);
      renderIcon(!audio.paused);
      button.setAttribute("aria-pressed", String(!audio.paused));
      button.setAttribute(
        "aria-label",
        audio.paused ? "은혜로 모인 우리 재생" : "은혜로 모인 우리 일시정지",
      );
      label.textContent = audio.paused
        ? "Church praise · 일시정지"
        : "Church praise · 재생 중";
      timeline.disabled = duration <= 0;
      timeline.max = String(duration || 0);
      timeline.value = String(current);
      timeline.style.background =
        "linear-gradient(to right, #c95f3d 0%, #c95f3d " + progress +
        "%, rgba(47, 43, 36, 0.14) " + progress +
        "%, rgba(47, 43, 36, 0.14) 100%)";
      time.textContent = formatTime(current) + " / " + formatTime(duration);
    };

    const restore = () => {
      if (restored) return;
      restored = true;

      if (saved && saved.currentTime > 0) {
        const restoredTime =
          Number.isFinite(audio.duration) && audio.duration > 0
            ? Math.min(saved.currentTime, Math.max(0, audio.duration - 0.1))
            : saved.currentTime;
        try {
          audio.currentTime = restoredTime;
        } catch {
          restored = false;
          return;
        }
      }

      update();

      if (saved && !saved.playing) {
        audio.pause();
        persist(false);
        update();
        return;
      }

      const attempt = audio.play();
      if (attempt) {
        attempt.catch(() => {
          label.textContent = "재생 버튼을 눌러 음악을 시작하세요";
          update();
        });
      }
    };

    button.addEventListener("click", () => {
      if (audio.paused) {
        audio.muted = false;
        audio.volume = 0.55;
        const attempt = audio.play();
        if (attempt) {
          attempt.catch(() => {
            label.textContent = "다시 재생 버튼을 눌러주세요";
          });
        }
      } else {
        persist(false);
        audio.pause();
      }
    });

    timeline.addEventListener("input", () => {
      if (Number.isFinite(audio.duration)) {
        audio.currentTime = Number(timeline.value);
        persist(!audio.paused);
        update();
      }
    });

    for (const eventName of [
      "loadedmetadata",
      "durationchange",
      "canplay",
      "ended",
    ]) {
      audio.addEventListener(eventName, update);
    }

    audio.addEventListener("loadedmetadata", restore);
    audio.addEventListener("canplay", restore);
    audio.addEventListener("timeupdate", () => {
      persist(!audio.paused);
      update();
    });
    audio.addEventListener("play", () => {
      persist(true);
      update();
    });
    audio.addEventListener("pause", () => {
      if (!unloading) persist(false);
      update();
    });

    window.churchMusicPersistNow = persist;
    window.addEventListener("pagehide", () => {
      unloading = true;
      persist(!audio.paused);
    });

    audio.load();
    update();

    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
      restore();
    }
  };

  window.setTimeout(attachFallbackPlayer, 1200);
})();
</script>`;

const visitorCounterFallback = `
<script>
(() => {
  const namespace = "adideassist-prog-ohbyeongeo-church-live-v1";
  let visitorCounts = null;
  let request = null;

  const getKoreaDay = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const part = (type) => parts.find((item) => item.type === type)?.value || "";
    return part("year") + "-" + part("month") + "-" + part("day");
  };

  const day = getKoreaDay();
  const dailyStorageKey = "ohbyeongeo-visitor-counted-" + day;
  const totalStorageKey = "ohbyeongeo-total-counted-" + day;
  const dailyCookieName = "ohbyeongeo_visitor_day";
  const totalCookieName = "ohbyeongeo_total_day";
  let dailyAlreadyCounted = false;
  let totalAlreadyCounted = false;

  try {
    dailyAlreadyCounted = localStorage.getItem(dailyStorageKey) === "1";
    totalAlreadyCounted = localStorage.getItem(totalStorageKey) === "1";
  } catch {}

  if (!dailyAlreadyCounted) {
    dailyAlreadyCounted = document.cookie
      .split(";")
      .some((item) => item.trim() === dailyCookieName + "=" + day);
  }

  if (!totalAlreadyCounted) {
    totalAlreadyCounted = document.cookie
      .split(";")
      .some((item) => item.trim() === totalCookieName + "=" + day);
  }

  const remember = (storageKey, cookieName) => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {}
    document.cookie =
      cookieName + "=" + day + "; Max-Age=172800; Path=/; SameSite=Lax; Secure";
  };

  const render = () => {
    if (visitorCounts === null) return;
    document
      .querySelectorAll('[data-visitor-count="today"]')
      .forEach((element) => {
        element.textContent = visitorCounts.today.toLocaleString("ko-KR");
      });
    document
      .querySelectorAll('[data-visitor-count="total"]')
      .forEach((element) => {
        element.textContent = visitorCounts.total.toLocaleString("ko-KR");
      });
  };

  const loadCounter = (key, shouldIncrement) => {
    const action = shouldIncrement ? "/up" : "/";
    return fetch(
      "https://api.counterapi.dev/v1/" + namespace + "/" + key + action,
      { cache: "no-store" },
    )
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load visitor count");
        return response.json();
      })
      .then((data) => {
        if (typeof data.count !== "number") {
          throw new Error("Visitor count is unavailable");
        }
        return data.count;
      });
  };

  window.updateChurchVisitorCounter = () => {
    render();
    if (request) return request;
    const dailyRequest = loadCounter(
      "visitors-" + day,
      !dailyAlreadyCounted,
    ).then((count) => {
      if (!dailyAlreadyCounted) {
        dailyAlreadyCounted = true;
        remember(dailyStorageKey, dailyCookieName);
      }
      return count;
    });
    const totalRequest = loadCounter(
      "visitors-total-from-2026-08-01",
      !totalAlreadyCounted,
    ).then((count) => {
      if (!totalAlreadyCounted) {
        totalAlreadyCounted = true;
        remember(totalStorageKey, totalCookieName);
      }
      return count;
    });

    request = Promise.all([dailyRequest, totalRequest])
      .then(([today, total]) => {
        visitorCounts = { today, total: Math.max(total, today) };
        render();
      })
      .catch(() => undefined);
    return request;
  };

  window.updateChurchVisitorCounter();
})();
</script>`;

// The hydrated GitHub build owns visitor counting. Keep the legacy fallback
// source nearby for recovery work without running a second counter in browsers.
void visitorCounterFallback;

await mkdir(docs, { recursive: true });
// The weekly bulletin artwork and scanned-page archive were curated directly
// in docs before the source exporter existed. Keep those durable media files,
// while clearing every generated route and asset so stale JS chunks can never
// leave the administrator page blank again.
for (const entry of await readdir(docs, { withFileTypes: true })) {
  if (entry.name === "images" || entry.name === "bulletins") continue;
  await rm(path.join(docs, entry.name), {
    recursive: entry.isDirectory(),
    force: true,
  });
}
await cp(distClient, docs, {
  recursive: true,
  filter(source) {
    const relative = path.relative(distClient, source);
    return !relative.startsWith(".vite") &&
      relative !== ".assetsignore" &&
      relative !== "_headers";
  },
});

const worker = await import(path.join(root, "dist", "server", "index.js"));
const context = {
  waitUntil() {},
  passThroughOnException() {},
};
const runtimeEnv = {
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    githubRuntimeDefaults.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    githubRuntimeDefaults.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
};

const renderedPages = new Map();
for (const route of routes) {
  const response = await worker.default.fetch(
    new Request(
      `https://ohbyeongeo-church.modoomoa365.chatgpt.site/github?route=${encodeURIComponent(route)}`,
      {
        headers: {
          "x-church-supabase-url": runtimeEnv.NEXT_PUBLIC_SUPABASE_URL ?? "",
          "x-church-supabase-key":
            runtimeEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
        },
      },
    ),
    runtimeEnv,
    context,
  );

  if (!response.ok) {
    throw new Error(`Unable to render ${route}: ${response.status}`);
  }

  const rendered = rewriteForGitHub(await response.text());
  renderedPages.set(route, rendered);
}

function createStaticPage(route) {
  const renderedPage = renderedPages.get(route);
  const page = route === "/" ? prepareOpeningPage(renderedPage) : renderedPage;
  const beforeRuntime = `${route === "/" ? openingFallback : ""}${musicPlayerFallback}`;

  return page.replace(
    '<script id="_R_">',
    `${beforeRuntime}<script id="_R_">`,
  );
}

for (const route of routes) {
  const outputDirectory =
    route === "/" ? docs : path.join(docs, route.slice(1));
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, "index.html"), createStaticPage(route));
}

await writeFile(path.join(docs, "404.html"), createStaticPage("/"));
await writeFile(path.join(docs, ".nojekyll"), "");
await writeFile(
  path.join(docs, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${publicUrl}/sitemap.xml\n`,
);
await writeFile(
  path.join(docs, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicRoutes
    .map(
      (route) =>
        `  <url>\n    <loc>${publicUrl}${route}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${route === "/" ? "1.0" : "0.8"}</priority>\n  </url>`,
    )
    .join("\n")}\n</urlset>\n`,
);

const assetDirectory = path.join(docs, "assets");
const sourceAssetFiles = new Set(
  await readdir(path.join(distClient, "assets")),
);
for (const filename of await readdir(assetDirectory)) {
  if (!sourceAssetFiles.has(filename)) {
    await rm(path.join(assetDirectory, filename), { force: true });
  }
}
const assetFiles = await readdir(assetDirectory);
for (const filename of assetFiles.filter((name) => name.endsWith(".js"))) {
  const filePath = path.join(assetDirectory, filename);
  let source = await readFile(filePath, "utf8");
  source = source
    .replaceAll('"/images/', `"${githubPagesBasePath}images/`)
    .replaceAll('"/audio/', `"${githubPagesBasePath}audio/`)
    .replaceAll('`/images/', `\`${githubPagesBasePath}images/`)
    .replaceAll('`/audio/', `\`${githubPagesBasePath}audio/`)
    // Vite's runtime prepends `/` to lazy-chunk preload paths. On a project
    // GitHub Pages site that points at github.io/assets instead of the
    // repository subdirectory, so client components never hydrate.
    .replaceAll("return`/`+e", `return\`${githubPagesBasePath}\`+e`);
  await writeFile(filePath, source);
}

for (const filename of assetFiles.filter((name) => name.endsWith(".css"))) {
  const cssPath = path.join(assetDirectory, filename);
  let css = await readFile(cssPath, "utf8");
  css = css.replaceAll("url(/images/", `url(${githubPagesBasePath}images/`);
  await writeFile(cssPath, css);
}

// Vinext currently emits two complete hashed client generations for this
// multi-route export. Only one graph is linked by the rendered HTML. Walk that
// graph and remove the unreachable generation so a partial GitHub upload can
// never mix old HTML with a similarly named stale chunk.
const reachableAssets = new Set();
const pendingAssets = [];
const collectAssetReferences = (source) => {
  for (const filename of assetFiles) {
    if (!reachableAssets.has(filename) && source.includes(filename)) {
      reachableAssets.add(filename);
      pendingAssets.push(filename);
    }
  }
};

for (const route of routes) {
  collectAssetReferences(createStaticPage(route));
}
collectAssetReferences(createStaticPage("/"));

while (pendingAssets.length > 0) {
  const filename = pendingAssets.pop();
  if (!filename) continue;
  const source = await readFile(path.join(assetDirectory, filename), "utf8");
  collectAssetReferences(source);
}

for (const filename of assetFiles) {
  if (!reachableAssets.has(filename)) {
    await rm(path.join(assetDirectory, filename), { force: true });
  }
}

console.log(`GitHub Pages export created at ${docs}`);
