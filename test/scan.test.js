import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { scanRepo } from "../src/scan.js";
import { buildPrompt } from "../src/prompt.js";

function makeRepo() {
  const dir = mkdtempSync(join(tmpdir(), "rf-"));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "demo" }));
  writeFileSync(join(dir, "index.js"), "export const x = 1;\n");
  mkdirSync(join(dir, "node_modules", "left-pad"), { recursive: true });
  writeFileSync(join(dir, "node_modules", "left-pad", "index.js"), "// noise");
  mkdirSync(join(dir, ".git"), { recursive: true });
  writeFileSync(join(dir, ".git", "HEAD"), "ref: refs/heads/main");
  writeFileSync(join(dir, "logo.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  return dir;
}

test("scan skips node_modules, .git, and binary files", async () => {
  const dir = makeRepo();
  try {
    const repo = await scanRepo(dir);
    const paths = repo.files.map((f) => f.path);
    assert.ok(paths.includes("package.json"));
    assert.ok(paths.includes("index.js"));
    assert.ok(!paths.some((p) => p.includes("node_modules")));
    assert.ok(!paths.some((p) => p.includes(".git")));
    assert.ok(!paths.includes("logo.png"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("priority puts package.json first", async () => {
  const dir = makeRepo();
  try {
    const repo = await scanRepo(dir);
    assert.equal(repo.files[0].path, "package.json");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("buildPrompt embeds file contents and tree", async () => {
  const dir = makeRepo();
  try {
    const repo = await scanRepo(dir);
    const prompt = buildPrompt(repo);
    assert.match(prompt, /package\.json/);
    assert.match(prompt, /export const x = 1/);
    assert.match(prompt, /File tree/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
