// Serves the static site, accepts anonymous feedback at POST /api/feedback,
// and hosts the ChatGPT plugin's MCP server at /mcp.
// Stores only what the form sends (no IP, no cookies, no user agent).

import { handleMcp } from "./mcp.js";

const FEELINGS = new Set(["helpful", "okay", "not-for-me"]);
const MAX_MESSAGE = 1000;
const MAX_CONTACT = 200;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/mcp") return handleMcp(request);
    // Domain verification for the OpenAI plugin portal; the token is set in wrangler.jsonc vars.
    if (url.pathname === "/.well-known/openai-apps-challenge") {
      if (!env.OPENAI_APPS_CHALLENGE) return new Response("Not Found", { status: 404 });
      return new Response(env.OPENAI_APPS_CHALLENGE, { headers: { "Content-Type": "text/plain" } });
    }
    if (url.pathname !== "/api/feedback") return env.ASSETS.fetch(request);
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });

    let form;
    try {
      form = await request.formData();
    } catch {
      return new Response("Bad Request", { status: 400 });
    }

    const lang = form.get("lang") === "en" ? "en" : "zh-TW";
    const back = new URL(lang === "en" ? "/en/#feedback-sent" : "/#feedback-sent", url).toString();

    // Honeypot: bots fill every field. Pretend success so they don't retry.
    if (form.get("website")) return Response.redirect(back, 303);

    const feeling = String(form.get("feeling") || "");
    const message = String(form.get("message") || "").trim().slice(0, MAX_MESSAGE);
    const contact = String(form.get("contact") || "").trim().slice(0, MAX_CONTACT);
    if (!FEELINGS.has(feeling) && !message) return new Response("Bad Request", { status: 400 });

    await env.FEEDBACK.prepare(
      "INSERT INTO feedback (created_at, lang, feeling, message, contact) VALUES (?, ?, ?, ?, ?)"
    ).bind(new Date().toISOString(), lang, FEELINGS.has(feeling) ? feeling : null, message || null, contact || null).run();

    return Response.redirect(back, 303);
  },
};
