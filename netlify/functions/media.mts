import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";
import { randomBytes } from "node:crypto";
import { isEditor, json } from "../lib/auth.mts";

const ALLOWED = /^(image\/(jpeg|png|webp|gif)|video\/(mp4|webm|quicktime|ogg))$/;

export default async (req: Request, context: Context) => {
  const store = getStore({ name: "media", consistency: "strong" });
  const key = context.params?.key;

  if (req.method === "GET" && key) {
    if (!/^[a-z0-9-]+\.[a-z0-9]{1,5}$/.test(key)) return new Response("No encontrado", { status: 404 });
    const found = await store.getWithMetadata(key, { type: "arrayBuffer" });
    if (!found) return new Response("No encontrado", { status: 404 });
    const type = String((found.metadata as { type?: string })?.type || "application/octet-stream");
    return new Response(found.data as ArrayBuffer, {
      headers: { "content-type": type, "cache-control": "public, max-age=31536000, immutable" },
    });
  }

  if (req.method === "POST" && !key) {
    if (!isEditor(req)) return json({ error: "no autorizado" }, 401);
    const type = (req.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED.test(type)) return json({ error: "tipo no permitido" }, 415);
    const ext = (new URL(req.url).searchParams.get("ext") || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
    const body = await req.arrayBuffer();
    if (!body.byteLength) return json({ error: "archivo vacio" }, 400);
    const name = Date.now().toString(36) + "-" + randomBytes(6).toString("hex") + "." + ext;
    await store.set(name, body, { metadata: { type } });
    return json({ ok: true, url: "/api/media/" + name });
  }

  return json({ error: "metodo no permitido" }, 405);
};

export const config: Config = { path: ["/api/media", "/api/media/:key"], method: ["GET", "POST"] };
