// Serveur InfoLycée : fichiers statiques + petite API de stockage (aucune dépendance).
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = process.env.PORT || 3000;
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data');
const PUB = path.join(__dirname, 'public');
fs.mkdirSync(path.join(DATA, 'docs'), { recursive: true });

// Code d'inscription professeur : variable TEACHER_CODE, sinon généré une fois et enregistré.
let CODE = process.env.TEACHER_CODE;
const cf = path.join(DATA, 'teacher-code.txt');
if (!CODE) {
  try { CODE = fs.readFileSync(cf, 'utf8').trim(); }
  catch (e) { CODE = crypto.randomBytes(4).toString('hex'); fs.writeFileSync(cf, CODE); }
}
console.log('Code d’inscription professeur :', CODE);

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };
const OKPATH = /^(platform\/state|files\/[A-Za-z0-9_]+)$/;
const file = p => path.join(DATA, 'docs', encodeURIComponent(p) + '.json');
const readDoc = p => { try { return JSON.parse(fs.readFileSync(file(p), 'utf8')); } catch (e) { return null; } };
const writeDoc = (p, d) => { const f = file(p), t = f + '.tmp'; fs.writeFileSync(t, JSON.stringify(d)); fs.renameSync(t, f); };
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
const profs = s => { try { return (JSON.parse(s.data.json).users || []).filter(u => u.role === 'prof').length; } catch (e) { return 0; } };

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url.startsWith('/api/doc/')) {
    const p = url.slice(9);
    if (!OKPATH.test(p)) return send(res, 400, { error: 'chemin invalide' });
    let body = '';
    req.on('data', c => { body += c; if (body.length > 30e6) req.destroy(); });
    req.on('end', () => {
      const cur = readDoc(p);
      if (req.method === 'GET') return send(res, 200, cur ? { exists: true, v: cur.v, data: cur.data } : { exists: false, v: 0 });
      if (req.method === 'DELETE') { try { fs.unlinkSync(file(p)); } catch (e) {} return send(res, 200, { ok: true }); }
      if (req.method !== 'PUT') return send(res, 405, { error: 'méthode' });
      let data; try { data = JSON.parse(body).data; } catch (e) { return send(res, 400, { error: 'json' }); }
      const v = cur ? cur.v : 0, im = req.headers['if-match'];
      if (im !== undefined && Number(im) !== v) return send(res, 409, { error: 'conflit', v });
      if (p === 'platform/state') {
      }
      writeDoc(p, { v: v + 1, data });
      send(res, 200, { ok: true, v: v + 1 });
    });
    return;
  }
  // Fichiers statiques : / = page professeur, /eleve = page élève
  let rel = url === '/' || url === '/prof' ? '/index.html' : url === '/eleve' ? '/eleve.html' : url;
  const f = path.normalize(path.join(PUB, rel));
  if (!f.startsWith(PUB + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('Page introuvable'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log('InfoLycée : http://localhost:' + PORT + '  (élèves : /eleve)'));
