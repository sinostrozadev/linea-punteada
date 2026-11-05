// Sube y programa Shorts de LÍNEA PUNTEADA en YouTube Studio a través del piloto de Bolita Lab (127.0.0.1:8777).
// El piloto NO vive en este repo: es /home/santiago/projects/yt/bolita-lab/herramientas/navegador/piloto.mjs
// (un solo usuario a la vez; skill navegador-piloto). Este script solo le habla por HTTP.
// Uso: LP_CANAL_ID=UC... node herramientas/navegador/subir-studio.mjs <id> <YYYY-MM-DD> <HH:MM>   (hora de Chile, 24h)
// LP_CANAL_ID = id del canal @lineapunteada (Studio → Configuración → Canal); sin él no se sube nada, para no
// subir por error al canal de Bolita Lab (la sesión de Google del piloto es la misma).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const B = 'http://127.0.0.1:8777';
const BANDEJA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'salida', 'bandeja');
const CANAL = process.env.LP_CANAL_ID;
const NOMBRE = process.env.LP_CANAL_NOMBRE || 'Línea Punteada'; // nombre visible del canal de marca (selector "Select a channel")
const [id, fecha, hora] = process.argv.slice(2);
if (!id || !fecha || !hora) { console.error('uso: node subir-studio.mjs <id> <YYYY-MM-DD> <HH:MM>'); process.exit(2); }

const q = (s) => encodeURIComponent(s);
const llamar = async (path) => { const r = await fetch(B + path); const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };
const esperar = (ms) => llamar(`/esperar?ms=${ms}`);
const evalJs = (js) => llamar(`/eval?js=${q(js)}`);
const textoDialogo = () => evalJs(`(document.querySelector('ytcp-uploads-dialog')?.innerText||'').replace(/\\n+/g,' | ')`);
const hasta = async (fn, ms = 60000, paso = 1000, nombre = 'condición') => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const v = await fn(); if (v) return v; await esperar(paso); }
  throw new Error('timeout esperando ' + nombre);
};
const fallo = (m) => { console.error('FALLO:', m); process.exit(1); };
if (!CANAL || !/^UC[\w-]{22}$/.test(CANAL)) fallo('falta LP_CANAL_ID (id UC… del canal @lineapunteada)');

const meta = JSON.parse(fs.readFileSync(`${BANDEJA}/${id}.json`, 'utf8'));
if (meta.estado === 'subido') { console.log('ya subido:', id); process.exit(0); }
const archivo = `${BANDEJA}/${id}.mp4`;
if (!fs.existsSync(archivo)) fallo('no existe ' + archivo);
const categoria = 'Education'; // todo el canal: geografía con fuentes
const etiquetas = (meta.hashtags || []).map((h) => h.replace(/^#/, '')).join(', ') + ',';

// Fecha → "Nov 5, 2026" y hora → "6:00 PM"
const [y, m, d] = fecha.split('-').map(Number);
const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fechaStudio = `${meses[m - 1]} ${d}, ${y}`;
const [hh, mm] = hora.split(':').map(Number);
const horaStudio = `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'AM' : 'PM'}`;

// Selector de canal de marca: si Studio redirige a signin_prompt ("Select a channel"), elegir el canal objetivo por nombre y
// verificar que de verdad estamos en él. Si no se puede comprobar, FALLA (nunca subir al canal equivocado).
const textoPagina = async () => { const t = await llamar('/texto'); return typeof t === 'string' ? t : JSON.stringify(t); };
const asegurarCanal = async () => {
  await esperar(2500);
  for (let i = 0; i < 2; i++) {
    if (!/Select a channel/i.test(await textoPagina())) break;
    console.log(`… YouTube pide elegir canal → "${NOMBRE}"`);
    const r = await llamar(`/clicktexto?texto=${q(NOMBRE)}&exacto=1`);
    if (r && r.error) fallo('no pude elegir el canal "' + NOMBRE + '": ' + r.error);
    await esperar(5000);
  }
  const estado = () => evalJs(`({u:location.href,n:(document.querySelector('#entity-name, ytcp-navigation-drawer')?.innerText||'').replace(/\\n+/g,' | ')})`);
  let e = {};
  try {
    e = await hasta(async () => {
      const v = await estado();
      return v && typeof v === 'object' && !/signin_prompt/.test(v.u) && (v.u.includes(CANAL) || v.n.includes(NOMBRE)) ? v : null;
    }, 30000, 1500, 'verificación de canal');
  } catch { e = await estado(); fallo('no estoy en el canal "' + NOMBRE + '" / ' + CANAL + ': ' + JSON.stringify(e).slice(0, 300)); }
  console.log('✓ canal verificado:', (e.u || '').slice(0, 80));
};
const idDeFila = (extra = '') => `(()=>{const T=${JSON.stringify(meta.titulo.trim())};for(const r of document.querySelectorAll('ytcp-video-row')){const ls=r.innerText.split(String.fromCharCode(10)).map(x=>x.trim());if(!ls.includes(T)${extra})continue;const a=r.querySelector('a[href*="/video/"]');const m=a&&a.href.match(/\\/video\\/([\\w-]+)/);if(m)return m[1];}return ''})()`;
// Abre /videos/short y devuelve el id de la fila programada/publicada con ese título ('' si no hay; los borradores no cuentan)
const buscarEnLista = async () => {
  await llamar(`/ir?url=${q(`https://studio.youtube.com/channel/${CANAL}/videos/short`)}`);
  await asegurarCanal();
  await esperar(5000);
  return String(await evalJs(idDeFila(`||/Edit draft/.test(r.innerText)`)) || '');
};
const extraerId = (hrefs, t = '') => ((hrefs || []).join(' ') + ' ' + t).match(/(?:youtube\.com\/shorts\/|youtu\.be\/)([\w-]{11})/)?.[1] || '';
const leerConfirmacion = () => evalJs(`(()=>{const ds=[...document.querySelectorAll('ytcp-uploads-dialog, ytcp-video-share-dialog, ytcp-uploads-still-processing-dialog')];return {t:ds.map(d=>d.innerText).join(' ').replace(/\\n+/g,' | '),h:ds.flatMap(d=>[...d.querySelectorAll('a')].map(a=>a.href))}})()`);
const marcar = (videoId, extra = {}) => {
  meta.estado = 'subido';
  meta.publicarEn = meta.publicarEn || `${fecha}T${hora}:00-03:00`;
  meta.videoId = videoId;
  meta.url = `https://youtube.com/shorts/${videoId}`;
  meta.programado = `${fecha} ${hora}`;
  meta.subidoEn = new Date().toISOString();
  Object.assign(meta, extra);
  fs.writeFileSync(`${BANDEJA}/${id}.json`, JSON.stringify(meta, null, 2) + '\n');
};

console.log(`→ ${id} · ${fechaStudio} ${horaStudio} · ${categoria}`);

// 1. Abrir diálogo de subida y cargar el archivo (o retomar un borrador ya subido con BORRADOR=1)
if (process.env.BORRADOR === '1') {
  await llamar(`/ir?url=${q(`https://studio.youtube.com/channel/${CANAL}/videos/short`)}`);
  await asegurarCanal();
  await hasta(() => evalJs(`Array.from(document.querySelectorAll('ytcp-video-row')).some(r=>/Edit draft/.test(r.innerText))`), 90000, 2000, 'fila del borrador');
  const fila = await evalJs(`Array.from(document.querySelectorAll('ytcp-video-row')).filter(r=>/Edit draft/.test(r.innerText)).map(r=>r.innerText.split(String.fromCharCode(10))[1]||r.innerText.slice(0,60))`);
  if (!Array.isArray(fila) || fila.length !== 1 || !fila[0].replace(/\s/g,'-').includes(id)) fallo('borrador inesperado: ' + JSON.stringify(fila));
  await llamar(`/clicktexto?texto=${q('Edit draft')}&exacto=1`);
} else {
  // Anti-duplicados: si ya hay una fila con este título (fallo a medias), no volver a subir.
  const previo = await buscarEnLista();
  if (previo) {
    marcar(previo, { nota: 'ya existía en Studio; marcado sin re-subir' });
    console.log(`✓ ${id} ya estaba en Studio → https://youtube.com/shorts/${previo} (bandeja marcada, sin re-subir)`);
    process.exit(0);
  }
  await llamar(`/ir?url=${q(`https://studio.youtube.com/channel/${CANAL}/videos/upload?d=ud`)}`);
  await asegurarCanal();
  await hasta(() => evalJs(`document.querySelectorAll('input[type=file]').length>0`), 30000, 1000, 'input de archivo');
  await esperar(1500);
  const sub = await llamar(`/archivo?sel=${q('input[type=file]')}&ruta=${q(archivo)}`);
  if (sub.error) fallo('archivo: ' + sub.error);
}
await hasta(() => evalJs(`!!document.querySelector('#title-textarea #textbox')`), 60000, 1000, 'formulario de detalles');
await esperar(2000);

// 2. Título y descripción
await llamar(`/escribir?sel=${q('#title-textarea #textbox')}&texto=${q(meta.titulo)}`);
await llamar(`/escribir?sel=${q('#description-textarea #textbox')}&texto=${q(meta.descripcion)}`);
await esperar(1000);
const [t, dsc] = await evalJs(`[document.querySelector('#title-textarea #textbox').innerText.trim(), document.querySelector('#description-textarea #textbox').innerText.trim()]`);
if (t !== meta.titulo.trim()) fallo('título no coincide: ' + t);
if (!dsc.startsWith(meta.descripcion.slice(0, 40))) fallo('descripción no coincide');

// 3. Audiencia (heredada del canal) — verificar
const txt = await textoDialogo();
if (!/not made for kids/.test(txt)) fallo('audiencia no quedó en "not made for kids"');

// 4. Más opciones: etiquetas, idioma, categoría
await llamar(`/clicktexto?texto=${q('Show more')}&exacto=1`);
await esperar(1500);
await llamar(`/escribir?sel=${q('ytcp-uploads-dialog input[aria-label=Tags]')}&texto=`);
await llamar(`/tipear?t=${q(etiquetas)}`);
await esperar(800);
const r1 = await llamar(`/click?sel=${q('ytcp-uploads-dialog ytcp-dropdown-trigger:has-text("Video language")')}`);
if (r1.error) fallo('idioma: ' + r1.error);
await esperar(1200);
await llamar(`/clicktexto?texto=${q('Spanish (Latin America)')}&exacto=1`);
await esperar(1000);
const r2 = await llamar(`/click?sel=${q('ytcp-uploads-dialog ytcp-dropdown-trigger:has-text("People & Blogs")')}`);
if (r2.error) fallo('categoría: ' + r2.error);
await esperar(1200);
await llamar(`/clicktexto?texto=${q(categoria)}&exacto=1`);
await esperar(1000);
const resumen = await evalJs(`Array.from(document.querySelectorAll('ytcp-uploads-dialog ytcp-dropdown-trigger')).map(i=>i.innerText.trim().replace(/\\n/g,'=')).filter(t=>/language|Entertain|Science|Educat|People/.test(t)).join(' ; ')`);
if (!/Spanish \(Latin America\)/.test(resumen) || !resumen.includes(categoria)) fallo('idioma/categoría: ' + resumen);
const chips = await evalJs(`Array.from(document.querySelectorAll('ytcp-uploads-dialog ytcp-chip')).map(c=>c.innerText.trim())`);
if (!Array.isArray(chips) || chips.length < 3) fallo('etiquetas: ' + JSON.stringify(chips));

// 5. Siguiente ×3 → Visibility
for (let i = 0; i < 3; i++) {
  await hasta(() => evalJs(`(()=>{const b=document.querySelector('ytcp-uploads-dialog #next-button');return !!b && !b.hasAttribute('disabled') && b.getAttribute('aria-disabled')!=='true'})()`), 60000, 1000, 'botón Next');
  await llamar(`/click?sel=${q('ytcp-uploads-dialog #next-button')}`);
  await esperar(2500);
}
await hasta(async () => /Schedule as public|Select a date to make your video public/.test(await textoDialogo()), 30000, 1000, 'paso Visibility');

// 6. Programar: fecha, hora, zona
await llamar(`/clicktexto?texto=Schedule&exacto=1`);
await esperar(1500);
const r3 = await llamar(`/click?sel=${q('ytcp-uploads-dialog ytcp-dropdown-trigger:has-text("2026")')}`);
if (r3.error) fallo('selector de fecha: ' + r3.error);
await esperar(1200);
await llamar(`/escribir?sel=${q('ytcp-date-picker input')}&texto=${q(fechaStudio)}`);
await llamar(`/tecla?k=Enter`);
await esperar(1200);
const r4 = await llamar(`/click?sel=${q('ytcp-uploads-dialog ytcp-datetime-picker input, ytcp-uploads-dialog input[value$=" AM"], ytcp-uploads-dialog input[value$=" PM"]')}`);
if (r4.error) fallo('selector de hora: ' + r4.error);
await esperar(1000);
await llamar(`/clicktexto?texto=${q(horaStudio)}&exacto=1`);
await esperar(1000);
await llamar(`/clicktexto?texto=${q('Time zone')}&exacto=1`);
await esperar(1200);
await llamar(`/clicktexto?texto=${q('(GMT-0300) Local Time')}&exacto=1`);
await esperar(1200);
const vis = String(await evalJs(`Array.from(document.querySelectorAll('ytcp-uploads-dialog ytcp-dropdown-trigger, ytcp-uploads-dialog input')).filter(e=>e.offsetParent).map(i=>(i.innerText||i.value||'').trim().slice(0,30)).join(' ; ')`)).replace(/\s/g, ' ');
if (!vis.includes(fechaStudio) || !vis.includes(horaStudio) || !vis.includes('GMT-0300')) fallo('fecha/hora/zona: ' + vis);

// 7. Esperar a que termine la subida y programar
await hasta(async () => /Checks complete|Upload complete|Processing/.test(await textoDialogo()), 120000, 2000, 'subida completa');
await hasta(() => evalJs(`(()=>{const b=document.querySelector('ytcp-uploads-dialog #done-button');return !!b && !b.hasAttribute('disabled')})()`), 60000, 1000, 'botón Schedule');
await llamar(`/click?sel=${q('ytcp-uploads-dialog #done-button')}`);
await hasta(async () => { const c = await leerConfirmacion(); return c && /Video scheduled|will be set to public|Video processing|Video link/.test(c.t); }, 60000, 1000, 'confirmación');
let c = await leerConfirmacion();
let videoId = extraerId(c.h, c.t);
if (!videoId) {
  console.log('… sin link aún; esperando a que termine el procesamiento (hasta 3 min)');
  try {
    await hasta(async () => {
      c = await leerConfirmacion();
      videoId = extraerId(c.h, c.t);
      return videoId || !/Video processing/.test(c.t) || /Video link/.test(c.t);
    }, 180000, 3000, 'fin de procesamiento');
  } catch (e) { console.log('… ' + e.message); }
  c = await leerConfirmacion(); videoId = videoId || extraerId(c.h, c.t);
}
const cerrar = async () => {
  const r = await llamar(`/click?sel=${q('ytcp-uploads-dialog ytcp-button:has-text("Close") >> visible=true')}`);
  if (r && r.error) await llamar(`/clicktexto?texto=Close&exacto=1`);
  await esperar(1500);
};
await cerrar();
if (!videoId) {
  console.log('… último recurso: buscar la fila en /videos/short');
  videoId = await hasta(async () => (await buscarEnLista()) || null, 120000, 5000, 'fila del video en la lista').catch(() => '');
}
if (!videoId) fallo('video programado pero sin id (bandeja NO marcada): ' + (c.t || '').slice(0, 300));

// 8. Marcar en la bandeja (solo con id)
marcar(videoId);
console.log(`✓ ${id} → https://youtube.com/shorts/${videoId} · ${fecha} ${hora}`);
