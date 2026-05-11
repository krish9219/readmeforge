const DEFAULTS = {
  openai: "gpt-4o-mini",
  anthropic: "claude-haiku-4-5-20251001",
};

export async function generate(prompt, { provider = "openai", model } = {}) {
  const m = model ?? DEFAULTS[provider];
  if (!m) throw new Error(`Unknown provider: ${provider}`);
  if (provider === "openai") return openai(prompt, m);
  if (provider === "anthropic") return anthropic(prompt, m);
  throw new Error(`Unknown provider: ${provider}`);
}

async function openai(prompt, model) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!resp.ok) {
    throw new Error(`OpenAI ${resp.status}: ${await resp.text()}`);
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function anthropic(prompt, model) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!resp.ok) {
    throw new Error(`Anthropic ${resp.status}: ${await resp.text()}`);
  }
  const data = await resp.json();
  return data.content?.[0]?.text ?? "";
}
