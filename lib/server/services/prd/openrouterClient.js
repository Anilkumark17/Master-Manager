import { Agent, fetch as undiciFetch } from "undici";

/**
 * OpenRouter via Undici fetch (OpenAI-compatible chat completions).
 * Long default body timeouts on global fetch can reset mid-generation.
 */
const openRouterAgent = new Agent({
  connectTimeout: 120_000,
  headersTimeout: 1_800_000,
  bodyTimeout: 1_800_000,
});

/** Trim and strip a single pair of surrounding quotes from .env values. */
function cleanEnvString(value) {
  if (value == null || value === "") {
    return "";
  }
  let s = String(value).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function getApiKey() {
  return cleanEnvString(process.env.OPENROUTER_API_KEY);
}

function getModel() {
  return (
    cleanEnvString(process.env.OPENROUTER_MODEL) ||
    cleanEnvString(process.env.MODEL) ||
    "google/gemini-2.5-pro"
  );
}

function getRequestHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Connection: "keep-alive",
    "HTTP-Referer":
      cleanEnvString(process.env.OPENROUTER_HTTP_REFERER) ||
      cleanEnvString(process.env.NEXT_PUBLIC_APP_URL) ||
      "http://localhost:3000",
    "X-Title":
      cleanEnvString(process.env.OPENROUTER_APP_NAME) || "Master Manager",
  };
}

/**
 * OpenAI-compatible base or full chat URL.
 * Default: https://openrouter.ai/api/v1 → chat at …/api/v1/chat/completions
 */
function getConfiguredUrlRaw() {
  let raw = cleanEnvString(
    process.env.OPENROUTER_URL ||
      process.env.OPENROUTER_BASE_URL ||
      "https://openrouter.ai/api/v1"
  );
  if (!raw) {
    raw = "https://openrouter.ai/api/v1";
  }
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
    throw new Error("OPENROUTER_API_KEY is not set in .env.local");
  }

  const model = getModel();
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
  const response = await undiciFetch(url, {
    method: "POST",
    headers: getRequestHeaders(apiKey),
    body: JSON.stringify(payload),
    dispatcher: openRouterAgent,
  });

  const rawText = await response.text();
  let data;
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    throw new Error(
      `OpenRouter returned non-JSON (${response.status}) at ${url}`
    );
  }

  if (!response.ok) {
    const msg =
      data.error?.message ||
      data.message ||
      rawText.slice(0, 500) ||
      response.statusText;
    throw new Error(`OpenRouter ${response.status} at ${url}: ${msg}`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text || typeof text !== "string") {
    const keys =
      data && typeof data === "object" ? Object.keys(data).join(",") : "";
    throw new Error(
      `Empty or invalid response from model (choices[0].message.content missing). Top-level keys: ${keys || "none"}. Snippet: ${rawText.slice(0, 280)}`
    );
  }
  return { text, model: data.model || model };
}

/**
 * Stream chat completions (OpenAI-compatible SSE). Yields text deltas only.
 * @param {{ role: string; content: string }[]} messages
 * @param {{ temperature?: number; maxTokens?: number }} options
 * @returns {AsyncGenerator<string, void, void>}
 */
async function* chatStream(messages, options = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in .env.local");
  }

  const model = getModel();
  const url = getChatCompletionsUrl();
  const payload = {
    model,
    messages,
    temperature: options.temperature ?? 0.35,
    max_tokens: options.maxTokens ?? 12000,
    stream: true,
  };

  const response = await undiciFetch(url, {
    method: "POST",
    headers: getRequestHeaders(apiKey),
    body: JSON.stringify(payload),
    dispatcher: openRouterAgent,
  });

  if (!response.ok) {
    const rawText = await response.text();
    let data;
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = {};
    }
    const msg =
      data.error?.message ||
      data.message ||
      rawText.slice(0, 500) ||
      response.statusText;
    throw new Error(`OpenRouter ${response.status} at ${url}: ${msg}`);
  }

  if (response.body && typeof response.body.getReader === "function") {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (value) {
        buffer += decoder.decode(value, { stream: true });
      }
      let nl;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer
          .slice(0, nl)
          .replace(/\r$/, "")
          .trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith("data:")) {
          continue;
        }
        const dataStr = line.slice(5).trim();
        if (dataStr === "[DONE]") {
          return;
        }
        try {
          const json = JSON.parse(dataStr);
          const piece = json.choices?.[0]?.delta?.content;
          if (typeof piece === "string" && piece.length > 0) {
            yield piece;
          }
        } catch {
          /* ignore partial lines */
        }
      }
      if (done) {
        break;
      }
    }
    return;
  }

  /** Non-streaming JSON fallback (some gateways buffer the full body). */
  const rawText = await response.text();
  let data;
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    throw new Error("OpenRouter returned non-JSON while streaming");
  }
  const text = data.choices?.[0]?.message?.content;
  if (typeof text === "string" && text) {
    yield text;
  }
}

export {
  chat,
  chatStream,
  getApiKey,
  getBaseUrl,
  getChatCompletionsUrl,
  getModel,
};
