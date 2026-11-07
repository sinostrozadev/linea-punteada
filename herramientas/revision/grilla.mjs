// uso: node grilla.mjs salida.jpg "Etiqueta|img1,img2,..." ...
import { createRequire } from 'node:module'; import fs from 'node:fs';
const require = createRequire('/home/santiago/projects/yt/bolita-lab/herramientas/navegador/');
const { chromium } = require('playwright');
const [out, ...filas] = process.argv.slice(2);
let html = '<body style="margin:0;background:#111;font:bold 16px sans-serif;color:#fff">';
for (const f of filas) { const [et, l] = f.split('|'); html += `<div style="display:flex;align-items:center;gap:4px;margin:4px"><div style="width:110px">${et}</div>` + l.split(',').map(i => `<img src="data:image/jpeg;base64,${fs.readFileSync(i).toString('base64')}" style="width:180px;height:320px;object-fit:cover">`).join('') + '</div>'; }
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 300 } });
await p.setContent(html + '</body>'); await p.screenshot({ path: out, fullPage: true, type: 'jpeg', quality: 80 }); await b.close(); console.log(out);
