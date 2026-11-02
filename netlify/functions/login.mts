import type { Config } from "@netlify/functions";
import { isEditor, json } from "../lib/auth.mts";

export default async (req: Request) => {
  if (!isEditor(req)) {
    await new Promise((r) => setTimeout(r, 800)); // frena los intentos repetidos
    return json({ ok: false }, 401);
  }
  return json({ ok: true });
};

export const config: Config = { path: "/api/login", method: "POST" };
