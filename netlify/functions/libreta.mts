import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";
import { isEditor, json } from "../lib/auth.mts";

const KEY = "libreta";
const STAMP = "libreta-stamp";

export default async (req: Request) => {
  const store = getStore({ name: "libreta", consistency: "strong" });

  if (req.method === "GET") {
    /* Si quien lee ya tiene la última versión, se contesta "sin cambios" sin volver a mandar toda la libreta */
    const inm = req.headers.get("if-none-match");
    if (inm) {
      const stamp = await store.get(STAMP, { type: "text" });
      if (stamp && inm === '"' + stamp + '"') {
        return new Response(null, { status: 304, headers: { etag: '"' + stamp + '"', "cache-control": "no-cache" } });
      }
    }
    const saved = (await store.get(KEY, { type: "json" })) as { updated_at?: string } | null;
    if (!saved) return json({ error: "vacia" }, 404);
    const res = json(saved);
    if (saved.updated_at) { res.headers.set("etag", '"' + saved.updated_at + '"'); res.headers.set("cache-control", "no-cache"); }
    return res;
  }

  if (req.method === "PUT") {
    if (!isEditor(req)) return json({ error: "no autorizado" }, 401);
    let body: { data?: unknown; updated_at?: string };
    try { body = await req.json(); } catch { return json({ error: "json no valido" }, 400); }
    const data = body && body.data as { paginas?: unknown };
    if (!data || typeof data !== "object" || !Array.isArray(data.paginas)) return json({ error: "datos no validos" }, 400);
    const updated_at = new Date().toISOString();
    await store.setJSON(KEY, { data, updated_at });
    await store.set(STAMP, updated_at);
    return json({ ok: true, updated_at });
  }

  return json({ error: "metodo no permitido" }, 405);
};

export const config: Config = { path: "/api/libreta", method: ["GET", "PUT"] };
