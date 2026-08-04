import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function read(relativePath) {
  return readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("GitHub export includes the hydrated administrator route", async () => {
  const admin = await read("docs/admin/index.html");
  assert.match(admin, /교회 홈페이지 관리/);
  assert.match(admin, /관리 화면을 준비하고 있어요/);
  assert.match(admin, /<script id="_R_">import\("\/ohbyeongeo-church\/assets\//);
  assert.match(admin, /name="robots" content="noindex, nofollow"/);
  assert.doesNotMatch(admin, /관리 화면 연결을/);
  assert.doesNotMatch(admin, /<template data-church-route=/);
});

test("GitHub public pages retain live client features", async () => {
  const today = await read("docs/today/index.html");
  assert.match(today, /TodayExperience-/);
  assert.match(today, /<script id="_R_">import\("\/ohbyeongeo-church\/assets\//);

  const assets = await readdir(new URL("../docs/assets/", import.meta.url));
  const interactiveSources = await Promise.all(
    assets
      .filter((name) => /^(AdminWorkspace|TodayExperience|client-content)-.*\.js$/.test(name))
      .map((name) => read(`docs/assets/${name}`)),
  );
  const source = interactiveSources.join("\n");
  assert.match(source, /ohbyeongeo-church\.modoomoa365\.chatgpt\.site/);
  assert.match(source, /Authorization/);
  assert.match(source, /content_items/);
});

test("GitHub export keeps required media assets", async () => {
  await access(new URL("../docs/images/church-logo-lockup.png", import.meta.url));
  await access(new URL("../docs/images/church-social-preview.png", import.meta.url));
  await access(new URL("../docs/audio/grace-gathered-us.m4a", import.meta.url));
});

test("GitHub navigation preserves music position and playback state", async () => {
  const today = await read("docs/today/index.html");
  const assets = await readdir(new URL("../docs/assets/", import.meta.url));
  const musicAsset = assets.find((name) => /^MusicPlayer-.*\.js$/.test(name));

  assert.ok(musicAsset);
  const musicSource = await read(`docs/assets/${musicAsset}`);

  assert.match(today, /ohbyeongeo-church-music-state-v1/);
  assert.match(today, /sessionStorage\.setItem/);
  assert.match(today, /window\.churchMusicPersistNow\?\.\(\)/);
  assert.doesNotMatch(today, /<audio[^>]*\bautoPlay=/);
  assert.match(musicSource, /\/ohbyeongeo-church\/audio\/grace-gathered-us\.m4a/);
  assert.match(musicSource, /durationchange/);
  assert.doesNotMatch(musicSource, /src:`\/audio\/grace-gathered-us\.m4a/);
});

test("GitHub navigation retains the repository base path after hydration", async () => {
  const pages = await Promise.all([
    read("docs/index.html"),
    read("docs/bulletin/index.html"),
    read("docs/today/index.html"),
    read("docs/news/index.html"),
    read("docs/admin/index.html"),
  ]);

  for (const page of pages) {
    assert.doesNotMatch(
      page,
      /\\\"href\\\":\\\"\/(?:bulletin|today|news|admin)(?:\\\"|\?)/,
    );
    assert.match(page, /const rootChurchRoutes = new Set/);
    assert.match(page, /url\.pathname = rootPath === "\/" \? basePath \+ "\/" : basePath \+ rootPath/);
  }
});
