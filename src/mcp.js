// Stateless MCP server (streamable HTTP, JSON responses) for the MindHarbor ChatGPT plugin.
// Tools only return built-in reference content; nothing is stored or logged.

const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const SERVER_INFO = { name: "mindharbor", title: "MindHarbor", version: "0.5.0" };
const INSTRUCTIONS =
  "Use find_support_lines whenever the user mentions self-harm, suicide, harming others or being in danger, " +
  "or asks where to get help; share the emergency number first. Use get_calming_exercise when the user feels " +
  "anxious, overwhelmed or can't settle and wants something to do right now. Both tools only return reference text.";

// Reviewed 2026-10-21. Keep to well-known national services; anything else falls back to findahelpline.com.
const SUPPORT_LINES = {
  TW: {
    country: "Taiwan",
    emergency: [{ name: "救護車／消防 Ambulance & fire", number: "119" }, { name: "警察 Police", number: "110" }],
    lines: [
      { name: "安心專線 Mental Health Hotline", number: "1925", note: "24 小時 / 24 hours" },
      { name: "生命線 Lifeline", number: "1995" },
      { name: "張老師 Teacher Chang", number: "1980" },
    ],
  },
  US: {
    country: "United States",
    emergency: [{ name: "Emergency", number: "911" }],
    lines: [
      { name: "988 Suicide & Crisis Lifeline", number: "988", note: "Call or text, 24 hours" },
      { name: "Crisis Text Line", number: "741741", note: "Text HOME" },
    ],
  },
  CA: {
    country: "Canada",
    emergency: [{ name: "Emergency", number: "911" }],
    lines: [{ name: "9-8-8 Suicide Crisis Helpline", number: "988", note: "Call or text, 24 hours" }],
  },
  GB: {
    country: "United Kingdom",
    emergency: [{ name: "Emergency", number: "999" }],
    lines: [
      { name: "Samaritans", number: "116 123", note: "Free, 24 hours" },
      { name: "NHS 111 (England)", number: "111", note: "Urgent mental health help" },
    ],
  },
  AU: {
    country: "Australia",
    emergency: [{ name: "Emergency", number: "000" }],
    lines: [
      { name: "Lifeline", number: "13 11 14", note: "24 hours" },
      { name: "Beyond Blue", number: "1300 22 4636" },
    ],
  },
  HK: {
    country: "Hong Kong",
    emergency: [{ name: "Emergency", number: "999" }],
    lines: [
      { name: "撒瑪利亞防止自殺會 Samaritan Befrienders Hong Kong", number: "2389 2222", note: "24 hours" },
      { name: "香港撒瑪利亞會 The Samaritans Hong Kong", number: "2896 0000", note: "24 hours" },
    ],
  },
};
const FALLBACK_URL = "https://findahelpline.com";

const EXERCISES = {
  box_breathing: {
    "zh-TW": {
      title: "方塊呼吸",
      steps: ["用鼻子慢慢吸氣，心裡數 4 秒。", "停住呼吸，數 4 秒。", "用嘴巴慢慢吐氣，數 4 秒。", "再停 4 秒。", "重複 4 輪，或做到身體鬆一點為止。"],
    },
    en: {
      title: "Box breathing",
      steps: ["Breathe in slowly through your nose for a count of 4.", "Hold for 4.", "Breathe out slowly through your mouth for 4.", "Hold for 4.", "Repeat for 4 rounds, or until your body feels a little looser."],
    },
  },
  five_senses: {
    "zh-TW": {
      title: "5-4-3-2-1 感官練習",
      steps: ["說出你看得到的 5 樣東西。", "注意 4 樣你摸得到的東西，例如衣服或椅子。", "聽 3 種聲音。", "找 2 種聞得到的味道。", "說出 1 種嘗得到的味道，或一件你喜歡自己的事。"],
    },
    en: {
      title: "5-4-3-2-1 grounding",
      steps: ["Name 5 things you can see.", "Notice 4 things you can touch, like your clothes or the chair.", "Listen for 3 sounds.", "Find 2 things you can smell.", "Name 1 thing you can taste, or one thing you like about yourself."],
    },
  },
};

const TOOLS = [
  {
    name: "find_support_lines",
    title: "Find support hotlines",
    description:
      "Use this when the user mentions self-harm, suicide, harming someone, being in danger, or asks where to find a crisis or mental health hotline. Returns the emergency number and well-known free support lines for a country.",
    inputSchema: {
      type: "object",
      properties: {
        country: {
          type: "string",
          description: "ISO 3166-1 alpha-2 country code of where the user is, for example TW or US. Infer from the conversation; use TW if unknown and the user writes Traditional Chinese.",
          pattern: "^[A-Za-z]{2}$",
        },
      },
      required: ["country"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        country: { type: "string" },
        covered: { type: "boolean" },
        emergency: { type: "array", items: { type: "object", properties: { name: { type: "string" }, number: { type: "string" } }, required: ["name", "number"] } },
        lines: { type: "array", items: { type: "object", properties: { name: { type: "string" }, number: { type: "string" }, note: { type: "string" } }, required: ["name", "number"] } },
        more_info_url: { type: "string" },
      },
      required: ["country", "covered", "emergency", "lines", "more_info_url"],
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false, idempotentHint: true },
  },
  {
    name: "get_calming_exercise",
    title: "Get a calming exercise",
    description:
      "Use this when the user feels anxious, panicky, overwhelmed or unable to settle and wants something to do right now. Returns short step-by-step instructions to guide them through, one step at a time.",
    inputSchema: {
      type: "object",
      properties: {
        exercise: { type: "string", enum: Object.keys(EXERCISES), description: "box_breathing for slowing down breathing; five_senses for grounding in the present moment." },
        language: { type: "string", enum: ["zh-TW", "en"], description: "Language of the steps; match the user's language." },
      },
      required: ["exercise"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: { exercise: { type: "string" }, title: { type: "string" }, steps: { type: "array", items: { type: "string" } } },
      required: ["exercise", "title", "steps"],
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false, idempotentHint: true },
  },
];

function findSupportLines({ country }) {
  if (typeof country !== "string" || !/^[A-Za-z]{2}$/.test(country)) throw new ToolInputError("country must be a two-letter ISO code, for example TW.");
  const code = country.toUpperCase();
  const entry = SUPPORT_LINES[code];
  const data = entry
    ? { country: entry.country, covered: true, emergency: entry.emergency, lines: entry.lines, more_info_url: FALLBACK_URL }
    : { country: code, covered: false, emergency: [], lines: [], more_info_url: FALLBACK_URL };
  const text = entry
    ? `${entry.country}: emergency ${entry.emergency.map((e) => `${e.name} ${e.number}`).join(", ")}. Support lines: ${entry.lines
        .map((l) => `${l.name} ${l.number}${l.note ? ` (${l.note})` : ""}`)
        .join("; ")}. More: ${FALLBACK_URL}`
    : `No built-in list for ${code}. Tell the user to call their local emergency number if they are in danger, and find a free local line at ${FALLBACK_URL}.`;
  return { data, text };
}

function getCalmingExercise({ exercise, language }) {
  const set = EXERCISES[exercise];
  if (!set) throw new ToolInputError(`exercise must be one of: ${Object.keys(EXERCISES).join(", ")}.`);
  const lang = language === "en" ? "en" : "zh-TW";
  const { title, steps } = set[lang];
  return { data: { exercise, title, steps }, text: `${title}\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}` };
}

const HANDLERS = { find_support_lines: findSupportLines, get_calming_exercise: getCalmingExercise };

class ToolInputError extends Error {}

function rpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function rpcError(id, code, message) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

function handleMessage(msg) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return rpcError(msg?.id, -32600, "Invalid Request");
  const isNotification = !("id" in msg);
  if (isNotification) return null;
  const { id, method, params = {} } = msg;

  switch (method) {
    case "initialize": {
      const requested = params.protocolVersion;
      const protocolVersion = PROTOCOL_VERSIONS.includes(requested) ? requested : PROTOCOL_VERSIONS[0];
      return rpcResult(id, { protocolVersion, capabilities: { tools: { listChanged: false } }, serverInfo: SERVER_INFO, instructions: INSTRUCTIONS });
    }
    case "ping":
      return rpcResult(id, {});
    case "tools/list":
      return rpcResult(id, { tools: TOOLS });
    case "tools/call": {
      const handler = HANDLERS[params.name];
      if (!handler) return rpcError(id, -32602, `Unknown tool: ${params.name}`);
      try {
        const { data, text } = handler(params.arguments || {});
        return rpcResult(id, { content: [{ type: "text", text }], structuredContent: data, isError: false });
      } catch (err) {
        if (err instanceof ToolInputError) return rpcResult(id, { content: [{ type: "text", text: err.message }], isError: true });
        throw err;
      }
    }
    default:
      return rpcError(id, -32601, `Method not found: ${method}`);
  }
}

export async function handleMcp(request) {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(rpcError(null, -32700, "Parse error"), { status: 400 });
  }

  const replies = (Array.isArray(body) ? body : [body]).map(handleMessage).filter(Boolean);
  if (replies.length === 0) return new Response(null, { status: 202 });
  return Response.json(Array.isArray(body) ? replies : replies[0]);
}
