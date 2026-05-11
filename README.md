# readmeforge

> *Generate a polished README from any repo in one command.*

`readmeforge` walks your repo, samples the files that actually matter (`package.json`, `pyproject.toml`, source files — never `node_modules` or images), builds a structured prompt, and asks an LLM to write the kind of README that wins a star in 8 seconds. No interactive wizard, no template that ignores your code. One command.

```bash
npx readmeforge ./my-repo --out README.md
```

That's the whole pitch.

## Quick start

```bash
# install globally
npm install -g readmeforge

# or use without installing
npx readmeforge .

# point it at a repo
readmeforge ~/code/my-project --out README.md

# preview without writing a file
readmeforge . --stdout

# use Claude instead of GPT
readmeforge . --provider anthropic --model claude-haiku-4-5-20251001
```

Set one env var depending on the provider:

```bash
export OPENAI_API_KEY=sk-...           # default
export ANTHROPIC_API_KEY=sk-ant-...    # with --provider anthropic
```

## Example

Run it against the `rag-in-100-lines` repo and it produces a README like:

```markdown
# rag-in-100-lines

> *A complete Retrieval-Augmented Generation engine in one Python file.*

Most RAG tutorials reach for LangChain before retrieving a single chunk.
The actual algorithm is small. This repo is the algorithm, end-to-end,
in 100 readable lines.

## Quick start
...
```

You then edit it. The point of `readmeforge` is not the final word — it's the first 80% of a good README so you can spend your time on the last 20%.

## Features

- **Smart scanning** — prioritizes `package.json`, `pyproject.toml`, `README`, then `src/`, then everything else; skips `node_modules`, `.git`, binary files, lockfiles, and giant blobs.
- **Token-aware** — caps per-file bytes and total files so you don't blow the model's context window on a monorepo.
- **Two providers** — OpenAI (default) and Anthropic Claude. Easy to add more.
- **Zero magic config** — every knob (model, file caps, output path) is a CLI flag.
- **Safe by default** — won't overwrite an existing `README.md` without `--force`.
- **Dry run** — `--dry-run` prints the prompt without calling the API. Useful for debugging and for offline review of what's being sent.

## How it works

1. **Scan.** Walk the directory, skip noise, sort files by priority (config first, source second, the rest after).
2. **Sample.** Read up to `--max-files` files, capped at `--max-bytes` per file. Default: 40 files × 4 KB.
3. **Prompt.** Embed the file tree + sampled contents into a structured prompt that tells the model exactly what sections to write, in what order, and what tone to avoid.
4. **Generate.** Single call to the chosen provider. No retries, no agents, no chains. If it fails, you see the error.
5. **Write.** Output to `README.generated.md` by default, or stdout with `--stdout`.

## Configuration

All flags are optional except the directory.

```
Usage: readmeforge [options] [dir]

Arguments:
  dir                      repo directory (default: ".")

Options:
  -p, --provider <name>    openai | anthropic (default: "openai")
  -m, --model <name>       model id (defaults per provider)
  -o, --out <path>         output file (default: "README.generated.md")
  -f, --force              overwrite existing output file
  --stdout                 print to stdout instead of writing a file
  --max-files <n>          max files to include in the prompt (default: 40)
  --max-bytes <n>          max bytes per file in the prompt (default: 4000)
  --dry-run                scan + build prompt but don't call the LLM
  -h, --help               display help
```

Environment variables:

- `OPENAI_API_KEY` — required for `--provider openai` (default)
- `ANTHROPIC_API_KEY` — required for `--provider anthropic`

## Why not just paste my repo into ChatGPT?

You can, and it'll work. The difference:

- You'd have to remember which files to paste. `readmeforge` picks them by relevance.
- You'd hit context limits on anything but tiny repos. `readmeforge` budgets the prompt.
- You'd write the instructions every time. `readmeforge` has a tuned prompt that bans the words "robust," "blazing," "seamless," and tells the model what sections to write.

## Tests

```bash
npm test
```

Unit tests cover scanning, priority ordering, and prompt assembly. They run without an API key.

## License

MIT — see [LICENSE](LICENSE).
