import { createHash, timingSafeEqual } from "node:crypto";

/** Solo quien conoce la contraseña (variable EDITOR_PASSWORD) puede escribir. */
export function isEditor(req: Request): boolean {
  const expected = Netlify.env.get("EDITOR_PASSWORD") || "";
  const given = req.headers.get("x-clave") || "";
  if (!expected || !given) return false;
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
