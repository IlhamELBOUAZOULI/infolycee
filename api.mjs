// API de stockage InfoLycée pour Netlify (remplace server.js). Données dans Netlify Blobs.
import { getStore } from "@netlify/blobs";

const OKPATH = /^(platform\/state|files\/[A-Za-z0-9_]+)$/;
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export default async (req) => {
  const url = new URL(req.url);
  const p = decodeURIComponent(url.pathname.replace(/^\/api\/doc\//, ""));
  if (!OKPATH.test(p)) return json({ error: "chemin invalide" }, 400);

  const store = getStore("infolycee-docs");
  const key = encodeURIComponent(p);
  const cur = await store.get(key, { type: "json" });

  if (req.method === "GET")
    return json(cur ? { exists: true, v: cur.v, data: cur.data } : { exists: false, v: 0 });

  if (req.method === "DELETE") {
    await store.delete(key);
    return json({ ok: true });
  }

  if (req.method !== "PUT") return json({ error: "méthode" }, 405);

  let data;
  try {
    data = (await req.json()).data;
  } catch (e) {
    return json({ error: "json" }, 400);
  }
  const v = cur ? cur.v : 0;
  const im = req.headers.get("if-match");
  if (im !== null && Number(im) !== v) return json({ error: "conflit", v }, 409);

  await store.setJSON(key, { v: v + 1, data });
  return json({ ok: true, v: v + 1 });
};

export const config = { path: "/api/doc/*" };
