import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { scanRepo } from "./scan.js";
import { buildPrompt } from "./prompt.js";
import { generate } from "./providers.js";

export async function run(argv) {
  const program = new Command();
  program
    .name("readmeforge")
    .description("Generate a polished README from any repo in one command.")
    .argument("[dir]", "repo directory", ".")
    .option("-p, --provider <name>", "openai | anthropic", "openai")
    .option("-m, --model <name>", "model id (defaults per provider)")
    .option("-o, --out <path>", "output file (default README.generated.md)", "README.generated.md")
    .option("-f, --force", "overwrite existing output file", false)
    .option("--stdout", "print to stdout instead of writing a file", false)
    .option("--max-files <n>", "max files to include in the prompt", "40")
    .option("--max-bytes <n>", "max bytes per file in the prompt", "4000")
    .option("--dry-run", "scan + build prompt but don't call the LLM", false)
    .parse(argv);

  const opts = program.opts();
  const dir = resolve(program.args[0] ?? ".");
  if (!existsSync(dir)) {
    throw new Error(`Directory does not exist: ${dir}`);
  }

  const scanSpinner = ora({ text: chalk.dim(`scanning ${dir}`) }).start();
  const repo = await scanRepo(dir, {
    maxFiles: Number(opts.maxFiles),
    maxBytes: Number(opts.maxBytes),
  });
  scanSpinner.succeed(
    chalk.green(`scanned ${repo.files.length} files, ${repo.totalBytes} bytes`)
  );

  const prompt = buildPrompt(repo);

  if (opts.dryRun) {
    console.log(prompt);
    return;
  }

  if (!opts.stdout && existsSync(opts.out) && !opts.force) {
    throw new Error(
      `${opts.out} already exists. Re-run with --force to overwrite, or pass --stdout / --out <path>.`
    );
  }

  const gen = ora({ text: chalk.dim(`asking ${opts.provider}…`) }).start();
  let readme;
  try {
    readme = await generate(prompt, {
      provider: opts.provider,
      model: opts.model,
    });
    gen.succeed(chalk.green(`generated ${readme.length} characters`));
  } catch (e) {
    gen.fail(chalk.red(e.message));
    throw e;
  }

  if (opts.stdout) {
    process.stdout.write(readme);
    return;
  }
  writeFileSync(opts.out, readme, "utf8");
  console.log(chalk.bold.green("✓ wrote"), chalk.cyan(opts.out));
}
