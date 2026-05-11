export function buildPrompt(repo) {
  const fileBlocks = repo.files
    .map((f) => `### ${f.path}${f.truncated ? " (truncated)" : ""}\n\`\`\`\n${f.content}\n\`\`\``)
    .join("\n\n");

  return `You are a senior open-source maintainer writing a README that will be the first thing potential users see on GitHub. Your goal is to make a developer who is skimming for 8 seconds decide to star and try the project.

Output GitHub-flavored Markdown. Do not include any preamble like "Here is the README". Just emit the README body, starting with the H1.

The README MUST include, in this order:

1. **H1 title** — the project name as inferred from package.json / pyproject / directory name.
2. **One-line pitch** — italicized, under 100 chars, what it does and for whom.
3. **Why this exists** — 2-3 sentences. The pain it solves. The thing it does differently. No buzzwords.
4. **Quick start** — copy-pasteable commands. Install, configure, run. Assume zero prior context.
5. **Example** — at least one realistic input/output snippet.
6. **Features** — 4-7 bullets. Each bullet leads with a verb.
7. **How it works** — short paragraph or numbered steps. Explain the actual mechanism, not marketing.
8. **Configuration / environment variables** — only the ones the user will touch.
9. **License** — one line referencing the LICENSE file.

Tone: confident, specific, no emojis unless the project itself uses them. Avoid the words "robust," "powerful," "seamlessly," "blazing." Write like a person, not a marketing page.

Length: 400-900 words. Don't pad.

If the repo appears to have no working code or only placeholders, say so plainly in the "Why this exists" section. Don't invent features.

---

Here is the repo:

**Path**: ${repo.root}
**File count (sampled)**: ${repo.files.length} of ${repo.tree.length}

**File tree (sampled):**
\`\`\`
${repo.tree.slice(0, 80).join("\n")}
\`\`\`

**File contents:**

${fileBlocks}
`;
}
