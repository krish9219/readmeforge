import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  ".venv",
  "venv",
  "__pycache__",
  "dist",
  "build",
  ".next",
  ".nuxt",
  "target",
  "vendor",
  ".idea",
  ".vscode",
  "coverage",
  ".pytest_cache",
  ".cache",
  ".turbo",
]);

const SKIP_EXTS = new Set([
  ".lock",
  ".lockb",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".mp4",
  ".mov",
  ".wav",
  ".mp3",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".pyc",
]);

const PRIORITY_FILES = [
  "package.json",
  "pyproject.toml",
  "requirements.txt",
  "Cargo.toml",
  "go.mod",
  "Gemfile",
  "composer.json",
  "Dockerfile",
  "docker-compose.yml",
  "README.md",
];

export async function scanRepo(dir, { maxFiles = 40, maxBytes = 4000 } = {}) {
  const entries = await collect(dir, dir);
  entries.sort((a, b) => priority(a.rel) - priority(b.rel) || a.rel.localeCompare(b.rel));

  const files = [];
  let totalBytes = 0;
  for (const entry of entries) {
    if (files.length >= maxFiles) break;
    try {
      const buf = await readFile(entry.abs);
      const text = buf.toString("utf8", 0, Math.min(buf.length, maxBytes));
      files.push({ path: entry.rel, content: text, truncated: buf.length > maxBytes });
      totalBytes += Math.min(buf.length, maxBytes);
    } catch {
      // unreadable / binary — skip
    }
  }

  return { root: dir, files, totalBytes, tree: entries.map((e) => e.rel) };
}

function priority(rel) {
  const base = rel.split(/[\\/]/).pop();
  const idx = PRIORITY_FILES.indexOf(base);
  if (idx !== -1) return idx;
  if (rel.startsWith("src/")) return 100;
  if (rel.startsWith("lib/")) return 110;
  return 200;
}

async function collect(root, dir) {
  const out = [];
  const items = await readdir(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.name.startsWith(".") && item.name !== ".github") continue;
    if (SKIP_DIRS.has(item.name)) continue;
    const abs = join(dir, item.name);
    if (item.isDirectory()) {
      out.push(...(await collect(root, abs)));
    } else if (item.isFile()) {
      const lower = item.name.toLowerCase();
      if ([...SKIP_EXTS].some((ext) => lower.endsWith(ext))) continue;
      const st = await stat(abs);
      if (st.size > 200_000) continue;
      out.push({ abs, rel: relative(root, abs).replaceAll("\\", "/") });
    }
  }
  return out;
}
