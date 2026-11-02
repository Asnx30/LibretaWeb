import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";
import { isEditor, json } from "../lib/auth.mts";

const KEY = "libreta";

export default async (req: Request) => {
  const store = getStore({ name: "libreta", consistency: "strong" });

  if (req.method === "GET") {
    const saved = await store.get(KEY, { type: "json" });
    if (!saved) return json({ error: "vacia" }, 404);
    return json(saved);
  }

  if (req.method === "PUT") {
    if (!isEditor(req)) return json({ error: "no autorizado" }, 401);
    let body: { data?: unknown; updated_at?: string };
    try { body = await req.json(); } catch { return json({ error: "json no valido" }, 400); }
    const data = body && body.data as { paginas?: unknown };
    if (!data || typeof data !== "object" || !Array.isArray(data.paginas)) return json({ error: "datos no validos" }, 400);
    const updated_at = new Date().toISOString();
    await store.setJSON(KEY, { data, updated_at });
    return json({ ok: true, updated_at });
  }

  return json({ error: "metodo no permitido" }, 405);
};

export const config: Config = { path: "/api/libreta", method: ["GET", "PUT"] };
