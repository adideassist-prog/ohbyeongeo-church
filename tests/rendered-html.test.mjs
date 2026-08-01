import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();

  assert.match(html, developmentPreviewMeta);
  assert.match(html, /class="opening-screen"/);
  assert.doesNotMatch(html, /ohbyeongeo-opening-seen/);
  assert.doesNotMatch(html, /opening-screen--checking/);
  assert.match(html, /class="music-player__icon-play"/);
  assert.match(html, /class="music-player__icon-pause"/);
  assert.doesNotMatch(html, /<audio[^>]*\bautoPlay=/);
});

test("GitHub export keeps the live intro appearance and first-load order", async () => {
  const exportScript = await readFile(
    new URL("../scripts/export-github-pages.mjs", import.meta.url),
    "utf8",
  );

  assert.match(exportScript, /background:#f8f3eb/);
  assert.match(exportScript, /width:min\(330px,82vw\)/);
  assert.match(exportScript, /font-size:9px/);
  assert.match(exportScript, /opening-screen-critical-leave 1\.15s 1\.8s/);
  assert.match(exportScript, /class="intro-pending"/);
  assert.doesNotMatch(
    exportScript,
    /body>main>\*:not\(\.opening-screen\)\{visibility:hidden/,
  );
  assert.doesNotMatch(exportScript, /ohbyeongeo-opening-seen-v2/);
  assert.doesNotMatch(exportScript, /nextMain\.querySelector\(\"\.opening-screen\"\)/);
  assert.match(exportScript, /const routes = \[\.\.\.publicRoutes, "\/admin"\]/);
  assert.match(exportScript, /\/github\?route=/);
  assert.doesNotMatch(exportScript, /createHardNavigationScript/);
  assert.doesNotMatch(exportScript, /window\.location\.assign/);
  assert.doesNotMatch(exportScript, /removeVinextRuntime/);
});

test("server navigation keeps the single root music player mounted", async () => {
  const [layout, shell] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ChurchShell.tsx", import.meta.url), "utf8"),
  ]);

  assert.equal((layout.match(/<MusicPlayer\s*\/>/g) ?? []).length, 1);
  assert.match(shell, /import Link from "next\/link"/);
  assert.doesNotMatch(shell, /"use client"/);
  assert.doesNotMatch(shell, /window\.location/);
  assert.doesNotMatch(shell, /churchPath/);
});
