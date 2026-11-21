// Remplace le stockage de l'aperçu par l'API du serveur (mêmes méthodes : doc(path).get/set/delete).
(function () {
  const V = {};
  async function api(m, p, b, h) {
    const r = await fetch('/api/doc/' + p, { method: m, headers: Object.assign({ 'Content-Type': 'application/json' }, h || {}), body: b ? JSON.stringify(b) : undefined });
    if (r.status === 409) { const e = new Error('conflict'); e.conflict = true; throw e; }
    if (r.status === 403) { const e = new Error('forbidden'); e.forbidden = true; throw e; }
    if (!r.ok) throw new Error('http ' + r.status);
    return r.json();
  }
  const db = { doc: p => ({
    async get() { const j = await api('GET', p); V[p] = j.v; return { exists: j.exists, data: () => j.data }; },
    async set(d) {
      const h = {}; if (p in V) h['If-Match'] = V[p]; if (window.__tc) h['X-Teacher-Code'] = window.__tc;
      const j = await api('PUT', p, { data: d }, h); V[p] = j.v;
    },
    async delete() { await api('DELETE', p); }
  }) };
  window.claude = { use: async n => (n === 'db' ? db : null) };
})();
