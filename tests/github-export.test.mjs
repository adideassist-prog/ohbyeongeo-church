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
  assert.match(admin, /GitHubApp-/);
  assert.match(admin, /AdminWorkspace-/);
  assert.doesNotMatch(admin, /관리 화면 연결을/);
  assert.match(admin, /https:\/\/sbylghthpkkwivolhjcz\.supabase\.co/);
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
  await access(new URL("../docs/images/bulletin-five-loaves.webp", import.meta.url));
  await access(new URL("../docs/bulletins/2026-08-02/cover.webp", import.meta.url));
  await access(new URL("../docs/audio/grace-gathered-us.m4a", import.meta.url));
});

test("GitHub bulletin retains the confirmed detailed August 2 content", async () => {
  const bulletin = await read("docs/bulletin/index.html");

  assert.match(bulletin, /<h2>하나님을 온전히 따르는 교회<\/h2>/);
  assert.match(bulletin, /<p>민수기 14장 21–24절<\/p>/);
  assert.match(bulletin, /class="bulletin-community"/);
  assert.match(bulletin, /class="mission-letter"/);
  assert.match(bulletin, /<meta property="og:title" content="이번 주 주보 \| 오병이어교회"/);
  assert.match(
    bulletin,
    /<meta property="og:url" content="https:\/\/adideassist-prog\.github\.io\/ohbyeongeo-church\/bulletin"/,
  );
});

test("GitHub navigation keeps one music player mounted inside the SPA", async () => {
  const [home, today, admin] = await Promise.all([
    read("docs/index.html"),
    read("docs/today/index.html"),
    read("docs/admin/index.html"),
  ]);
  const assets = await readdir(new URL("../docs/assets/", import.meta.url));
  const musicAsset = assets.find((name) => /^MusicPlayer-.*\.js$/.test(name));
  const githubAppAsset = assets.find((name) => /^GitHubApp-.*\.js$/.test(name));

  assert.ok(musicAsset);
  assert.ok(githubAppAsset);
  const musicSource = await read(`docs/assets/${musicAsset}`);
  const githubAppSource = await read(`docs/assets/${githubAppAsset}`);

  assert.match(today, /ohbyeongeo-church-music-state-v1/);
  assert.match(today, /sessionStorage\.setItem/);
  assert.equal((home.match(/<audio\b/g) ?? []).length, 1);
  assert.equal((admin.match(/<audio\b/g) ?? []).length, 1);
  assert.doesNotMatch(today, /<audio[^>]*\bautoPlay=/);
  assert.match(musicSource, /\/ohbyeongeo-church\/audio\/grace-gathered-us\.m4a/);
  assert.match(musicSource, /durationchange/);
  assert.doesNotMatch(musicSource, /src:`\/audio\/grace-gathered-us\.m4a/);
  assert.match(githubAppSource, /pushState/);
  assert.match(githubAppSource, /popstate/);
});

test("GitHub navigation stays inside the repository base path", async () => {
  const pages = await Promise.all([
    read("docs/index.html"),
    read("docs/bulletin/index.html"),
    read("docs/today/index.html"),
    read("docs/news/index.html"),
    read("docs/admin/index.html"),
  ]);
  const assets = await readdir(new URL("../docs/assets/", import.meta.url));
  const githubAppAsset = assets.find((name) => /^GitHubApp-.*\.js$/.test(name));
  assert.ok(githubAppAsset);
  const githubAppSource = await read(`docs/assets/${githubAppAsset}`);

  for (const page of pages) {
    assert.doesNotMatch(page, /window\.location\.assign/);
  }

  assert.match(githubAppSource, /\/ohbyeongeo-church/);
  assert.match(githubAppSource, /pushState/);
});

test("every local JavaScript module referenced by exported HTML exists", async () => {
  const pages = await Promise.all([
    read("docs/index.html"),
    read("docs/bulletin/index.html"),
    read("docs/today/index.html"),
    read("docs/news/index.html"),
    read("docs/admin/index.html"),
  ]);
  const assets = new Set(await readdir(new URL("../docs/assets/", import.meta.url)));

  for (const page of pages) {
    const references = page.matchAll(
      /\/ohbyeongeo-church\/assets\/([^\"'<> ]+\.js)/g,
    );
    for (const [, filename] of references) {
      assert.ok(assets.has(filename), `missing exported asset: ${filename}`);
    }
  }
});

test("GitHub export removes stale hashed client generations", async () => {
  const assets = await readdir(new URL("../docs/assets/", import.meta.url));

  for (const prefix of [
    "AdminWorkspace",
    "BulletinExperience",
    "ChurchShell",
    "GitHubApp",
    "HomeLiveContent",
    "MusicPlayer",
    "NewsExperience",
    "TodayExperience",
    "client-content",
  ]) {
    assert.equal(
      assets.filter((name) => name.startsWith(`${prefix}-`) && name.endsWith(".js")).length,
      1,
      `expected one current ${prefix} asset`,
    );
  }

  assert.equal(assets.filter((name) => name.endsWith(".css")).length, 1);
});

test("GitHub today page preserves the original August 1 word and later daily words", async () => {
  const today = await read("docs/today/index.html");

  for (const date of ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04"]) {
    assert.match(today, new RegExp(`/ohbyeongeo-church/today\\?date=${date}`));
  }

  assert.match(today, /내 손에 있는 작은 것을 주님께 드릴 때/);
  assert.match(today, /요한복음 6장 9절/);
  assert.match(today, /내 생각보다 주님의 길을 신뢰하기/);
  assert.match(today, /말씀의 빛을 따라 한 걸음씩/);
  assert.match(today, /<span>토<\/span><strong>01일<\/strong>/);
  assert.match(today, /<span>월<\/span><strong>03일<\/strong>/);
  assert.match(today, /<span>화<\/span><strong>04일<\/strong>/);
});
