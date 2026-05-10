/**
 * FastRouter via native fetch (OpenAI-compatible chat completions).
 * Avoids the `openai` npm package, which can break on some Node installs.
 */

function getApiKey() {
  return (
    process.env.FASTROUTER_API_KEY ||
    process.env.API_key ||
    process.env.API_KEY
  );
}

function getConfiguredUrlRaw() {
  const raw =
    process.env.FASTROUTER_URL ||
    process.env.FASTROUTER_BASE_URL ||
    "https://api.fastrouter.ai/api/v1";
  return raw.replace(/\/$/, "");
}

/** API root without `/chat/completions` (for logging / exports). */
function getBaseUrl() {
  const raw = getConfiguredUrlRaw();
  return raw.replace(/\/chat\/completions$/i, "");
}

/** Full chat-completions endpoint; accepts either base URL or full OpenAI-style path. */
function getChatCompletionsUrl() {
  const raw = getConfiguredUrlRaw();
  if (/\/chat\/completions$/i.test(raw)) {
    return raw;
  }
  return `${raw}/chat/completions`;
}

/**
 * @param {{ role: string; content: string }[]} messages
 * @param {{ temperature?: number; maxTokens?: number; jsonObject?: boolean }} options
 */
async function chat(messages, options = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "FASTROUTER_API_KEY is not set (or use API_key in backend .env)"
    );
  }

  const model =
    process.env.FASTROUTER_MODEL ||
    process.env.MODEL ||
    "google/gemini-2.5-pro";

  const url = getChatCompletionsUrl();
  const payload = {
    model,
    messages,
    temperature: options.temperature ?? 0.35,
    max_tokens: options.maxTokens ?? 16000,
  };
  if (options.jsonObject) {
    payload.response_format = { type: "json_object" };
  }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Connection: "keep-alive",
    },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  let data;
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    throw new Error(`FastRouter returned non-JSON (${response.status})`);
  }

  if (!response.ok) {
    const msg =
      data.error?.message ||
      data.message ||
      rawText.slice(0, 500) ||
      response.statusText;
    throw new Error(`FastRouter ${response.status}: ${msg}`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text || typeof text !== "string") {
    throw new Error("Empty or invalid response from model");
  }
  return { text, model };
}

module.exports = { chat, getApiKey, getBaseUrl, getChatCompletionsUrl };
