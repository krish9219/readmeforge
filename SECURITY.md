# Security policy

## Supported versions

Only the `main` branch is supported. Once we publish to npm, the latest published version will also be supported.

## Reporting

Email the maintainer via the GitHub profile, or use GitHub's private vulnerability reporting feature on this repo. Please do not open public issues for security concerns.

## What this tool sends to third parties

`readmeforge` reads files from the directory you point it at and sends their contents to the LLM provider you configured (OpenAI by default, Anthropic with `--provider anthropic`). Be deliberate about:

- Running it inside repos containing secrets. The scanner does not strip API keys from file contents — review your `.env` is in `.gitignore` and your source files don't contain inline secrets.
- Running it on private code with a public-key provider. Configure a private endpoint or a self-hosted Ollama if your code can't leave your network.

You can preview the exact prompt with `--dry-run`. Always use that on a repo before its first real run.
