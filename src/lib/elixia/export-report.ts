import type { Snap } from "./types.ts";
import { toCsv } from "./storage.ts";
import { f2, fi, fm, formatRange } from "./format.ts";
import { accountOf, summarize } from "./metrics.ts";

function download(name: string, blob: Blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function downloadCsv(snaps: Snap[]) {
  download("elixia-meta-ads.csv", new Blob([toCsv(snaps)], { type: "text/csv;charset=utf-8" }));
}

export async function downloadXlsx(snaps: Snap[]) {
  const XLSX = await import("xlsx");
  const rows = [...snaps]
    .filter((s) => s.ad)
    .sort((a, b) => a.ad.localeCompare(b.ad, "es") || a.fin.localeCompare(b.fin))
    .map((s) => ({
      Anuncio: s.ad,
      Campaña: s.campaign,
      Inicio: s.inicio,
      Fin: s.fin,
      Activo: s.activo ? "sí" : "no",
      "Gasto €": s.gasto,
      Compras: s.resultados,
      CPA: s.cpa,
      ROAS: s.roas,
      Impresiones: s.impr,
      "Clics enlace": s.clics,
      Alcance: s.alcance,
      "CTR enlace": s.ctr,
      "Carga LPV": s.lpv,
      Frecuencia: s.freq,
    }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Informes");
  XLSX.writeFile(wb, "elixia-meta-ads.xlsx");
}

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => {
    if (c === "&") return "\u0026amp;";
    if (c === "<") return "\u0026lt;";
    if (c === ">") return "\u0026gt;";
    return "\u0026quot;";
  });
}

function historyDays(history: Snap[]) {
  const daily = history.filter((s) => s.inicio === s.fin).sort((a, b) => a.fin.localeCompare(b.fin));
  const base = daily.length >= 2 ? daily : [...history].sort((a, b) => a.fin.localeCompare(b.fin));
  return base.map((s) => ({
    label: formatRange(s.inicio, s.fin),
    gasto: s.gasto,
    impr: s.impr,
    compras: s.resultados,
  }));
}

function shareModel(snaps: Snap[]) {
  const summaries = summarize(snaps, {}).sort((a, b) => b.agg.gasto - a.agg.gasto);
  const account = accountOf(summaries, {});
  return {
    gasto: account.gasto,
    compras: account.resultados,
    cpa: account.cpa,
    roas: account.roas,
    ads: summaries
      .filter((s) => s.agg.gasto > 0)
      .map((s) => ({
        ad: s.ad,
        gasto: s.agg.gasto,
        compras: s.agg.resultados,
        cpa: s.agg.cpa,
        roas: s.agg.roas,
        impr: s.agg.impr,
        days: historyDays(s.history),
      })),
  };
}

export function printPdf(snaps: Snap[], title: string) {
  const model = shareModel(snaps);
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
body{font-family:system-ui,sans-serif;color:#1c1420;margin:32px}
h1{font-size:22px;margin:0} p{color:#5c5160}
.kpis{display:flex;gap:16px;margin-top:12px}
.kpis div{border:1px solid #ddd;border-radius:10px;padding:8px 12px;min-width:110px}
.kpis strong{display:block;font-size:18px}
table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}
th,td{border-bottom:1px solid #ddd;padding:6px 8px;text-align:right}
th:first-child,td:first-child{text-align:left}
@media print { body { margin: 12mm } }
</style></head><body>
<h1>${esc(title)}</h1>
<p>Informe de solo lectura. El ROAS ignora filas con valor, retorno o gasto en 0 o vacíos.</p>
<div class="kpis">
<div>Gasto<strong>${esc(f2(model.gasto))} €</strong></div>
<div>Compras<strong>${esc(fi(model.compras))}</strong></div>
<div>CPA<strong>${esc(fm(model.cpa, " €"))}</strong></div>
<div>ROAS<strong>${esc(fm(model.roas, "x"))}</strong></div>
</div>
<table><thead><tr><th>Anuncio</th><th>Gasto €</th><th>Compras</th><th>CPA</th><th>ROAS</th></tr></thead><tbody>
${model.ads.map((v) => `<tr><td>${esc(v.ad)}</td><td>${esc(f2(v.gasto))}</td><td>${esc(fi(v.compras))}</td><td>${esc(fm(v.cpa, " €"))}</td><td>${esc(fm(v.roas, "x"))}</td></tr>`).join("")}
</tbody></table>
<p>${snaps.length} filas de informe en el filtro activo.</p>
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
  return true;
}

export function downloadStandalone(snaps: Snap[], title: string) {
  const payload = JSON.stringify(shareModel(snaps)).replace(/</g, "\\u003c");
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{--bg:#f3f0f4;--card:#fff;--fg:#241428;--muted:#655868;--line:#e4dbe6;--accent:#00a9a5;--logo:#491b4b;--on:#fff}
@media (prefers-color-scheme: dark){:root{--bg:#120d16;--card:#1c1420;--fg:#f6f1f7;--muted:#b3a3b6;--line:#3a2d3e;--accent:#2ed4cf;--logo:#491b4b;--on:#fff}}
body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,sans-serif}
main{max-width:980px;margin:0 auto;padding:24px}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;margin-top:16px}
h1{margin:0;font-size:22px} .muted{color:var(--muted)}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
.kpis div{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px}
.kpis strong{display:block;font-size:22px;font-variant-numeric:tabular-nums}
.grid{display:grid;gap:16px;align-items:center}
@media(min-width:720px){.grid{grid-template-columns:1fr 220px}}
button.ad{display:flex;width:100%;gap:8px;align-items:center;text-align:left;border:0;background:transparent;color:inherit;border-radius:10px;padding:8px;cursor:pointer;min-height:44px}
button.ad.on{background:color-mix(in srgb,var(--accent) 18%, transparent)}
.dot{width:10px;height:10px;border-radius:99px;flex:none}
#tip{position:fixed;z-index:5;pointer-events:none;background:var(--logo);color:var(--on);border-radius:8px;padding:4px 8px;font-size:12px;display:none;transform:translate(-50%,-120%)}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:right}
th:first-child,td:first-child{text-align:left}
svg{width:100%;height:auto}
</style></head><body>
<main>
<h1>${esc(title)}</h1>
<p class="muted">Copia de solo lectura del filtro que estaba activo. Se puede mirar; no se puede importar ni editar.</p>
<section class="kpis" id="kpis"></section>
<section class="card">
<p class="muted">Dónde se va el gasto</p>
<div class="grid"><div id="list"></div>
<svg id="donut" viewBox="0 0 180 180" role="img" aria-label="Reparto del gasto"><g id="arcs" transform="rotate(-90 90 90)"></g><text id="mid" x="90" y="96" text-anchor="middle" fill="currentColor" font-size="12"></text></svg>
</div>
<div id="daily" hidden>
<p id="dailyTitle" style="font-weight:700"></p>
<svg id="line" viewBox="0 0 640 220" role="img" aria-label="Evolución diaria"></svg>
</div>
</section>
<section class="card"><p class="muted">Anuncios del filtro</p><div style="overflow-x:auto"><table id="table"></table></div></section>
<p class="muted">Pasa el cursor por la dona o por la evolución para ver el día, el gasto, las impresiones y las compras.</p>
</main>
<div id="tip"></div>
<script>
const MODEL = ${payload};
const tip = document.getElementById("tip");
const money = n => new Intl.NumberFormat("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const shown = n => n == null ? "—" : money(n);
function esc(s){return String(s).replace(/[&<>"]/g, function(c){var n=c.charCodeAt(0); if(n===38) return "\\u0026amp;"; if(n===60) return "\\u0026lt;"; if(n===62) return "\\u0026gt;"; return "\\u0026quot;";});}
function showTip(x,y,text){tip.style.display="block";tip.style.left=x+"px";tip.style.top=y+"px";tip.textContent=text;}
function hideTip(){tip.style.display="none";}
const ads = MODEL.ads;
const total = ads.reduce((a,s)=>a+s.gasto,0)||1;
const colors = ["#491b4b","#00a9a5","#e08e04","#6a2b6d","#047857","#b45309","#b91c1c"];
let selected = null;
document.getElementById("kpis").innerHTML = [["Gasto", money(MODEL.gasto)+" €"],["Compras", String(MODEL.compras)],["CPA", MODEL.cpa==null?"—":money(MODEL.cpa)+" €"],["ROAS", MODEL.roas==null?"—":money(MODEL.roas)+"x"]]
  .map(([k,v]) => "<div><span class=muted>"+esc(k)+"</span><strong>"+esc(v)+"</strong></div>").join("");
document.getElementById("mid").textContent = money(MODEL.gasto)+" €";
const list = document.getElementById("list");
const arcs = document.getElementById("arcs");
const r = 68, c = 2*Math.PI*r;
function paint(){
  list.innerHTML = ads.map((s,i) => "<button class='ad"+(selected===s.ad?" on":"")+"' data-i='"+i+"'><span class=dot style='background:"+colors[i%colors.length]+"'></span><span>"+esc(s.ad)+"</span><span class=muted style='margin-left:auto'>"+money(s.gasto)+" € · "+money(s.gasto/total*100)+"%</span></button>").join("");
  arcs.innerHTML = "";
  let cursor = 0;
  ads.forEach((s,i) => {
    const len = s.gasto/total*c;
    const gap = len > 3 ? 1.5 : 0;
    const node = document.createElementNS("http://www.w3.org/2000/svg","circle");
    node.setAttribute("cx","90"); node.setAttribute("cy","90"); node.setAttribute("r", String(r));
    node.setAttribute("fill","none"); node.setAttribute("stroke", colors[i%colors.length]);
    node.setAttribute("stroke-width", selected && selected!==s.ad ? "16" : "24");
    node.setAttribute("stroke-dasharray", Math.max(len-gap,0)+" "+c);
    node.setAttribute("stroke-dashoffset", String(c-cursor));
    node.setAttribute("opacity", selected && selected!==s.ad ? "0.35" : "1");
    node.style.cursor = "pointer";
    node.addEventListener("click", () => pick(s.ad));
    node.addEventListener("mousemove", (e) => showTip(e.clientX, e.clientY, s.ad+": "+money(s.gasto)+" € · "+money(s.gasto/total*100)+"%"));
    node.addEventListener("mouseleave", hideTip);
    arcs.appendChild(node);
    cursor += len;
  });
  document.getElementById("table").innerHTML = "<thead><tr><th>Anuncio</th><th>Gasto €</th><th>Compras</th><th>CPA</th><th>ROAS</th></tr></thead><tbody>"+
    ads.map(s => "<tr><td>"+esc(s.ad)+"</td><td>"+money(s.gasto)+"</td><td>"+s.compras+"</td><td>"+esc(shown(s.cpa))+"</td><td>"+esc(s.roas==null?"—":money(s.roas)+"x")+"</td></tr>").join("")+
    "</tbody>";
}
function pick(ad){ selected = selected===ad ? null : ad; hideTip(); paint(); drawDaily(); }
list.onclick = e => { const b = e.target.closest("button"); if (!b) return; pick(ads[Number(b.dataset.i)].ad); };
function series(rows, key, color, w, h){
  const vals = rows.map(r => r[key]);
  const max = Math.max(...vals, 0.0001);
  if (rows.length === 1) return "";
  return "<polyline fill='none' stroke='"+color+"' stroke-width='2' points='"+rows.map((r,i)=>{
    const x = 36 + (i/(rows.length-1))*(w-52);
    const y = 16 + (1 - r[key]/max)*(h-36);
    return x.toFixed(1)+","+y.toFixed(1);
  }).join(" ")+"'/>";
}
function drawDaily(){
  const box = document.getElementById("daily");
  const ad = ads.find(a => a.ad === selected);
  const svg = document.getElementById("line");
  if (!ad) { box.hidden = true; svg.innerHTML = ""; return; }
  box.hidden = false;
  document.getElementById("dailyTitle").textContent = ad.ad + " · gasto, impresiones y compras";
  const rows = ad.days;
  const w = 640, h = 220;
  if (rows.length < 2) { svg.innerHTML = "<text x='20' y='40' fill='currentColor'>Un solo informe: no hay línea.</text>"; return; }
  svg.innerHTML = series(rows,"gasto","#00a9a5",w,h)+series(rows,"impr","#655868",w,h)+series(rows,"compras","#e08e04",w,h)+
    "<text x='36' y='16' fill='#00a9a5' font-size='11'>Gasto</text><text x='90' y='16' fill='#655868' font-size='11'>Impresiones</text><text x='180' y='16' fill='#e08e04' font-size='11'>Compras</text>";
  svg.onmousemove = e => {
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX-rect.left)/rect.width)*w;
    let best = 0, dist = Infinity;
    rows.forEach((_,i) => { const px = 36 + (i/(rows.length-1))*(w-52); const d = Math.abs(px-x); if (d<dist){dist=d; best=i;} });
    const row = rows[best];
    showTip(e.clientX, e.clientY, row.label+" · Gasto "+money(row.gasto)+" € · Impresiones "+row.impr+" · Compras "+row.compras);
  };
  svg.onmouseleave = hideTip;
}
paint();
<\/script></body></html>`;
  download("elixia-informe.html", new Blob([html], { type: "text/html;charset=utf-8" }));
}
