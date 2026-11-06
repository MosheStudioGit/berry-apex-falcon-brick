import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Sun, c as Power, d as FolderOpen, f as FlaskConical, h as ChevronDown, i as Trash2, l as Moon, m as Download, n as TriangleAlert, o as Search, p as Eye, r as TrendingUp, s as RefreshCw, t as Upload, u as Hourglass } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-JYDuqw2N.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function iso(day) {
	return new Date(Date.UTC(2026, 9, 22 + day)).toISOString().slice(0, 10);
}
function wob(base, day, amp, seed) {
	return base + Math.sin(day * 1.35 + seed) * amp;
}
function make(p) {
	const clics = Math.max(0, Math.round(p.impr * p.ctr / 100));
	const vis = Math.round(clics * p.load);
	const v3s = p.hook == null ? null : Math.round(p.impr * (p.hook / 100));
	const retained = v3s == null || p.hold == null ? null : Math.round(v3s * (p.hold / 100));
	const date = iso(p.day);
	return {
		ad: p.ad,
		campaign: p.campaign,
		inicio: date,
		fin: date,
		activo: p.activo,
		gasto: Math.round(p.gasto * 100) / 100,
		resultados: p.resultados,
		cpa: p.resultados > 0 ? p.gasto / p.resultados : null,
		roas: p.roas,
		roasAdjusted: false,
		roasOrigin: "column",
		purchaseValue: Math.round(p.gasto * p.roas * 100) / 100,
		freq: Math.round(p.freq * 100) / 100,
		ctr: Math.round(p.ctr * 100) / 100,
		lpv: Math.round(p.load * 1e3) / 10,
		impr: p.impr,
		clics,
		alcance: Math.round(p.impr / Math.max(p.freq, .2)),
		plays: v3s,
		v3s,
		p75: null,
		p95: null,
		p100: retained,
		thru: null,
		vis,
		avgT: p.avgT,
		duration: p.duration,
		atc: p.atc,
		ic: p.ic,
		demo: true
	};
}
/** Cuatro anuncios con historias distintas para recorrer los tres bloques sin un Excel. */
function buildDemo() {
	const days = Array.from({ length: 12 }, (_, i) => i);
	const out = [];
	for (const day of days) {
		if (day !== 5) {
			const compras = Math.max(1, Math.round(wob(2, day, .55, 1)));
			const cpa = wob(8.4, day, .35, 2);
			out.push(make({
				ad: "UGC Unboxing — Oferta 29€",
				campaign: "Prospecting · Escala",
				day,
				activo: true,
				gasto: compras * cpa,
				resultados: compras,
				roas: wob(3.15, day, .18, 3),
				freq: wob(1.22, day, .06, .4),
				ctr: wob(3.05, day, .2, 1.2),
				load: .91,
				impr: Math.round(wob(3200, day, 280, .2)),
				hook: wob(36, day, 3, .8),
				hold: wob(42, day, 4, 1.1),
				avgT: wob(6.4, day, .4, .3),
				duration: 15,
				atc: compras * 3,
				ic: compras * 2
			}));
		}
		out.push(make({
			ad: "Testimonio COD — 2,99€",
			campaign: "Retargeting · Checkout",
			day,
			activo: true,
			gasto: wob(18, day, 1.4, .6),
			resultados: 1,
			roas: wob(1.12, day, .08, 1.4),
			freq: wob(1.34, day, .05, .2),
			ctr: wob(3.35, day, .18, .9),
			load: .9,
			impr: Math.round(wob(4100, day, 300, 1)),
			hook: wob(33, day, 2, .5),
			hold: wob(28, day, 3, 1.6),
			avgT: wob(4.2, day, .3, .7),
			duration: 20,
			atc: 8 + day % 3,
			ic: 7 + day % 2
		}));
		out.push(make({
			ad: "Carrusel beneficios — fatiga",
			campaign: "Always on",
			day,
			activo: true,
			gasto: wob(6.2, day, .4, .3),
			resultados: 0,
			roas: 0,
			freq: 1.86 + day * .05,
			ctr: wob(1.05, day, .12, 2),
			load: .82,
			impr: Math.round(wob(2600, day, 200, .4)),
			hook: wob(14, day, 2, 1.3),
			hold: wob(11, day, 2, .9),
			avgT: wob(2.1, day, .25, 1.8),
			duration: 12,
			atc: null,
			ic: null
		}));
		out.push(make({
			ad: "Estático precio — landing lenta",
			campaign: "Prospecting · Broad",
			day,
			activo: false,
			gasto: wob(14.6, day, .8, 1.7),
			resultados: 1,
			roas: wob(1.28, day, .1, 2.2),
			freq: wob(1.28, day, .05, .1),
			ctr: wob(2.72, day, .12, .6),
			load: .55,
			impr: Math.round(wob(2400, day, 180, 1.5)),
			hook: null,
			hold: null,
			avgT: null,
			duration: null,
			atc: 3,
			ic: 2
		}));
	}
	return out;
}
function f2(v) {
	if (v == null || !Number.isFinite(v)) return "—";
	return v.toLocaleString("es-ES", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}
function fi(v) {
	if (v == null || !Number.isFinite(v)) return "—";
	return Math.round(v).toLocaleString("es-ES");
}
function fm(v, suffix = "") {
	if (v == null || !Number.isFinite(v)) return "—";
	return f2(v) + suffix;
}
function formatRange(inicio, fin) {
	const short = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}`;
	return inicio === fin ? short(inicio) : `${short(inicio)} → ${short(fin)}`;
}
function formatMetric(key, v) {
	if (key === "gasto" || key === "cpa") return `${f2(v)} €`;
	if (key === "roas") return `${f2(v)}x`;
	if (key === "freq") return f2(v);
	if (key === "avgT") return `${f2(v)} s`;
	if (key === "alcance" || key === "resultados" || key === "clics") return fi(v);
	if (key === "ctr" || key === "lpv" || key === "hook" || key === "hold" || key === "cr" || key === "dropoff" || key === "intent" || key === "watch") return `${f2(v)}%`;
	return f2(v);
}
var CHART_METRICS = [
	{
		id: "roas",
		label: "ROAS (x)",
		thresholds: [1.5, 2.5],
		hi: true
	},
	{
		id: "cpa",
		label: "CPA (€)",
		thresholds: [10, 15],
		hi: false
	},
	{
		id: "ctr",
		label: "CTR enlace (%)",
		thresholds: [1.5, 2.5],
		hi: true
	},
	{
		id: "freq",
		label: "Frecuencia",
		thresholds: [1.4, 1.8],
		hi: false
	},
	{
		id: "lpv",
		label: "Carga LPV (%)",
		thresholds: [70, 85],
		hi: true
	},
	{
		id: "hook",
		label: "Hook rate (%)",
		thresholds: [20, 30],
		hi: true
	},
	{
		id: "hold",
		label: "Hold rate (%)",
		thresholds: [20, 35],
		hi: true
	},
	{
		id: "avgT",
		label: "Tiempo medio (s)",
		thresholds: [3, 5],
		hi: true
	},
	{
		id: "gasto",
		label: "Gasto (€)"
	},
	{
		id: "resultados",
		label: "Compras"
	},
	{
		id: "alcance",
		label: "Alcance"
	},
	{
		id: "cr",
		label: "CR global (%)",
		thresholds: [1, 1.5],
		hi: true
	},
	{
		id: "dropoff",
		label: "Fuga de carga (%)",
		thresholds: [15, 30],
		hi: false
	},
	{
		id: "intent",
		label: "Intención IC/ATC (%)",
		thresholds: [40, 55],
		hi: true
	}
];
var ADDITIVE = /* @__PURE__ */ new Set([
	"gasto",
	"resultados",
	"alcance"
]);
var SPARK_KEYS = [
	"roas",
	"cpa",
	"ctr",
	"freq",
	"lpv",
	"hook",
	"hold",
	"avgT",
	"alcance"
];
var rules = {
	freq: (v) => v == null ? "n" : v <= 1.4 ? "g" : v <= 1.8 ? "y" : "r",
	ctr: (v) => v == null ? "n" : v >= 2.5 ? "g" : v >= 1.5 ? "y" : "r",
	lpv: (v) => v == null ? "n" : v >= 85 ? "g" : v >= 70 ? "y" : "r",
	cpa: (v) => v == null ? "n" : v <= 10 ? "g" : v <= 15 ? "y" : "r",
	roas: (v) => v == null ? "n" : v >= 2.5 ? "g" : v >= 1.5 ? "y" : "r",
	hook: (v) => v == null ? "n" : v >= 30 ? "g" : v >= 20 ? "y" : "r",
	avgT: (v) => v == null ? "n" : v >= 5 ? "g" : v >= 3 ? "y" : "r",
	hold: (v) => v == null ? "n" : v >= 35 ? "g" : v >= 20 ? "y" : "r",
	dropoff: (v) => v == null ? "n" : v <= 15 ? "g" : v <= 30 ? "y" : "r",
	cr: (v) => v == null ? "n" : v >= 1 ? "g" : "r",
	intent: (v) => v == null ? "n" : v >= 55 ? "g" : v >= 40 ? "y" : "r",
	watch: (v) => v == null ? "n" : v >= 40 ? "g" : v >= 25 ? "y" : "r"
};
function toneFor(key, v) {
	return rules[key]?.(v) ?? "n";
}
function div(a, b, k = 1) {
	if (a == null || b == null || !b || !Number.isFinite(a) || !Number.isFinite(b)) return null;
	const v = a / b * k;
	return Number.isFinite(v) ? v : null;
}
function dayCount(s) {
	const a = Date.parse(`${s.inicio}T00:00:00Z`);
	const b = Date.parse(`${s.fin}T00:00:00Z`);
	if (!Number.isFinite(a) || !Number.isFinite(b)) return 1;
	return Math.max(1, Math.round((b - a) / 864e5) + 1);
}
function nonOverlap(rows) {
	const chosen = [];
	const sorted = [...rows].sort((a, b) => dayCount(b) - dayCount(a) || b.fin.localeCompare(a.fin));
	for (const s of sorted) if (!chosen.some((c) => s.inicio <= c.fin && c.inicio <= s.fin)) chosen.push(s);
	return chosen;
}
function revenueOf(s) {
	if (s.purchaseValue != null && s.purchaseValue >= 0) return s.purchaseValue;
	if (s.roas != null) return s.roas * s.gasto;
	if (s.resultados === 0) return 0;
	return null;
}
function viewOf(s, durOverride) {
	const dur = durOverride != null && durOverride > 0 ? durOverride : s.duration;
	const retentionSource = s.p100 != null ? "100%" : s.p95 != null ? "95%" : s.thru != null ? "ThruPlay" : s.p75 != null ? "75%" : null;
	const retained = s.p100 ?? s.p95 ?? s.thru ?? s.p75 ?? null;
	const hook = div(s.v3s, s.impr, 100);
	const hold = div(retained, s.v3s, 100);
	const visUse = s.vis != null ? s.vis : s.lpv != null && s.clics > 0 ? s.lpv * s.clics / 100 : null;
	const dropoff = s.clics > 0 && visUse != null ? Math.max(0, (s.clics - visUse) / s.clics * 100) : null;
	const cr = div(s.resultados, s.clics, 100);
	const intent = s.atc != null ? div(s.ic, s.atc, 100) : null;
	const payRate = s.ic != null ? div(s.resultados, s.ic, 100) : null;
	const watch = dur != null && dur > 0 && s.avgT != null ? s.avgT / dur * 100 : null;
	return {
		...s,
		retained,
		retentionSource,
		hook,
		hold,
		visUse,
		dropoff,
		cr,
		intent,
		payRate,
		watch,
		dur
	};
}
function metricValue(v, key) {
	switch (key) {
		case "roas": return v.roas;
		case "cpa": return v.cpa;
		case "ctr": return v.ctr;
		case "freq": return v.freq;
		case "lpv": return v.lpv;
		case "hook": return v.hook;
		case "hold": return v.hold;
		case "avgT": return v.avgT;
		case "gasto": return v.gasto;
		case "resultados": return v.resultados;
		case "alcance": return v.alcance;
		case "cr": return v.cr;
		case "dropoff": return v.dropoff;
		case "intent": return v.intent;
		default: return null;
	}
}
function sumNum(rows, pick) {
	return rows.reduce((a, row) => a + pick(row), 0);
}
function sumKnown(rows, pick) {
	let known = false;
	let total = 0;
	for (const row of rows) {
		const v = pick(row);
		if (v != null && Number.isFinite(v)) {
			known = true;
			total += v;
		}
	}
	return {
		known,
		total
	};
}
function aggregate(history, durOverride) {
	const chosen = nonOverlap(history).map((s) => viewOf(s, durOverride));
	return aggregateViews(chosen, history.length - chosen.length);
}
function aggregateViews(rows, skipped) {
	const gasto = sumNum(rows, (r) => r.gasto);
	const resultados = sumNum(rows, (r) => r.resultados);
	const impr = sumNum(rows, (r) => r.impr);
	const clics = sumNum(rows, (r) => r.clics);
	let rev = 0;
	let spR = 0;
	let roasAdjusted = false;
	let roasFromValue = false;
	for (const s of rows) {
		if (s.roasAdjusted) roasAdjusted = true;
		if (s.roasOrigin === "value") roasFromValue = true;
		const revenue = revenueOf(s);
		if (revenue != null) {
			rev += revenue;
			spR += s.gasto;
		}
	}
	const hookRows = rows.filter((r) => r.v3s != null);
	const holdRows = rows.filter((r) => r.retained != null && r.v3s != null);
	const timeRows = rows.filter((r) => r.avgT != null && (r.v3s ?? 0) > 0);
	const watchRows = rows.filter((r) => r.watch != null && (r.v3s ?? 0) > 0);
	const lpvRows = rows.filter((r) => r.vis != null || r.lpv != null && r.clics > 0);
	const visE = lpvRows.reduce((a, r) => a + (r.vis != null ? r.vis : (r.lpv ?? 0) * r.clics / 100), 0);
	const lpvClicks = sumNum(lpvRows, (r) => r.clics);
	const lpvRaw = div(visE, lpvClicks, 100);
	const atc = sumKnown(rows, (r) => r.atc);
	const ic = sumKnown(rows, (r) => r.ic);
	const reach = sumKnown(rows, (r) => r.alcance);
	const latestFreq = [...rows].sort((a, b) => a.fin.localeCompare(b.fin)).reverse().find((r) => r.freq != null);
	const sources = [...new Set(rows.map((r) => r.retentionSource).filter((s) => !!s))];
	const watchWeight = watchRows.reduce((a, r) => a + (r.v3s ?? 0), 0);
	return {
		n: rows.length,
		skipped,
		gasto,
		resultados,
		cpa: div(gasto, resultados),
		roas: div(rev, spR),
		freq: latestFreq ? latestFreq.freq : null,
		ctr: div(clics, impr, 100),
		lpv: lpvRaw == null ? null : Math.min(100, lpvRaw),
		hook: div(sumNum(hookRows, (r) => r.v3s ?? 0), sumNum(hookRows, (r) => r.impr), 100),
		hold: div(sumNum(holdRows, (r) => r.retained ?? 0), sumNum(holdRows, (r) => r.v3s ?? 0), 100),
		avgT: div(timeRows.reduce((a, r) => a + (r.avgT ?? 0) * (r.v3s ?? 0), 0), sumNum(timeRows, (r) => r.v3s ?? 0)),
		watch: watchWeight ? watchRows.reduce((a, r) => a + (r.watch ?? 0) * (r.v3s ?? 0), 0) / watchWeight : null,
		alcance: reach.known ? reach.total : null,
		impr,
		clics,
		vis: lpvRows.length ? visE : null,
		atc: atc.known ? atc.total : null,
		ic: ic.known ? ic.total : null,
		dropoff: lpvClicks > 0 && lpvRows.length ? Math.max(0, (lpvClicks - visE) / lpvClicks * 100) : null,
		cr: div(resultados, clics, 100),
		intent: atc.known && ic.known ? div(ic.total, atc.total, 100) : null,
		payRate: ic.known ? div(resultados, ic.total, 100) : null,
		roasAdjusted,
		roasFromValue,
		retentionNote: sources.length ? `Retención final: ${sources.join(", ")}` : "Sin columna de retención final (100%, 95%, ThruPlay o 75%)."
	};
}
function summarize(snaps, durations) {
	const by = /* @__PURE__ */ new Map();
	for (const s of snaps) {
		const list = by.get(s.ad);
		if (list) list.push(s);
		else by.set(s.ad, [s]);
	}
	const out = [];
	for (const [ad, list] of by) {
		const history = [...list].sort((a, b) => (a.fin + a.inicio).localeCompare(b.fin + b.inicio));
		const latest = history[history.length - 1];
		const campaign = [...history].reverse().find((s) => s.campaign)?.campaign ?? "";
		out.push({
			ad,
			campaign,
			history,
			latest,
			agg: aggregate(history, durations[ad])
		});
	}
	return out;
}
function accountOf(summaries, durations) {
	const views = [];
	let total = 0;
	for (const s of summaries) {
		total += s.history.length;
		views.push(...nonOverlap(s.history).map((row) => viewOf(row, durations[s.ad])));
	}
	return aggregateViews(views, total - views.length);
}
function getVerdict(s) {
	const ok = s.resultados > 0;
	const cpaOk = s.cpa != null && s.cpa <= 10;
	const freqOk = s.freq == null || s.freq <= 1.8;
	if (s.gasto < 3) return {
		k: "low",
		t: "Muestra baja",
		why: "Ha gastado menos de 3 €: los datos aún no son fiables para decidir."
	};
	if (ok && (s.roas != null && s.roas >= 2.5 || cpaOk) && freqOk && (s.lpv == null || s.lpv >= 70)) return {
		k: "esc",
		t: "Escalar",
		why: "CPA o ROAS en rango óptimo, sin señal de fatiga. Sube el presupuesto poco a poco, un 20–30%."
	};
	if (s.ctr != null && s.ctr >= 2.5 && (!ok || !cpaOk)) return {
		k: "var",
		t: "Variantes",
		why: "El anuncio atrae clics, pero el cierre no acompaña. Mira el embudo del sitio antes de culpar solo al gancho."
	};
	if (ok && s.roas != null && s.roas >= 1.5) return {
		k: "var",
		t: "Variantes",
		why: "Rentabilidad justa. Prueba ganchos nuevos sin apagar todavía lo que ya vende."
	};
	if (!ok && s.gasto >= 15 || s.ctr != null && s.ctr < 1.5 && s.gasto >= 5 || ok && s.roas != null && s.roas < 1.5 && s.gasto >= 15 || s.freq != null && s.freq > 1.8 && (s.cpa == null || s.cpa > 15)) return {
		k: "apa",
		t: "Apagar",
		why: "Fatiga, CTR agotado o gasto relevante sin retorno. Corta este anuncio y no lo dejes drenar la cuenta."
	};
	return {
		k: "vig",
		t: "Vigilar",
		why: "Todavía está acumulando datos. No escales ni apagues hasta el siguiente informe."
	};
}
function accountRead(a) {
	const roasT = rules.roas(a.roas);
	const cpaT = rules.cpa(a.cpa);
	const tone = roasT === "r" || cpaT === "r" ? "r" : roasT === "y" || cpaT === "y" ? "y" : roasT === "g" && cpaT === "g" ? "g" : roasT === "g" || cpaT === "g" ? "y" : "n";
	return {
		tone,
		title: tone === "g" ? "Cuenta en zona de escala" : tone === "y" ? "Cuenta en rentabilidad justa" : tone === "r" ? "Cuenta por debajo del corte" : "Cuenta sin lectura",
		body: `CPA ${a.cpa == null ? "sin compras" : f2(a.cpa) + " €"} y ROAS ${a.roas == null ? "sin valor de compras" : f2(a.roas) + "x"}. Verde solo si el CPA es ≤ 10 € y el ROAS ≥ 2,50x. El ROAS de cuenta es valor de compras ÷ gasto, no una media de porcentajes.`
	};
}
function dropoffRead(v) {
	if (v == null) return {
		tone: "n",
		title: "Sin visitas a la landing",
		body: "Hace falta «Visitas a la página de destino» o el porcentaje de carga para medir la fuga entre el clic y la página."
	};
	if (v > 30) return {
		tone: "r",
		title: "Fuga crítica",
		body: `Se pierde el ${f2(v)}% de los clics antes de cargar la landing. Por encima del 30% el problema es de velocidad o de URL, no del anuncio.`
	};
	if (v > 15) return {
		tone: "y",
		title: "Fuga a vigilar",
		body: `Se pierde el ${f2(v)}%. La banda sana es 15% o menos, la misma que una carga LPV de al menos 85%.`
	};
	return {
		tone: "g",
		title: "La landing recoge el clic",
		body: `Solo se pierde el ${f2(v)}% entre el clic y la visita. La página está cargando el tráfico que paga el anuncio.`
	};
}
function crRead(v) {
	if (v == null) return {
		tone: "n",
		title: "Sin clics",
		body: "La conversión global es compras ÷ clics en el enlace. Todavía no hay clics."
	};
	if (v >= 1.5) return {
		tone: "g",
		title: "Por encima de la referencia",
		body: `${f2(v)}% de los clics terminan en compra. La banda sana de referencia es 1–1,5% y este tráfico la supera.`
	};
	if (v >= 1) return {
		tone: "g",
		title: "Dentro de la referencia",
		body: `${f2(v)}% de los clics compran. Está dentro de la banda sana de 1–1,5%.`
	};
	return {
		tone: "r",
		title: "Por debajo de la referencia",
		body: `${f2(v)}% de los clics compran. La referencia sana es 1–1,5%: el embudo no cierra lo que el anuncio trae.`
	};
}
function intentRead(a) {
	if (a.atc == null || a.ic == null) return {
		tone: "n",
		title: "Faltan carrito e inicio de pago",
		body: "Exporta «Añadidos al carrito» e «Inicios de pago». Sin esas columnas no se puede saber si la fricción está antes del checkout o en el recargo de 2,99 € contrareembolso."
	};
	if (a.atc === 0) return {
		tone: "y",
		title: "Nadie llega al carrito",
		body: "Hay clics, pero ningún añadido al carrito. La fricción está en la landing o en la oferta, antes del pago."
	};
	const intent = a.intent ?? 0;
	const pay = a.payRate;
	if (intent >= 55 && pay != null && pay < 45) return {
		tone: "r",
		title: "Fricción en el pago",
		body: `El ${f2(intent)}% de los carritos inicia el pago, pero solo el ${f2(pay)}% de esos inicios se cobra. El corte está en el checkout: recargo de 2,99 € contrareembolso, costes que aparecen tarde o desconfianza en el último paso.`
	};
	if (intent < 40) return {
		tone: "r",
		title: "Fricción antes del pago",
		body: `Solo el ${f2(intent)}% de los carritos inicia el pago. No es el recargo de 2,99 €: se cae entre el carrito y el checkout (envío, formulario o precio).`
	};
	return {
		tone: rules.intent(intent),
		title: "La intención llega al pago",
		body: `El ${f2(intent)}% de los carritos inicia el pago${pay != null ? ` y el ${f2(pay)}% de esos inicios compra` : ""}. No hay un corte claro ligado al contrareembolso.`
	};
}
function siteDiagnosis(a) {
	if (a.clics <= 0 && a.gasto <= 0) return {
		tone: "n",
		title: "Sin tráfico que auditar",
		body: "Cuando haya clics y visitas a la landing, aquí verás en qué paso se pierde la compra."
	};
	if (a.dropoff != null && a.dropoff > 30) return dropoffRead(a.dropoff);
	const intent = intentRead(a);
	if (intent.tone === "r" || intent.tone === "y") return intent;
	if (a.cr != null && a.cr < 1) return crRead(a.cr);
	if (a.dropoff != null && a.dropoff > 15) return dropoffRead(a.dropoff);
	return {
		tone: "g",
		title: "El sitio no es el cuello evidente",
		body: "Carga, paso a pago y conversión de clic no marcan un corte crítico. Si el anuncio no escala, el límite está en el coste del clic o en el valor del pedido."
	};
}
function buildTimeline(history, key, dur) {
	if (!history.length) return {
		days: [],
		main: [],
		range: [],
		missing: []
	};
	const dmin = history.reduce((m, s) => s.inicio < m ? s.inicio : m, history[0].inicio);
	const dmax = history.reduce((m, s) => s.fin > m ? s.fin : m, history[0].fin);
	const days = [];
	for (let t = Date.parse(`${dmin}T00:00:00Z`); days.length < 400; t += 864e5) {
		const iso = new Date(t).toISOString().slice(0, 10);
		days.push(iso);
		if (iso >= dmax) break;
	}
	const daily = /* @__PURE__ */ new Map();
	for (const s of history) if (dayCount(s) === 1) daily.set(s.fin, s);
	const ranges = history.filter((s) => dayCount(s) > 1).sort((a, b) => dayCount(b) - dayCount(a));
	const rangeOf = (d) => ranges.find((r) => r.inicio <= d && d <= r.fin);
	const valueOf = (s, avg) => {
		const n = metricValue(viewOf(s, dur), key);
		if (n == null) return null;
		return avg && ADDITIVE.has(key) ? n / dayCount(s) : n;
	};
	return {
		days,
		main: days.map((d) => {
			const s = daily.get(d);
			return s ? valueOf(s, false) : null;
		}),
		range: days.map((d) => {
			if (daily.has(d)) return null;
			const r = rangeOf(d);
			return r ? valueOf(r, true) : null;
		}),
		missing: days.filter((d) => !daily.has(d) && !rangeOf(d))
	};
}
function sparkValues(history, key, dur) {
	const days = history.filter((s) => dayCount(s) === 1);
	return (days.length >= 2 ? days : history).map((s) => metricValue(viewOf(s, dur), key));
}
function availableMetrics(history, dur) {
	return CHART_METRICS.map((m) => m.id).filter((id) => history.some((s) => metricValue(viewOf(s, dur), id) != null));
}
var LEGEND = [
	{
		name: "Frecuencia",
		rule: "verde ≤ 1,40 · amarillo 1,41–1,80 · rojo > 1,80. En el acumulado se muestra la del último informe: no se promedia."
	},
	{
		name: "CTR enlace",
		rule: "verde ≥ 2,50% · amarillo 1,50–2,49% · rojo < 1,50%. Se usa el CTR de clic en el enlace, no el CTR de todos los clics."
	},
	{
		name: "Carga LPV",
		rule: "verde ≥ 85% · amarillo 70–84,9% · rojo < 70%."
	},
	{
		name: "Fuga de carga",
		rule: "clics que no llegan a la landing. Verde ≤ 15% · amarillo 15–30% · rojo > 30% (crítico)."
	},
	{
		name: "CPA",
		rule: "verde ≤ 10 € · amarillo 10,01–15 € · rojo > 15 €."
	},
	{
		name: "ROAS",
		rule: "verde ≥ 2,50x · amarillo 1,50–2,49x · rojo < 1,50x. Si el Excel trae 250 o 250%, se lee como 2,50x. Si falta la columna, se calcula valor de compras ÷ gasto."
	},
	{
		name: "CR global",
		rule: "compras ÷ clics en el enlace. Referencia sana 1–1,5%. Por debajo de 1% queda en rojo."
	},
	{
		name: "Hook rate",
		rule: "visualizaciones de 3 s ÷ impresiones. Verde ≥ 30% · amarillo 20–29,9% · rojo < 20%."
	},
	{
		name: "Hold rate",
		rule: "retención final (100%, si no 95%, ThruPlay o 75%) ÷ visualizaciones de 3 s. Verde ≥ 35% · amarillo 20–34,9% · rojo < 20%."
	},
	{
		name: "Tiempo medio",
		rule: "verde ≥ 5 s · amarillo 3–4,9 s · rojo < 3 s. El ratio tiempo/duración usa la duración del informe o la que indiques."
	},
	{
		name: "Intención IC/ATC",
		rule: "inicios de pago ÷ añadidos al carrito. Si es alta y compras/inicios es baja, la fricción está en el pago (por ejemplo el recargo de 2,99 €). Si es baja, está antes del checkout."
	},
	{
		name: "Acumulado",
		rule: "sumas, no medias de porcentajes. Los informes que se solapan en fechas se excluyen para no duplicar gasto. El alcance es suma de alcances diarios, no alcance único."
	}
];
function norm(s) {
	return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[_/]+/g, " ").replace(/[^a-z0-9% ]+/g, " ").replace(/\s+/g, " ").trim();
}
function parseLooseNumber(v) {
	if (typeof v === "number") return {
		n: Number.isFinite(v) ? v : null,
		explicitPct: false
	};
	if (v == null || typeof v === "boolean" || v instanceof Date) return {
		n: null,
		explicitPct: false
	};
	let s = String(v).trim();
	if (!s || s === "-" || s === "—" || s === "–" || s.toLowerCase() === "n/a") return {
		n: null,
		explicitPct: false
	};
	const explicitPct = s.includes("%");
	s = s.replace(/\s/g, "").replace(/[€$£x×]/gi, "").replace(/%/g, "");
	if (!s || s === "-" || s === "+") return {
		n: null,
		explicitPct
	};
	const hasC = s.includes(",");
	const hasD = s.includes(".");
	if (hasC && hasD) {
		if (s.lastIndexOf(",") > s.lastIndexOf(".")) s = s.replace(/\./g, "").replace(",", ".");
		else s = s.replace(/,/g, "");
	} else if (hasC) {
		const parts = s.split(",");
		if (parts.length === 2 && parts[1].length > 0 && parts[1].length <= 2) s = `${parts[0].replace(/\./g, "")}.${parts[1]}`;
		else s = s.replace(/,/g, "");
	}
	const n = Number(s);
	return {
		n: Number.isFinite(n) ? n : null,
		explicitPct
	};
}
function toIsoDate(v) {
	if (v == null || v === "") return null;
	if (v instanceof Date && !Number.isNaN(v.getTime())) return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, "0")}-${String(v.getDate()).padStart(2, "0")}`;
	if (typeof v === "number" && v > 2e4 && v < 8e4) return new Date(Math.round((v - 25569) * 864e5)).toISOString().slice(0, 10);
	const s = String(v).trim();
	let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
	if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
	m = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})/);
	if (m) return `${m[3].length === 2 ? `20${m[3]}` : m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
	return null;
}
function toSec(v) {
	if (typeof v === "number") return Number.isFinite(v) ? v : null;
	if (typeof v === "string" && v.includes(":")) {
		const parts = v.trim().split(":").map(Number);
		if (parts.length < 2 || parts.some((x) => !Number.isFinite(x))) return null;
		return parts.reduce((a, x) => a * 60 + x, 0);
	}
	return parseLooseNumber(v).n;
}
function unwrap(cell) {
	if (cell && typeof cell === "object" && !(cell instanceof Date) && "v" in cell) return {
		value: cell.v ?? null,
		pct: !!cell.pct
	};
	return {
		value: cell,
		pct: false
	};
}
function numFrom(cell, kind) {
	const { value, pct } = unwrap(cell);
	const parsed = parseLooseNumber(value);
	if (parsed.n == null) return {
		n: null,
		adjusted: false
	};
	if (kind === "rate") {
		if (parsed.explicitPct) return {
			n: parsed.n,
			adjusted: false
		};
		if (pct) return {
			n: parsed.n * 100,
			adjusted: true
		};
		return {
			n: parsed.n,
			adjusted: false
		};
	}
	if (kind === "roas") {
		if (parsed.explicitPct) return {
			n: parsed.n / 100,
			adjusted: true
		};
		if (pct) return {
			n: parsed.n,
			adjusted: false
		};
		if (parsed.n > 20) return {
			n: parsed.n / 100,
			adjusted: true
		};
		return {
			n: parsed.n,
			adjusted: false
		};
	}
	return {
		n: parsed.n,
		adjusted: false
	};
}
function ranked(keys, pred, rank) {
	return keys.filter(pred).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}
function pick(keys, pred, rank = (k) => k.length) {
	let best;
	let score = Infinity;
	for (const k of keys) {
		if (!pred(k)) continue;
		const r = rank(k);
		if (r < score) {
			score = r;
			best = k;
		}
	}
	return best;
}
function notMoney(k) {
	return !/costo|coste|cost |valor|roas|retorno|ingreso/.test(k);
}
function collect(rows) {
	const original = /* @__PURE__ */ new Map();
	for (const row of rows) for (const key of Object.keys(row)) {
		const n = norm(key);
		if (n && !original.has(n)) original.set(n, key);
	}
	return original;
}
function isTotalName(name) {
	const n = norm(name);
	return !n || n === "total" || n === "cuenta" || n.startsWith("total ") || n === "resultados totales";
}
function isActive(v) {
	const s = norm(String(v ?? ""));
	if (!s) return false;
	if (/inactiv|paus|archiv|rechaz|reject|complet|off|not /.test(s)) return false;
	return s === "active" || s === "activo" || s.startsWith("active") || s.startsWith("activo");
}
function rowsToSnaps(rows) {
	if (!rows.length) return [];
	const original = collect(rows);
	const keys = [...original.keys()];
	const col = {
		ad: pick(keys, (k) => k === "nombre del anuncio" || k === "ad name" || k === "anuncio"),
		adset: pick(keys, (k) => k.includes("conjunto de anuncios") || k === "ad set name"),
		campaign: pick(keys, (k) => k === "nombre de la campana" || k === "campaign name" || k.startsWith("nombre de la campana")),
		inicio: pick(keys, (k) => k.startsWith("inicio del informe") || k.startsWith("reporting starts")),
		fin: pick(keys, (k) => k.startsWith("fin del informe") || k.startsWith("reporting ends")),
		dia: pick(keys, (k) => k === "dia" || k === "day" || k === "fecha" || k === "date"),
		purchases: pick(keys, (k) => notMoney(k) && (/(^| )compras($| )/.test(k) || /(^| )purchases($| )/.test(k) || k === "compra" || k === "purchase"), (k) => (k === "compras" || k === "purchases" ? 0 : k.includes("sitio") || k.includes("website") ? 2 : 1) + k.length / 1e3),
		results: pick(keys, (k) => notMoney(k) && (k === "resultados" || k === "results" || k.startsWith("resultados ") && !k.includes("indicador"))),
		cpa: pick(keys, (k) => k.startsWith("costo por resultados") || k.startsWith("costo por compra") || k.startsWith("cost per result") || k === "cpa" || k.startsWith("cpa ")),
		freq: pick(keys, (k) => k === "frecuencia" || k === "frequency" || k.startsWith("frecuencia ")),
		ctr: pick(keys, (k) => k === "ctr" || k.startsWith("ctr "), (k) => (k.includes("enlace") || k.includes("link") ? 0 : 5) + (k.includes("todos") || k.includes("all") ? 3 : 0) + k.length / 1e4),
		lpv: pick(keys, (k) => k.includes("porcentaje") && k.includes("visita") && k.includes("pagina") || k.includes("landing page view rate")),
		impr: pick(keys, (k) => {
			if (/costo|coste|cpm|unica|unique/.test(k)) return false;
			return k === "impresiones" || k.startsWith("impresiones ") || k === "impressions" || k.startsWith("impressions ");
		}),
		clics: pick(keys, (k) => {
			if (!notMoney(k) || /ctr|cpc|unico|unique|saliente|outbound/.test(k)) return false;
			const click = k.includes("clics") || k.includes("clicks");
			const link = k.includes("enlace") || k.includes("link");
			return click && link;
		}),
		alcance: pick(keys, (k) => {
			if (/costo|coste|cost /.test(k)) return false;
			return k === "alcance" || k.startsWith("alcance ") || k === "reach" || k.startsWith("reach ");
		}),
		cpc: pick(keys, (k) => (k.startsWith("cpc") || k.includes("costo por clic") || k.includes("cost per link")) && (k.includes("enlace") || k.includes("link") || k.startsWith("cpc"))),
		plays: pick(keys, (k) => {
			if (/3|thruplay|hasta|%|promedio|tiempo|costo|cost |continu/.test(k)) return false;
			return k === "reproducciones de video" || k === "video plays" || k === "reproducciones";
		}),
		v3s: pick(keys, (k) => /3\s*s|3 seg|3 second/.test(k) && /reproduc|video|play|visualiz/.test(k)),
		p100: pick(keys, (k) => /reproduc|video|play|visualiz/.test(k) && (k.includes("hasta el 100") || k.includes("100%") || k.includes("at 100"))),
		p95: pick(keys, (k) => /reproduc|video|play|visualiz/.test(k) && (k.includes("hasta el 95") || k.includes("95%") || k.includes("at 95"))),
		p75: pick(keys, (k) => /reproduc|video|play|visualiz/.test(k) && (k.includes("hasta el 75") || k.includes("75%") || k.includes("at 75"))),
		thru: pick(keys, (k) => k.includes("thruplay") || k.includes("reproducciones continuas")),
		vis: pick(keys, (k) => {
			if (/porcentaje|costo|coste|cost |rate/.test(k)) return false;
			return k.startsWith("visitas a la pagina") || k === "landing page views" || k.startsWith("landing page views");
		}),
		avgT: pick(keys, (k) => k.includes("tiempo promedio") || k.includes("average video play") || k.includes("video average play")),
		duration: pick(keys, (k) => k.includes("duracion") && (k.includes("video") || k.includes("anuncio"))),
		atc: pick(keys, (k) => notMoney(k) && (k.includes("al carrito") || k.includes("add to cart") || k.includes("adds to cart"))),
		ic: pick(keys, (k) => {
			if (!notMoney(k)) return false;
			return k.includes("inicios de pago") || k.includes("pagos iniciados") || k.includes("inicio de pago") || k.includes("inicios del pago") || k.includes("proceso de pago") || k.includes("finalizacion de compra") || k.includes("checkout");
		}),
		delivery: pick(keys, (k) => k.includes("entrega del anuncio") || k === "ad delivery" || k === "delivery" || k.includes("delivery status"))
	};
	const roasKeys = ranked(keys, (k) => k.includes("roas") && !/movil|mobile| app/.test(k), (k) => (k.includes("compra") || k.includes("purchase") ? 0 : 10) + (k.includes("sitio") || k.includes("website") ? 2 : 0) + k.length / 1e3);
	const spendKeys = ranked(keys, (k) => {
		if (/costo|coste|cpc|cpm|por resultado|por compra/.test(k)) return false;
		return k.startsWith("monto gastado") || k.startsWith("importe gastado") || k.startsWith("amount spent") || k === "gasto" || k === "spend";
	}, (k) => k.length);
	const valueKeys = ranked(keys, (k) => {
		if (k.includes("roas") || /costo|coste|cost /.test(k)) return false;
		return /valor|ingreso|conversion value|revenue/.test(k) && (k.includes("compra") || k.includes("purchase"));
	}, (k) => k.length);
	const read = (row, key) => key ? row[original.get(key) ?? ""] : void 0;
	const firstNum = (row, list, kind) => {
		for (const key of list) {
			const got = numFrom(read(row, key), kind);
			if (got.n != null) return got;
		}
		return {
			n: null,
			adjusted: false
		};
	};
	const out = [];
	for (const row of rows) {
		const adRaw = read(row, col.ad) ?? read(row, col.adset) ?? read(row, col.campaign);
		const adName = String(unwrap(adRaw).value ?? "").trim();
		if (isTotalName(adName)) continue;
		const inicio = toIsoDate(unwrap(read(row, col.inicio)).value) ?? toIsoDate(unwrap(read(row, col.dia)).value);
		const fin = toIsoDate(unwrap(read(row, col.fin)).value) ?? inicio;
		if (!inicio || !fin) continue;
		const spend = firstNum(row, spendKeys, "plain").n ?? 0;
		const purchasesCell = col.purchases ? read(row, col.purchases) : void 0;
		const resultsCell = col.results ? read(row, col.results) : void 0;
		const purchases = numFrom(purchasesCell ?? resultsCell, "plain").n ?? 0;
		const purchaseValue = firstNum(row, valueKeys, "plain").n;
		const roasResolved = (() => {
			for (const key of roasKeys) {
				const fromCol = numFrom(read(row, key), "roas");
				if (fromCol.n != null) return {
					roas: fromCol.n,
					adjusted: fromCol.adjusted,
					origin: "column"
				};
			}
			if (purchaseValue != null && spend > 0) return {
				roas: purchaseValue / spend,
				adjusted: false,
				origin: "value"
			};
			return {
				roas: null,
				adjusted: false,
				origin: "none"
			};
		})();
		let cpa = numFrom(read(row, col.cpa), "plain").n;
		if (cpa == null && purchases > 0) cpa = spend / purchases;
		const impr = numFrom(read(row, col.impr), "plain").n ?? 0;
		const ctr = numFrom(read(row, col.ctr), "rate").n;
		const clicsRaw = col.clics ? numFrom(read(row, col.clics), "plain") : {
			n: null,
			adjusted: false
		};
		let clics = clicsRaw.n ?? 0;
		if (clicsRaw.n == null) {
			const cpc = numFrom(read(row, col.cpc), "plain").n;
			if (ctr != null && impr) clics = Math.round(ctr * impr / 100);
			else if (cpc && spend) clics = Math.round(spend / cpc);
		}
		const vis = numFrom(read(row, col.vis), "plain").n;
		let lpv = numFrom(read(row, col.lpv), "rate").n;
		if (lpv == null && vis != null && clics > 0) lpv = Math.min(100, vis / clics * 100);
		const delivery = read(row, col.delivery);
		const campaign = String(unwrap(read(row, col.campaign)).value ?? "").trim();
		out.push({
			ad: adName,
			campaign,
			inicio,
			fin,
			activo: delivery != null && isActive(unwrap(delivery).value),
			gasto: spend,
			resultados: purchases,
			cpa,
			roas: roasResolved.roas,
			roasAdjusted: roasResolved.adjusted,
			roasOrigin: roasResolved.origin,
			purchaseValue,
			freq: numFrom(read(row, col.freq), "plain").n,
			ctr,
			lpv,
			impr,
			clics,
			alcance: numFrom(read(row, col.alcance), "plain").n,
			plays: numFrom(read(row, col.plays), "plain").n,
			v3s: numFrom(read(row, col.v3s), "plain").n,
			p75: numFrom(read(row, col.p75), "plain").n,
			p95: numFrom(read(row, col.p95), "plain").n,
			p100: numFrom(read(row, col.p100), "plain").n,
			thru: numFrom(read(row, col.thru), "plain").n,
			vis,
			avgT: toSec(unwrap(read(row, col.avgT)).value),
			duration: toSec(unwrap(read(row, col.duration)).value),
			atc: col.atc ? numFrom(read(row, col.atc), "plain").n : null,
			ic: col.ic ? numFrom(read(row, col.ic), "plain").n : null
		});
	}
	return out;
}
async function bufferToSnaps(data) {
	const XLSX = await import("../_libs/xlsx.mjs").then((n) => n.t);
	const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
	const zip = bytes.length > 3 && bytes[0] === 80 && bytes[1] === 75;
	const ole = bytes.length > 4 && bytes[0] === 208 && bytes[1] === 207;
	let text = "";
	if (!zip && !ole) {
		text = new TextDecoder().decode(bytes).replace(/^\uFEFF/, "");
		const first = text.split(/\r?\n/, 1)[0] ?? "";
		const semis = first.split(";").length;
		const commas = first.split(",").length;
		const wb = XLSX.read(text, {
			type: "string",
			FS: semis > commas ? ";" : ","
		});
		const all = [];
		for (const name of wb.SheetNames) all.push(...rowsToSnaps(sheetToRows(wb.Sheets[name])));
		return all;
	}
	const wb = XLSX.read(bytes, { type: "array" });
	const all = [];
	for (const name of wb.SheetNames) all.push(...rowsToSnaps(sheetToRows(wb.Sheets[name])));
	return all;
}
function sheetToRows(sheet) {
	if (!sheet || !sheet["!ref"]) return [];
	return sheetToRowsSync(sheet);
}
function sheetToRowsSync(sheet) {
	const XLSXref = sheet["!ref"];
	if (!XLSXref) return [];
	const range = decodeRange(XLSXref);
	let header = range.s.r;
	const limit = Math.min(range.e.r, range.s.r + 20);
	for (let r = range.s.r; r <= limit; r++) {
		const texts = [];
		for (let c = range.s.c; c <= range.e.c; c++) {
			const cell = sheet[encodeCell(r, c)];
			if (!cell) continue;
			texts.push(norm(String(cell.w ?? cell.v ?? "")));
		}
		const joined = texts.join(" ");
		if (joined.includes("nombre del anuncio") || joined.includes("ad name") || joined.includes("monto gastado") || joined.includes("amount spent")) {
			header = r;
			break;
		}
	}
	const headers = [];
	for (let c = range.s.c; c <= range.e.c; c++) {
		const cell = sheet[encodeCell(header, c)];
		headers.push(cell ? String(cell.w ?? cell.v ?? "").trim() : "");
	}
	const rows = [];
	for (let r = header + 1; r <= range.e.r; r++) {
		const row = {};
		let any = false;
		for (let c = range.s.c; c <= range.e.c; c++) {
			const h = headers[c - range.s.c];
			if (!h) continue;
			const cell = sheet[encodeCell(r, c)];
			if (!cell || cell.v == null || cell.v === "") continue;
			any = true;
			const z = String(cell.z ?? "");
			const w = cell.w != null ? String(cell.w) : "";
			row[h] = {
				v: w && (/,\d/.test(w) || /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(w.trim())) ? w : cell.v,
				pct: z.includes("%") || w.includes("%")
			};
		}
		if (any) rows.push(row);
	}
	return rows;
}
function encodeCell(r, c) {
	let col = "";
	let n = c + 1;
	while (n > 0) {
		const rem = (n - 1) % 26;
		col = String.fromCharCode(65 + rem) + col;
		n = Math.floor((n - 1) / 26);
	}
	return `${col}${r + 1}`;
}
function decodeRange(ref) {
	const [a, b] = ref.split(":");
	return {
		s: decodeCell(a),
		e: decodeCell(b || a)
	};
}
function decodeCell(addr) {
	const m = addr.match(/^([A-Z]+)(\d+)$/i);
	if (!m) return {
		r: 0,
		c: 0
	};
	let c = 0;
	for (const ch of m[1].toUpperCase()) c = c * 26 + (ch.charCodeAt(0) - 64);
	return {
		r: Number(m[2]) - 1,
		c: c - 1
	};
}
async function filesToSnaps(files) {
	const snaps = [];
	const notes = [];
	for (const file of files) {
		if (!/\.(xlsx|xls|csv)$/i.test(file.name) || file.name.startsWith("~$")) continue;
		try {
			const parsed = await bufferToSnaps(await file.arrayBuffer());
			if (!parsed.length) notes.push(`${file.name}: no encontré filas con anuncio y fechas.`);
			snaps.push(...parsed);
		} catch {
			notes.push(`${file.name}: no se pudo leer.`);
		}
	}
	if (!snaps.length && !notes.length) notes.push("No hay archivos .xlsx, .xls o .csv en la selección.");
	return {
		snaps,
		notes
	};
}
var SNAPS = "elixia_meta_snaps_v4";
var DURS = "elixia_durations_v1";
var THEME = "elixia_theme";
var SKIP = "elixia_skip_demo";
function isSnap(x) {
	if (!x || typeof x !== "object") return false;
	const s = x;
	return typeof s.ad === "string" && typeof s.inicio === "string" && typeof s.fin === "string" && typeof s.gasto === "number";
}
function loadState() {
	let snaps = [];
	let durations = {};
	let theme = "light";
	let skipDemo = false;
	try {
		const raw = JSON.parse(localStorage.getItem(SNAPS) || "null");
		if (Array.isArray(raw)) snaps = raw.filter(isSnap);
		const d = JSON.parse(localStorage.getItem(DURS) || "null");
		if (d && typeof d === "object") {
			for (const [k, v] of Object.entries(d)) if (typeof v === "number" && v > 0) durations[k] = v;
		}
		const t = localStorage.getItem(THEME);
		if (t === "dark" || t === "light") theme = t;
		else if (window.matchMedia("(prefers-color-scheme: dark)").matches) theme = "dark";
		skipDemo = localStorage.getItem(SKIP) === "1";
	} catch {}
	return {
		snaps,
		durations,
		theme,
		skipDemo
	};
}
function saveSnaps(snaps) {
	localStorage.setItem(SNAPS, JSON.stringify(snaps));
}
function saveDurations(durations) {
	localStorage.setItem(DURS, JSON.stringify(durations));
}
function saveTheme(theme) {
	localStorage.setItem(THEME, theme);
}
function setSkipDemo(skip) {
	if (skip) localStorage.setItem(SKIP, "1");
	else localStorage.removeItem(SKIP);
}
function snapId(s) {
	let h = 5381;
	const key = s.ad;
	for (let i = 0; i < key.length; i++) h = (h << 5) + h + key.charCodeAt(i) >>> 0;
	return `${s.fin}|${s.inicio}|${h.toString(36)}`;
}
function mergeSnaps(prev, incoming) {
	const map = new Map(prev.filter((s) => !s.demo).map((s) => [snapId(s), s]));
	let nuevos = 0;
	let actualizados = 0;
	for (const s of incoming) {
		const id = snapId(s);
		if (map.has(id)) actualizados += 1;
		else nuevos += 1;
		map.set(id, {
			...s,
			demo: false
		});
	}
	return {
		next: [...map.values()],
		nuevos,
		actualizados
	};
}
function toCsv(snaps) {
	const head = [
		"anuncio",
		"campana",
		"inicio",
		"fin",
		"activo",
		"gasto",
		"compras",
		"cpa",
		"roas",
		"roas_origen",
		"valor_compras",
		"frecuencia",
		"ctr_enlace",
		"carga_lpv",
		"hook",
		"vis_3s",
		"retencion_final",
		"tiempo_medio",
		"duracion",
		"impresiones",
		"clics",
		"visitas",
		"alcance",
		"anadidos_carrito",
		"inicios_pago",
		"ejemplo"
	];
	const q = (s) => `"${s.replace(/"/g, "\"\"")}"`;
	const n = (v) => v == null ? "" : String(Math.round(v * 1e4) / 1e4);
	const lines = snaps.filter((s) => s.ad).sort((a, b) => a.ad.localeCompare(b.ad, "es") || a.fin.localeCompare(b.fin)).map((s) => [
		q(s.ad),
		q(s.campaign),
		s.inicio,
		s.fin,
		s.activo ? "1" : "0",
		n(s.gasto),
		s.resultados,
		n(s.cpa),
		n(s.roas),
		s.roasOrigin,
		n(s.purchaseValue),
		n(s.freq),
		n(s.ctr),
		n(s.lpv),
		n(s.v3s != null && s.impr ? s.v3s / s.impr * 100 : null),
		n(s.v3s),
		n(s.p100 ?? s.p95 ?? s.thru ?? s.p75),
		n(s.avgT),
		n(s.duration),
		s.impr,
		s.clics,
		n(s.vis),
		n(s.alcance),
		n(s.atc),
		n(s.ic),
		s.demo ? "1" : "0"
	].join(","));
	return `\uFEFF${head.join(",")}\n${lines.join("\n")}`;
}
function ChartPanel({ history, metric, onMetric, duration, theme }) {
	const canvas = (0, import_react.useRef)(null);
	const avail = availableMetrics(history, duration);
	const active = avail.includes(metric) ? metric : avail[0] ?? "roas";
	const def = CHART_METRICS.find((m) => m.id === active) ?? CHART_METRICS[0];
	const timeline = buildTimeline(history, active, duration);
	const sig = `${active}|${theme}|${timeline.days.join(",")}|${timeline.main.join(",")}|${timeline.range.join(",")}`;
	(0, import_react.useEffect)(() => {
		const node = canvas.current;
		if (!node || !timeline.days.length) return;
		let dead = false;
		let chart = null;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		(async () => {
			const Chart = (await import("../_libs/chart.js.mjs").then((n) => n.t)).default;
			if (dead) return;
			ensureCrosshair(Chart);
			const styles = getComputedStyle(document.documentElement);
			const ink = styles.getPropertyValue("--muted").trim() || "#655868";
			const accent = styles.getPropertyValue("--accent").trim() || "#00a9a5";
			const gold = styles.getPropertyValue("--gold").trim() || "#e08e04";
			const ok = styles.getPropertyValue("--ok").trim() || "#047857";
			const bad = styles.getPropertyValue("--bad").trim() || "#b91c1c";
			const warn = styles.getPropertyValue("--warn").trim() || "#b45309";
			const surface = styles.getPropertyValue("--surface").trim() || "#fff";
			const fg = styles.getPropertyValue("--fg").trim() || "#241428";
			const labels = timeline.days.map((d) => `${d.slice(8, 10)}/${d.slice(5, 7)}`);
			const datasets = [{
				label: def.label,
				data: timeline.main,
				borderColor: accent,
				backgroundColor: colorAlpha(accent, .14),
				fill: true,
				tension: .25,
				borderWidth: 2.5,
				pointRadius: timeline.days.length > 45 ? 0 : 3,
				pointHoverRadius: 5,
				pointHitRadius: 12,
				spanGaps: false
			}];
			if (timeline.range.some((v) => v != null)) datasets.push({
				label: additive(active) ? "Promedio diario del informe de rango" : "Valor del informe de rango",
				data: timeline.range,
				borderColor: gold,
				borderDash: [6, 4],
				pointRadius: 2,
				borderWidth: 2,
				spanGaps: false,
				fill: false
			});
			if (def.thresholds) {
				const colors = def.hi ? [warn, ok] : [ok, bad];
				def.thresholds.forEach((v, i) => {
					datasets.push({
						label: `Umbral ${v}`,
						data: timeline.days.map(() => v),
						borderColor: colors[i],
						borderDash: [5, 5],
						pointRadius: 0,
						borderWidth: 1,
						fill: false
					});
				});
			}
			const instance = new Chart(node, {
				type: "line",
				data: {
					labels,
					datasets
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					animation: reduce ? false : { duration: 360 },
					interaction: {
						mode: "index",
						intersect: false
					},
					hover: {
						mode: "index",
						intersect: false
					},
					plugins: {
						legend: { labels: {
							color: ink,
							boxWidth: 10,
							font: {
								size: 11,
								family: "Plus Jakarta Sans, sans-serif"
							},
							filter: (item) => !String(item.text).startsWith("Umbral")
						} },
						tooltip: {
							mode: "index",
							intersect: false,
							backgroundColor: fg,
							titleColor: surface,
							bodyColor: surface,
							filter: (item) => !String(item.dataset.label ?? "").startsWith("Umbral"),
							callbacks: { label(ctx) {
								const y = ctx.parsed.y;
								if (y == null || Number.isNaN(y)) return "";
								return ` ${ctx.dataset.label}: ${formatMetric(active, y)}`;
							} }
						}
					},
					scales: {
						x: {
							ticks: {
								color: ink,
								maxRotation: 0,
								autoSkipPadding: 8
							},
							grid: { display: false }
						},
						y: {
							ticks: { color: ink },
							grid: { color: colorAlpha(ink, .15) }
						}
					}
				}
			});
			if (dead) instance.destroy();
			else chart = instance;
		})();
		return () => {
			dead = true;
			chart?.destroy();
		};
	}, [sig]);
	const missing = timeline.missing.map((d) => formatRange(d, d));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-3 flex gap-2 overflow-x-auto pb-1",
			children: avail.map((id) => {
				const item = CHART_METRICS.find((m) => m.id === id);
				const on = id === active;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": on,
					onClick: () => onMetric(id),
					className: on ? "min-h-11 shrink-0 rounded-full bg-logo px-3 text-sm font-semibold text-on-logo" : "min-h-11 shrink-0 rounded-full border border-line bg-surface px-3 text-sm font-semibold text-muted",
					children: item?.label ?? id
				}, id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative h-72 sm:h-80",
			children: timeline.days.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvas,
				role: "img",
				"aria-label": `Evolución de ${def.label}. La línea vertical sigue el cursor y el tooltip enseña todas las series de ese día.`
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No hay fechas para dibujar la evolución."
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-xs text-muted",
			children: [missing.length ? `Días sin informe, hueco en la gráfica: ${missing.join(", ")}.` : "Cada día del rango tiene informe o queda cubierto por uno de varios días.", " Pasa el cursor: la guía vertical sincroniza el tooltip de ese día."]
		})
	] });
}
function additive(key) {
	return key === "gasto" || key === "resultados" || key === "alcance";
}
function colorAlpha(hex, alpha) {
	const h = hex.replace("#", "").trim();
	if (h.length !== 6) return hex;
	const r = Number.parseInt(h.slice(0, 2), 16);
	const g = Number.parseInt(h.slice(2, 4), 16);
	const b = Number.parseInt(h.slice(4, 6), 16);
	if ([
		r,
		g,
		b
	].some((n) => Number.isNaN(n))) return hex;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
var pluginReady = false;
function ensureCrosshair(Chart) {
	if (pluginReady) return;
	Chart.register({
		id: "elixiaCrosshair",
		afterDraw(chart) {
			const active = chart.getActiveElements();
			if (!active.length || !chart.chartArea) return;
			const x = active[0].element.x;
			const ctx = chart.ctx;
			ctx.save();
			ctx.beginPath();
			ctx.setLineDash([4, 4]);
			ctx.lineWidth = 1;
			ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim() || "#655868";
			ctx.moveTo(x, chart.chartArea.top);
			ctx.lineTo(x, chart.chartArea.bottom);
			ctx.stroke();
			ctx.restore();
		}
	});
	pluginReady = true;
}
function Spark({ values, higher }) {
	const valid = values.filter((v) => v != null && Number.isFinite(v));
	if (valid.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "flex h-8 items-center text-xs text-muted",
		children: "Datos insuficientes"
	});
	const w = 200;
	const h = 32;
	const min = Math.min(...valid);
	const range = Math.max(...valid) - min || 1;
	const pts = values.map((v, i) => {
		if (v == null || !Number.isFinite(v)) return null;
		const x = i / (values.length - 1) * 192 + 4;
		const y = 28 - (v - min) / range * 24;
		return `${x.toFixed(1)},${y.toFixed(1)}`;
	}).filter(Boolean);
	const rising = valid[valid.length - 1] >= valid[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: `0 0 ${w} ${h}`,
		className: "h-8 w-full",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			fill: "none",
			stroke: higher == null ? "var(--accent)" : higher === rising ? "var(--ok)" : "var(--bad)",
			strokeWidth: "2.5",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			points: pts.join(" ")
		})
	});
}
var btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold";
var btnLogo = clsx(btn, "bg-logo text-on-logo");
var btnGhost = clsx(btn, "border border-line bg-surface text-fg");
function Dashboard() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Live, {});
}
function Live() {
	const [snaps, setSnaps] = (0, import_react.useState)(() => buildDemo());
	const [durations, setDurations] = (0, import_react.useState)({});
	const [theme, setTheme] = (0, import_react.useState)("light");
	const [booted, setBooted] = (0, import_react.useState)(false);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [query, setQuery] = (0, import_react.useState)("");
	const [activeOnly, setActiveOnly] = (0, import_react.useState)(false);
	const [metric, setMetric] = (0, import_react.useState)("roas");
	const [importOpen, setImportOpen] = (0, import_react.useState)(false);
	const [scope, setScope] = (0, import_react.useState)("ad");
	const [banner, setBanner] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [folderName, setFolderName] = (0, import_react.useState)(null);
	const [dragOver, setDragOver] = (0, import_react.useState)(false);
	const fileRef = (0, import_react.useRef)(null);
	const folderRef = (0, import_react.useRef)(null);
	const dirRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const boot = loadState();
		if (boot.snaps.length) setSnaps(boot.snaps);
		else if (boot.skipDemo) setSnaps([]);
		setDurations(boot.durations);
		setTheme(boot.theme);
		setImportOpen(boot.snaps.length === 0 && boot.skipDemo);
		setBooted(true);
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.dataset.theme = theme;
		if (booted) saveTheme(theme);
	}, [theme, booted]);
	(0, import_react.useEffect)(() => {
		if (!booted) return;
		try {
			saveSnaps(snaps);
		} catch {
			setBanner({
				kind: "err",
				text: "El navegador no tiene espacio para guardar más informes. Exporta un CSV y borra los antiguos."
			});
		}
	}, [snaps, booted]);
	(0, import_react.useEffect)(() => {
		if (booted) saveDurations(durations);
	}, [durations, booted]);
	(0, import_react.useEffect)(() => {
		const node = folderRef.current;
		node?.setAttribute("webkitdirectory", "");
		node?.setAttribute("directory", "");
		restoreFolder(dirRef, setFolderName);
	}, []);
	const summaries = (0, import_react.useMemo)(() => summarize(snaps, durations), [snaps, durations]);
	const account = (0, import_react.useMemo)(() => accountOf(summaries, durations), [summaries, durations]);
	const visible = summaries.filter((s) => (!activeOnly || s.latest.activo) && s.ad.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => b.agg.gasto - a.agg.gasto);
	const current = summaries.find((s) => s.ad === selected) ?? visible[0] ?? summaries[0] ?? null;
	const demo = snaps.some((s) => s.demo);
	const accountStory = accountRead(account);
	async function ingest(list) {
		const files = [...list];
		if (!files.length) return;
		setBusy(true);
		try {
			const { snaps: incoming, notes } = await filesToSnaps(files);
			if (!incoming.length) {
				setBanner({
					kind: "err",
					text: notes[0] ?? "No encontré informes válidos."
				});
				return;
			}
			const merged = mergeSnaps(snaps, incoming);
			setSnaps(merged.next);
			setSkipDemo(true);
			setImportOpen(false);
			const bits = [
				`Carga lista: ${merged.nuevos} registros nuevos, ${merged.actualizados} actualizados.`,
				incoming.some((s) => s.roasAdjusted) ? "Había ROAS en porcentaje (350 o 350%) y quedó en multiplicador (3,50x)." : "",
				incoming.some((s) => s.roasOrigin === "value") ? "Donde faltaba la columna, el ROAS es valor de compras ÷ gasto." : "",
				notes[0] ?? ""
			].filter(Boolean);
			setBanner({
				kind: "ok",
				text: bits.join(" ")
			});
		} finally {
			setBusy(false);
		}
	}
	function onDrop(e) {
		e.preventDefault();
		setDragOver(false);
		if (e.dataTransfer.files.length) ingest(e.dataTransfer.files);
	}
	function loadExample() {
		if (snaps.some((s) => !s.demo) && !window.confirm("Esto sustituye los informes cargados por el ejemplo.")) return;
		setSkipDemo(false);
		setSnaps(buildDemo());
		setBanner({
			kind: "ok",
			text: "Ejemplo cargado: cuatro anuncios con historias distintas de escala, pago, fatiga y landing lenta."
		});
	}
	function clearAll() {
		if (!snaps.length) return;
		if (!window.confirm("Se borran los informes guardados en este navegador.")) return;
		setSkipDemo(true);
		setSnaps([]);
		setImportOpen(true);
		setBanner({
			kind: "ok",
			text: "Informes borrados de este navegador."
		});
	}
	function exportCsv() {
		if (!snaps.length) {
			setBanner({
				kind: "err",
				text: "No hay informes que exportar."
			});
			return;
		}
		const blob = new Blob([toCsv(snaps)], { type: "text/csv;charset=utf-8" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = "elixia-meta-ads.csv";
		a.click();
		URL.revokeObjectURL(a.href);
	}
	const dates = snaps.map((s) => s.inicio).concat(snaps.map((s) => s.fin)).sort();
	const span = dates.length ? `${formatRange(dates[0], dates[dates.length - 1])}` : "sin fechas";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		"data-testid": "elixia-app",
		className: "mx-auto max-w-6xl px-4 pb-16 pt-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-11 place-items-center rounded-xl bg-logo text-lg font-extrabold text-on-logo",
						children: "E"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-xl font-extrabold tracking-tight sm:text-2xl",
						children: "Elixia · Meta Intelligence"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Cuenta, creativos y fricción de la landing"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: btnGhost,
							onClick: () => setTheme((t) => t === "dark" ? "light" : "dark"),
							"aria-label": theme === "dark" ? "Tema claro" : "Tema oscuro",
							children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: btnGhost,
							onClick: exportCsv,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Exportar CSV"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: btnGhost,
							onClick: clearAll,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Borrar"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "sticky top-0 z-20 -mx-4 mt-4 flex gap-2 overflow-x-auto border-b border-line bg-canvas/95 px-4 py-2 backdrop-blur",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: navLink,
						href: "#cuenta",
						children: "01 Cuenta"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: navLink,
						href: "#creativos",
						children: "02 Creativos"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: navLink,
						href: "#sitio",
						children: "03 Sitio"
					})
				]
			}),
			demo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 rounded-xl border border-line bg-soft px-3 py-2 text-sm text-muted",
				children: [
					"Estás viendo un ejemplo. Importa tus Excel de Meta Ads para sustituirlo.",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "font-semibold text-accent-ink underline",
						onClick: clearAll,
						children: "Quitar ejemplo"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-2xl border border-line bg-surface",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left",
					"aria-expanded": importOpen,
					onClick: () => setImportOpen((v) => !v),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-bold",
						children: "Importar informes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm text-muted",
						children: "Se pliega al cargar para dejar sitio a los tres bloques de diagnóstico."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: clsx("size-5 shrink-0 text-muted", importOpen && "rotate-180") })]
				}), importOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 border-t border-line p-4 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onDragEnter: (e) => {
							e.preventDefault();
							setDragOver(true);
						},
						onDragOver: (e) => e.preventDefault(),
						onDragLeave: () => setDragOver(false),
						onDrop,
						className: clsx("rounded-2xl border-2 border-dashed p-4 text-center", dragOver ? "border-accent bg-accent/10" : "border-accent/50"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mx-auto size-6 text-accent-ink" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-semibold",
								children: "Arrastra .xlsx o .csv"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "Un informe por archivo. Si repites fechas, se actualiza y no se duplica el gasto."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: clsx(btnLogo, "mt-3"),
								onClick: () => fileRef.current?.click(),
								disabled: busy,
								children: busy ? "Leyendo…" : "Elegir archivos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileRef,
								type: "file",
								accept: ".xlsx,.xls,.csv",
								multiple: true,
								hidden: true,
								onChange: (e) => {
									if (e.target.files) ingest(e.target.files);
									e.target.value = "";
								}
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-gold/50 bg-soft p-4 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, { className: "mx-auto size-6 text-gold-ink" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-semibold",
								children: "Carpeta de informes diarios"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "Lee todos los Excel y CSV. Los que ya estaban se actualizan."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap justify-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: btnLogo,
									disabled: busy,
									onClick: () => {
										pickFolder(dirRef, setFolderName, ingest, setBanner, () => folderRef.current?.click());
									},
									children: "Elegir carpeta"
								}), folderName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: btnGhost,
									disabled: busy,
									onClick: () => dirRef.current && void readHandle(dirRef.current, true, ingest, setBanner),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Releer"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: folderName ? `Carpeta vinculada: ${folderName}` : "Si el navegador no deja elegir carpeta, se abre el selector de archivos."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: folderRef,
								type: "file",
								multiple: true,
								hidden: true,
								onChange: (e) => {
									if (e.target.files) ingest(e.target.files);
									e.target.value = "";
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mt-2 text-sm font-semibold text-accent-ink underline",
								onClick: loadExample,
								children: "Cargar datos de ejemplo"
							})
						]
					})]
				})]
			}),
			banner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: clsx("mt-3 rounded-xl px-3 py-2 text-sm font-medium", banner.kind === "err" ? "bg-bad/15 text-bad" : "bg-ok/15 text-ok"),
				role: "status",
				children: banner.text
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				"aria-labelledby": "cuenta-title",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockHead, {
						id: "cuenta",
						titleId: "cuenta-title",
						index: "01 · Cuenta",
						title: "Rendimiento general",
						lede: "Gasto, compras, CPA y ROAS de toda la cuenta. El color usa los mismos cortes que un anuncio, calculados con sumas y no con medias de porcentajes."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Gasto",
								value: `${f2(account.gasto)} €`,
								hint: `${summaries.length} anuncios · ${span}`,
								bar: "bg-logo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Compras",
								value: fi(account.resultados),
								hint: "Resultados de compra, sin duplicar fechas solapadas",
								bar: "bg-ok"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "CPA",
								value: fm(account.cpa, " €"),
								hint: "Gasto ÷ compras",
								bar: "bg-accent",
								tone: toneFor("cpa", account.cpa),
								testId: "kpi-cpa"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "ROAS",
								value: fm(account.roas, "x"),
								hint: account.roasFromValue ? "Calculado con valor de compras" : "Valor de compras ÷ gasto",
								bar: "bg-gold",
								tone: toneFor("roas", account.roas),
								testId: "kpi-roas"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: clsx("mt-3 rounded-2xl border px-4 py-3", tonePanel(accountStory.tone)),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold",
							children: accountStory.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm",
							children: accountStory.body
						})]
					}),
					summaries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpendMix, { summaries: summaries.map((s) => ({
						ad: s.ad,
						gasto: s.agg.gasto
					})) })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				"aria-labelledby": "creativos-title",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockHead, {
					id: "creativos",
					titleId: "creativos-title",
					index: "02 · Creativos",
					title: "Anuncios y retención",
					lede: "Lista al estilo del administrador, histórico sin columnas de más, hook, hold rate real y el veredicto de escalar o apagar."
				}), !current ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-2xl border border-line bg-surface px-4 py-8 text-center text-sm text-muted",
					children: "Todavía no hay anuncios. Abre importar y suelta el primer informe."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid items-start gap-4 xl:grid-cols-[320px_minmax(0,1fr)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-line bg-surface p-3 xl:sticky xl:top-16 xl:max-h-[calc(100vh-5rem)] xl:overflow-y-auto",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: query,
									onChange: (e) => setQuery(e.target.value),
									placeholder: "Buscar anuncio",
									className: "min-h-11 w-full rounded-xl border border-line bg-soft py-2 pr-3 pl-9 text-sm",
									"aria-label": "Buscar anuncio"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-2 flex min-h-11 items-center gap-2 text-sm font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: activeOnly,
									onChange: (e) => setActiveOnly(e.target.checked)
								}), "Solo activos"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "mt-2 space-y-2",
								children: [visible.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "px-1 py-6 text-center text-sm text-muted",
									children: "Ningún anuncio con ese filtro."
								}), visible.map((item) => {
									const on = item.ad === current.ad;
									const verdict = getVerdict(item.agg);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											setSelected(item.ad);
											setScope("ad");
										},
										"aria-current": on ? "true" : void 0,
										className: clsx("w-full rounded-xl border px-3 py-3 text-left", on ? "border-accent bg-accent/10" : "border-line bg-soft"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-start gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: clsx("mt-1 size-2.5 shrink-0 rounded-full", item.latest.activo ? "bg-ok" : "bg-muted") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block truncate font-bold",
													children: item.ad
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "block text-xs text-muted",
													children: [
														item.history.length,
														" informes · hasta ",
														formatRange(item.latest.fin, item.latest.fin)
													]
												})]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-2 flex items-center justify-between gap-2 text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono tabular-nums",
												children: [f2(item.agg.gasto), " €"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: clsx("rounded-full px-2 py-0.5 text-xs font-bold", toneChip(verdictTone(verdict.k))),
												children: verdict.t
											})]
										})]
									}) }, item.ad);
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdDetail, {
						ad: current.ad,
						campaign: current.campaign,
						history: current.history,
						latestActivo: current.latest.activo,
						agg: current.agg,
						metric,
						onMetric: setMetric,
						theme,
						duration: durations[current.ad],
						onDuration: (n) => setDurations((d) => {
							const next = { ...d };
							if (n == null) delete next[current.ad];
							else next[current.ad] = n;
							return next;
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				"aria-labelledby": "sitio-title",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockHead, {
					id: "sitio",
					titleId: "sitio-title",
					index: "03 · Sitio",
					title: "Salud de la landing y fricción",
					lede: "Dónde se cae el clic: carga de la página, conversión de clic a compra y si el carrito muere antes o después del pago."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteBlock, {
					account,
					ad: current,
					scope,
					onScope: setScope
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mt-10 rounded-2xl border border-line bg-surface px-4 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					className: "cursor-pointer text-sm font-bold",
					children: "Leyenda del semáforo"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
					className: "mt-3 space-y-2 text-sm text-muted",
					children: LEGEND.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "font-semibold text-fg",
						children: row.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: row.rule })] }, row.name))
				})] })
			})
		]
	});
}
var navLink = "inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-semibold text-fg hover:bg-soft";
function BlockHead({ id, titleId, index, title, lede }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		id,
		className: "mb-4 scroll-mt-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs font-semibold tracking-widest text-accent-ink",
				children: index
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: titleId,
				className: "text-xl font-extrabold tracking-tight",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-3xl text-sm text-muted",
				children: lede
			})
		]
	});
}
function Kpi({ label, value, hint, bar, tone, testId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "relative overflow-hidden rounded-2xl border border-line bg-surface px-4 py-4 shadow-sm",
		"data-testid": testId,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: clsx("absolute inset-y-0 left-0 w-1", bar) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-widest text-muted uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: clsx("mt-2 font-mono text-2xl font-bold tabular-nums", toneText(tone)),
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: hint
			})
		]
	});
}
function SpendMix({ summaries }) {
	const total = summaries.reduce((a, s) => a + s.gasto, 0) || 1;
	const bars = [
		"bg-logo",
		"bg-accent",
		"bg-gold",
		"bg-brand"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 rounded-2xl border border-line bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-widest text-muted uppercase",
				children: "Dónde se va el gasto"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex h-3 overflow-hidden rounded-full bg-soft",
				children: summaries.slice().sort((a, b) => b.gasto - a.gasto).map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: bars[i % bars.length],
					style: { width: `${s.gasto / total * 100}%` },
					title: `${s.ad}: ${f2(s.gasto)} €`
				}, s.ad))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-1 text-xs text-muted sm:grid-cols-2",
				children: summaries.slice().sort((a, b) => b.gasto - a.gasto).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: s.ad
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono tabular-nums text-fg",
						children: [
							f2(s.gasto),
							" € · ",
							f2(s.gasto / total * 100),
							"%"
						]
					})]
				}, s.ad))
			})
		]
	});
}
function AdDetail({ ad, campaign, history, latestActivo, agg, metric, onMetric, theme, duration, onDuration }) {
	const verdict = getVerdict(agg);
	const hasVideo = history.some((s) => s.v3s != null || s.avgT != null || s.p100 != null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-line bg-surface p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-muted",
							children: campaign || (latestActivo ? "Activo" : "No activo")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-extrabold tracking-tight",
							children: ad
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: clsx("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold", toneChip(verdictTone(verdict.k))),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictIcon, { k: verdict.k }), verdict.t]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [
						verdict.why,
						" Acumulado: ",
						f2(agg.gasto),
						" € y ",
						fi(agg.resultados),
						" compras",
						agg.skipped ? ` · ${agg.skipped} informes solapados fuera del total` : "",
						"."
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Gasto acumulado",
						value: `${f2(agg.gasto)} €`,
						hint: `${agg.n} informes usados`,
						bar: "bg-logo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Compras",
						value: fi(agg.resultados),
						hint: "Suma, no media",
						bar: "bg-ok"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "CPA",
						value: fm(agg.cpa, " €"),
						hint: "Verde ≤ 10 €",
						bar: "bg-accent",
						tone: toneFor("cpa", agg.cpa)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "ROAS",
						value: fm(agg.roas, "x"),
						hint: agg.roasAdjusted ? "Normalizado desde porcentaje" : "Verde ≥ 2,50x",
						bar: "bg-gold",
						tone: toneFor("roas", agg.roas)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-line bg-surface p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-bold",
						children: "Vídeo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [hasVideo ? agg.retentionNote : "Este anuncio no trae reproducciones en los informes.", " Hold rate = retención final ÷ visualizaciones de 3 s."]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs font-semibold text-muted",
						children: ["Duración del vídeo (s)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							min: 1,
							step: 1,
							inputMode: "numeric",
							value: duration ?? "",
							placeholder: "ej. 15",
							"aria-label": "Duración del vídeo en segundos",
							onChange: (e) => {
								const n = Number(e.target.value);
								onDuration(!e.target.value || !Number.isFinite(n) || n <= 0 ? null : n);
							},
							className: "mt-1 block min-h-11 w-28 rounded-xl border border-line bg-soft px-3 font-mono text-sm text-fg"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							label: "Hook rate",
							value: fm(agg.hook, "%"),
							tone: toneFor("hook", agg.hook),
							hint: "3 s ÷ impresiones"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							label: "Hold rate",
							value: fm(agg.hold, "%"),
							tone: toneFor("hold", agg.hold),
							hint: "Retención final ÷ 3 s"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							label: "Tiempo medio",
							value: fm(agg.avgT, " s"),
							tone: toneFor("avgT", agg.avgT),
							hint: "Reproducción media"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							label: "Tiempo / duración",
							value: fm(agg.watch, "%"),
							tone: toneFor("watch", agg.watch),
							hint: agg.watch == null ? "Indica la duración si el Excel no la trae" : "Del vídeo visto de media"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-line bg-surface p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-3 font-bold",
					children: "Desglose histórico"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[860px] border-collapse text-right text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "text-xs tracking-wide text-muted uppercase",
							children: [
								"Fecha informe",
								"Gasto (€)",
								"Compras",
								"CPA (€)",
								"ROAS",
								"Alcance",
								"Frecuencia",
								"CTR enlace (%)",
								"Carga LPV (%)",
								"Hook rate (%)",
								"Tiempo medio (s)"
							].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: clsx("border-b border-line px-2 py-2 font-semibold", h === "Fecha informe" && "sticky left-0 bg-surface text-left"),
								children: h
							}, h))
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [history.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryRow, {
							row,
							duration
						}, `${row.inicio}-${row.fin}-${row.gasto}`)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "font-bold",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "sticky left-0 border-t-2 border-accent bg-surface px-2 py-2 text-left",
									children: [
										"Acumulado (",
										agg.n,
										agg.skipped ? `, ${agg.skipped} solapados fuera` : "",
										")"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "border-t-2 border-accent px-2 py-2",
									children: f2(agg.gasto)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "border-t-2 border-accent px-2 py-2",
									children: fi(agg.resultados)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneCell, {
									tone: toneFor("cpa", agg.cpa),
									top: true,
									children: fm(agg.cpa)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneCell, {
									tone: toneFor("roas", agg.roas),
									top: true,
									children: fm(agg.roas, "x")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "border-t-2 border-accent px-2 py-2 text-muted",
									title: "Suma de alcances diarios, no es alcance único",
									children: fi(agg.alcance)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneCell, {
									tone: toneFor("freq", agg.freq),
									top: true,
									children: fm(agg.freq)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneCell, {
									tone: toneFor("ctr", agg.ctr),
									top: true,
									children: fm(agg.ctr)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneCell, {
									tone: toneFor("lpv", agg.lpv),
									top: true,
									children: fm(agg.lpv)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneCell, {
									tone: toneFor("hook", agg.hook),
									top: true,
									children: fm(agg.hook)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneCell, {
									tone: toneFor("avgT", agg.avgT),
									top: true,
									children: fm(agg.avgT)
								})
							]
						})] })]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
				children: SPARK_KEYS.map((key) => {
					const def = CHART_METRICS.find((m) => m.id === key);
					const value = key === "alcance" ? fi(agg.alcance) : fm(agg[key], suffixFor(key));
					const tone = toneFor(key, typeof agg[key] === "number" ? agg[key] : null);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: clsx("rounded-2xl border px-3 py-3", tonePanel(tone)),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-semibold text-muted",
								children: [def.label, key === "alcance" ? " · suma de días" : ""]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xl font-bold tabular-nums",
								children: value
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spark, {
								values: sparkValues(history, key, duration),
								higher: def.hi
							})
						]
					}, key);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-line bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-1 font-bold",
						children: "Evolución temporal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-sm text-muted",
						children: "Un día sin informe no se dibuja como cero: queda un hueco. El ROAS de cada punto es el del informe, ya normalizado."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPanel, {
						history,
						metric: availableMetrics(history, duration).includes(metric) ? metric : "roas",
						onMetric,
						duration,
						theme
					})
				]
			})
		]
	});
}
function suffixFor(key) {
	if (key === "cpa") return " €";
	if (key === "roas") return "x";
	if (key === "avgT") return " s";
	if (key === "ctr" || key === "lpv" || key === "hook" || key === "hold") return "%";
	return "";
}
function HistoryRow({ row, duration }) {
	const v = aggregate([row], duration);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: "border-b border-line",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "sticky left-0 bg-surface px-2 py-2 text-left font-semibold",
				children: formatRange(row.inicio, row.fin)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-2 py-2",
				children: f2(row.gasto)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-2 py-2",
				children: fi(row.resultados)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneCell, {
				tone: toneFor("cpa", row.cpa),
				children: fm(row.cpa)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneCell, {
				tone: toneFor("roas", row.roas),
				children: fm(row.roas, "x")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-2 py-2 text-muted",
				children: fi(row.alcance)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneCell, {
				tone: toneFor("freq", row.freq),
				children: fm(row.freq)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneCell, {
				tone: toneFor("ctr", row.ctr),
				children: fm(row.ctr)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneCell, {
				tone: toneFor("lpv", row.lpv),
				children: fm(row.lpv)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneCell, {
				tone: toneFor("hook", v.hook),
				children: fm(v.hook)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToneCell, {
				tone: toneFor("avgT", row.avgT),
				children: fm(row.avgT)
			})
		]
	});
}
function ToneCell({ tone, children, top }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: clsx("px-2 py-2 font-semibold", top && "border-t-2 border-accent", toneChip(tone)),
		title: toneTitle(tone),
		children
	});
}
function Mini({ label, value, hint, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: clsx("rounded-xl border px-3 py-3", tonePanel(tone)),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-wide text-muted uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-xl font-bold tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: hint
			})
		]
	});
}
function SiteBlock({ account, ad, scope, onScope }) {
	const agg = scope === "account" || !ad ? account : ad.agg;
	const label = scope === "account" || !ad ? "toda la cuenta" : ad.ad;
	const story = siteDiagnosis(agg);
	const drop = dropoffRead(agg.dropoff);
	const cr = crRead(agg.cr);
	const intent = intentRead(agg);
	const steps = [
		{
			label: "Clics en el enlace",
			value: agg.clics
		},
		{
			label: "Visitas a la landing",
			value: agg.vis
		},
		{
			label: "Añadidos al carrito",
			value: agg.atc
		},
		{
			label: "Inicios de pago",
			value: agg.ic
		},
		{
			label: "Compras",
			value: agg.resultados
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: scope === "ad" ? btnLogo : btnGhost,
					onClick: () => onScope("ad"),
					disabled: !ad,
					children: "Anuncio seleccionado"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: scope === "account" ? btnLogo : btnGhost,
					onClick: () => onScope("account"),
					children: "Toda la cuenta"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: clsx("rounded-2xl border px-4 py-3", tonePanel(story.tone)),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-sm font-bold",
					children: [story.tone === "r" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }), story.title]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm",
					children: [
						"Sobre ",
						label,
						". ",
						story.body
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-2xl border border-line bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-bold",
							children: "Embudo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-sm text-muted",
							children: "Cada barra es el volumen del paso. El porcentaje es respecto al paso anterior, no una media de días."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { steps })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagCard, {
							title: "Fuga de carga",
							read: drop,
							extra: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-mono text-2xl font-bold tabular-nums",
								children: fm(agg.dropoff, "%")
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagCard, {
							title: "CR% global",
							read: cr,
							extra: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-mono text-2xl font-bold tabular-nums",
								children: fm(agg.cr, "%")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrMeter, { value: agg.cr })] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagCard, {
							title: "Intención de compra",
							read: intent,
							extra: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-mono text-2xl font-bold tabular-nums",
								children: agg.intent == null ? "—" : `${f2(agg.intent)}% IC/ATC`
							})
						})
					]
				})]
			})
		]
	});
}
function DiagCard({ title, read, extra }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: clsx("rounded-2xl border px-4 py-3", tonePanel(read.tone)),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-widest uppercase",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-bold",
				children: read.title
			}),
			extra,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm",
				children: read.body
			})
		]
	});
}
function Funnel({ steps }) {
	const nums = steps.map((s) => s.value).filter((v) => v != null && v > 0);
	const max = Math.max(...nums, 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "space-y-3",
		children: steps.map((s, i) => {
			const prev = i > 0 ? steps[i - 1].value : null;
			const rate = s.value != null && prev ? s.value / prev * 100 : null;
			const width = s.value == null ? 0 : Math.max(s.value > 0 ? 3 : 0, s.value / max * 100);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex items-baseline justify-between gap-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: s.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-xs tabular-nums text-muted",
					children: [s.value == null ? "sin dato" : fi(s.value), rate != null ? ` · ${f2(rate)}% del anterior` : ""]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-2.5 rounded-full bg-soft",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-2.5 rounded-full bg-accent",
					style: { width: `${width}%` }
				})
			})] }, s.label);
		})
	});
}
function CrMeter({ value }) {
	const cap = 3;
	const pos = value == null ? null : Math.min(100, Math.max(0, value / cap * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative h-2 rounded-full bg-soft",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-y-0 rounded-full bg-ok/40",
				style: {
					left: `${1 / cap * 100}%`,
					width: `${.5 / cap * 100}%`
				}
			}), pos != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-logo",
				style: { left: `${pos}%` }
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1 flex justify-between text-xs text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "0%" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "referencia 1–1,5%" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "3%+" })
			]
		})]
	});
}
function VerdictIcon({ k }) {
	const cls = "size-4";
	if (k === "esc") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: cls });
	if (k === "var") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, { className: cls });
	if (k === "apa") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, { className: cls });
	if (k === "vig") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: cls });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hourglass, { className: cls });
}
function verdictTone(k) {
	if (k === "esc") return "g";
	if (k === "var") return "y";
	if (k === "apa") return "r";
	return "n";
}
function toneText(tone) {
	if (tone === "g") return "text-ok";
	if (tone === "y") return "text-warn";
	if (tone === "r") return "text-bad";
	return "text-fg";
}
function toneChip(tone) {
	if (tone === "g") return "bg-ok/15 text-ok";
	if (tone === "y") return "bg-warn/15 text-warn";
	if (tone === "r") return "bg-bad/15 text-bad";
	return "text-muted";
}
function tonePanel(tone) {
	if (tone === "g") return "border-ok/40 bg-ok/10";
	if (tone === "y") return "border-warn/40 bg-warn/10";
	if (tone === "r") return "border-bad/40 bg-bad/10";
	return "border-line bg-surface";
}
function toneTitle(tone) {
	if (tone === "g") return "En rango";
	if (tone === "y") return "Zona intermedia";
	if (tone === "r") return "Fuera de rango";
	return "Sin dato";
}
async function pickFolder(dirRef, setName, ingest, setBanner, fallback) {
	const picker = window.showDirectoryPicker;
	if (!picker) {
		fallback();
		return;
	}
	try {
		const handle = await picker();
		dirRef.current = handle;
		setName(handle.name);
		try {
			await idbPut(handle);
		} catch {}
		await readHandle(handle, true, ingest, setBanner);
	} catch (err) {
		if (err instanceof DOMException && err.name === "AbortError") return;
		fallback();
	}
}
async function readHandle(handle, interactive, ingest, setBanner) {
	let perm = await handle.queryPermission({ mode: "read" });
	if (perm !== "granted" && interactive) perm = await handle.requestPermission({ mode: "read" });
	if (perm !== "granted") {
		setBanner({
			kind: "err",
			text: "No hay permiso para leer esa carpeta."
		});
		return;
	}
	const files = [];
	await collectFiles(handle, files);
	if (!files.length) {
		setBanner({
			kind: "err",
			text: "Esa carpeta no tiene .xlsx ni .csv."
		});
		return;
	}
	await ingest(files);
}
async function collectFiles(handle, out) {
	for await (const entry of handle.values()) if (entry.kind === "file") {
		if (/\.(xlsx|xls|csv)$/i.test(entry.name) && !entry.name.startsWith("~$") && entry.getFile) out.push(await entry.getFile());
	} else await collectFiles(entry, out);
}
async function restoreFolder(dirRef, setName) {
	if (!window.showDirectoryPicker) return;
	try {
		const handle = await idbGet();
		if (!handle) return;
		dirRef.current = handle;
		setName(handle.name);
	} catch {}
}
function idbPut(handle) {
	return idb("readwrite", (store) => store.put(handle, "dir"));
}
function idbGet() {
	return idb("readonly", (store) => store.get("dir"));
}
function idb(mode, fn) {
	return new Promise((resolve, reject) => {
		const open = indexedDB.open("elixia_fs", 1);
		open.onupgradeneeded = () => open.result.createObjectStore("h");
		open.onerror = () => reject(open.error);
		open.onsuccess = () => {
			const tx = open.result.transaction("h", mode);
			const req = fn(tx.objectStore("h"));
			tx.oncomplete = () => resolve(req.result);
			tx.onerror = () => reject(tx.error);
		};
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {});
}
//#endregion
export { Home as component };
