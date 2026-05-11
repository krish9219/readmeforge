# Contributing

Thanks for considering a contribution.

## Setup

```bash
git clone https://github.com/krish9219/readmeforge
cd readmeforge
npm install
npm test
```

## Likely to be accepted

- New scanner heuristics (better file prioritization, new file types to skip).
- New provider adapters in `src/providers.js`.
- Prompt improvements that produce demonstrably better READMEs (include before/after).
- Tests, docs, CI improvements.

## Unlikely to be accepted

- Interactive prompt wizards (`inquirer`-style). `readmeforge` is a flag-driven CLI on purpose.
- Templating engines for the prompt. `src/prompt.js` is a plain string for a reason.
- Heavy dependencies (think hard before adding any).

## Checklist

- [ ] `npm test` passes.
- [ ] If you changed scanning behavior, add a test.
- [ ] If you changed the prompt, paste a before/after for one example repo in your PR description.
- [ ] No new heavy dependencies.
