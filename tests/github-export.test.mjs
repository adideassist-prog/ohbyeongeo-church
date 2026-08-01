import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function read(relativePath) {
  return readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("GitHub export includes the hydrated administrator route", async () => {
  const admin = await read("docs/admin/index.html");
  assert.match(admin, /교회 홈페이지 관리/);
  assert.match(admin, /<script id="_R_">import\("\/ohbyeongeo-church\/assets\//);
  assert.match(admin, /name="robots" content="noindex, nofollow"/);
  assert.match(admin, /GitHubApp-/);
  assert.match(admin, /AdminWorkspace-/);
  assert.doesNotMatch(admin, /http-equiv="refresh"/i);
  assert.doesNotMatch(admin, /location\.replace/);
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

test("GitHub navigation keeps one music player mounted inside the SPA", async () => {
  const [home, admin] = await Promise.all([
    read("docs/index.html"),
    read("docs/admin/index.html"),
  ]);
  const assets = await readdir(new URL("../docs/assets/", import.meta.url));
  const musicAsset = assets.find((name) => /^MusicPlayer-.*\.js$/.test(name));
  const githubAppAsset = assets.find((name) => /^GitHubApp-.*\.js$/.test(name));

  assert.ok(musicAsset);
  assert.ok(githubAppAsset);
  const musicSource = await read(`docs/assets/${musicAsset}`);
  const githubAppSource = await read(`docs/assets/${githubAppAsset}`);

  assert.equal((home.match(/<audio\b/g) ?? []).length, 1);
  assert.equal((admin.match(/<audio\b/g) ?? []).length, 1);
  assert.match(githubAppSource, /pushState/);
  assert.match(githubAppSource, /popstate/);
  assert.match(githubAppSource, /\/ohbyeongeo-church/);
  assert.doesNotMatch(home, /window\.location\.assign/);
  assert.doesNotMatch(admin, /window\.location\.assign/);
  assert.doesNotMatch(home, /<audio[^>]*\bautoPlay=/);
  assert.match(musicSource, /\/ohbyeongeo-church\/audio\/grace-gathered-us\.m4a/);
  assert.doesNotMatch(musicSource, /src:`\/audio\/grace-gathered-us\.m4a/);
});
