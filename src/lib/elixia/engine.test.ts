import assert from "node:assert/strict";
import test from "node:test";
import * as XLSX from "xlsx";
import { buildDemo } from "./demo.ts";
import { accountOf, aggregate, getVerdict, nonOverlap, siteDiagnosis, summarize, toneFor } from "./metrics.ts";
import { bufferToSnaps, parseLooseNumber, rowsToSnaps } from "./parse.ts";
import type { Snap } from "./types.ts";

const base = {
  campaign: "",
  activo: true,
  freq: 1.2,
  ctr: 2,
  lpv: 90,
  impr: 1000,
  clics: 40,
  alcance: 800,
  plays: null,
  v3s: null,
  p75: null,
  p95: null,
  p100: null,
  thru: null,
  vis: 36,
  avgT: null,
  duration: null,
  atc: null,
  ic: null,
  demo: false,
} satisfies Omit<Snap, "ad" | "inicio" | "fin" | "gasto" | "resultados" | "cpa" | "roas" | "roasAdjusted" | "roasOrigin" | "purchaseValue">;

function snap(p: Partial<Snap> & Pick<Snap, "ad" | "inicio" | "fin" | "gasto" | "resultados">): Snap {
  return {
    ...base,
    cpa: p.resultados > 0 ? p.gasto / p.resultados : null,
    roas: null,
    roasAdjusted: false,
    roasOrigin: "none",
    purchaseValue: null,
    ...p,
  };
}

test("parseLooseNumber reads Spanish decimals and thousands", () => {
  assert.equal(parseLooseNumber("2,45").n, 2.45);
  assert.equal(parseLooseNumber("1.234,50 €").n, 1234.5);
  assert.equal(parseLooseNumber("1,234.50").n, 1234.5);
  assert.equal(parseLooseNumber("250%").n, 250);
  assert.equal(parseLooseNumber("250%").explicitPct, true);
});

test("ROAS de las compras, percent-style numbers and purchase value", () => {
  const rows = rowsToSnaps([
    {
      "Nombre del anuncio": "Uno",
      "Inicio del informe": "2026-10-01",
      "Fin del informe": "2026-10-01",
      "Monto gastado (EUR)": 20,
      "Compras": 2,
      "ROAS de las compras": 3.5,
      "CTR (todos)": 9,
      "CTR (porcentaje de clics en el enlace)": 2.2,
      Impresiones: 1000,
      "Clics en el enlace": 22,
      "Visitas a la página de destino": 18,
      "Añadidos al carrito": 6,
      "Inicios de pago": 2,
      "Reproducciones de video durante al menos 3 segundos": 400,
      "Reproducciones de video hasta el 100%": 120,
      "Entrega del anuncio": "active",
    },
    {
      "Nombre del anuncio": "Dos",
      "Inicio del informe": "01/10/2026",
      "Fin del informe": "01/10/2026",
      "Monto gastado": "20,00",
      Resultados: 1,
      "ROAS de las compras": 350,
    },
    {
      "Nombre del anuncio": "Tres",
      "Inicio del informe": "2026-10-02",
      "Fin del informe": "2026-10-02",
      "Amount spent": 10,
      Purchases: 1,
      "Retorno de la inversión publicitaria (ROAS) de las compras": "2,40",
    },
    {
      "Nombre del anuncio": "Cuatro",
      "Inicio del informe": "2026-10-03",
      "Fin del informe": "2026-10-03",
      "Monto gastado": 25,
      Compras: 2,
      "Valor de conversión de las compras": 100,
    },
  ]);
  const uno = rows.find((r) => r.ad === "Uno");
  assert.ok(uno);
  assert.equal(uno.roas, 3.5);
  assert.equal(uno.roasOrigin, "column");
  assert.equal(uno.ctr, 2.2);
  assert.equal(uno.activo, true);
  assert.equal(uno.v3s, 400);
  assert.equal(uno.p100, 120);
  assert.equal(uno.atc, 6);
  assert.equal(uno.ic, 2);
  const agg = aggregate([uno]);
  assert.ok(Math.abs((agg.dropoff ?? 0) - (4 / 22) * 100) < 0.01);
  assert.ok(Math.abs((agg.cr ?? 0) - (2 / 22) * 100) < 0.01);
  assert.ok(Math.abs((agg.intent ?? 0) - (2 / 6) * 100) < 0.01);
  assert.ok(Math.abs((agg.hold ?? 0) - 30) < 0.01);

  const dos = rows.find((r) => r.ad === "Dos");
  assert.equal(dos?.roas, 3.5);
  assert.equal(dos?.roasAdjusted, true);
  assert.equal(dos?.inicio, "2026-10-01");

  const tres = rows.find((r) => r.ad === "Tres");
  assert.equal(tres?.roas, 2.4);

  const cuatro = rows.find((r) => r.ad === "Cuatro");
  assert.equal(cuatro?.roas, 4);
  assert.equal(cuatro?.roasOrigin, "value");
});

test("missing ROAS does not force an apagar verdict", () => {
  const row = snap({ ad: "X", inicio: "2026-10-01", fin: "2026-10-01", gasto: 40, resultados: 2, ctr: null, freq: null, cpa: 20, clics: 0, impr: 0 });
  assert.equal(getVerdict(aggregate([row])).k, "vig");
});

test("overlap keeps the longer report and weighted drop-off is not an average", () => {
  const daily = [1, 2].map((d) =>
    snap({
      ad: "A",
      inicio: `2026-10-0${d}`,
      fin: `2026-10-0${d}`,
      gasto: 10,
      resultados: 1,
      clics: d === 1 ? 100 : 300,
      vis: d === 1 ? 50 : 270,
      impr: 1000,
    }),
  );
  const range = snap({ ad: "A", inicio: "2026-10-01", fin: "2026-10-03", gasto: 30, resultados: 3, clics: 90, vis: 80, impr: 3000 });
  const chosen = nonOverlap([...daily, range]);
  assert.equal(chosen.length, 1);
  assert.equal(chosen[0].gasto, 30);
  const onlyDaily = aggregate(daily);
  assert.ok(Math.abs((onlyDaily.dropoff ?? 0) - 20) < 0.01);
});

test("excel percent CTR stays in percentage points and ROAS ratio is kept", async () => {
  const ws = XLSX.utils.aoa_to_sheet([
    ["Nombre del anuncio", "Inicio del informe", "Fin del informe", "Monto gastado", "Compras", "ROAS de las compras", "CTR (porcentaje de clics en el enlace)", "Impresiones"],
    ["A", "2026-10-01", "2026-10-01", 40, 4, 2.5, 0.025, 1000],
  ]);
  ws["G2"].z = "0.00%";
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as Uint8Array;
  const snaps = await bufferToSnaps(out);
  assert.equal(snaps.length, 1);
  assert.ok(Math.abs((snaps[0].ctr ?? 0) - 2.5) < 0.05, `ctr ${snaps[0].ctr}`);
  assert.ok(Math.abs((snaps[0].roas ?? 0) - 2.5) < 0.05, `roas ${snaps[0].roas}`);
});

test("csv with Spanish decimals", async () => {
  const csv = "Nombre del anuncio;Inicio del informe;Fin del informe;Monto gastado;Compras;ROAS de compras\nPrueba;01/10/2026;01/10/2026;20,5;2;2,45\n";
  const snaps = await bufferToSnaps(new TextEncoder().encode(csv));
  assert.equal(snaps.length, 1);
  assert.equal(snaps[0].gasto, 20.5);
  assert.equal(snaps[0].roas, 2.45);
  assert.equal(snaps[0].inicio, "2026-10-01");
});

test("meta total row with blank name or delivery 0 is not an ad", async () => {
  const csv = [
    "Nombre del anuncio;Entrega del anuncio;Inicio del informe;Fin del informe;Monto gastado;Compras;ROAS de compras",
    ";0;29/10/2026;06/11/2026;56,48;;",
    "0;0;29/10/2026;06/11/2026;56,48;;",
    "combo influencer;inactive;29/10/2026;06/11/2026;29,90;5;5,52",
  ].join("\n");
  const snaps = await bufferToSnaps(new TextEncoder().encode(csv));
  assert.equal(snaps.length, 1);
  assert.equal(snaps[0].ad, "combo influencer");
  const account = accountOf(summarize(snaps, {}), {});
  assert.equal(account.gasto, 29.9);
  assert.equal(account.resultados, 5);
  assert.ok(Math.abs((account.roas ?? 0) - 5.52) < 0.01);
});

test("zero spend or zero ROAS stays out of the weighted average", () => {
  const good = snap({ ad: "Bien", inicio: "2026-10-29", fin: "2026-10-29", gasto: 20, resultados: 2, roas: 3, roasOrigin: "column" });
  const zero = snap({ ad: "Cero", inicio: "2026-10-29", fin: "2026-10-29", gasto: 40, resultados: 0, roas: 0, roasOrigin: "column" });
  const empty = snap({ ad: "Vacio", inicio: "2026-10-29", fin: "2026-10-29", gasto: 0, resultados: 0, roas: null, roasOrigin: "none" });
  const account = accountOf(summarize([good, zero, empty], {}), {});
  assert.equal(account.gasto, 60);
  assert.ok(Math.abs((account.roas ?? 0) - 3) < 0.001);
});

test("purchases without a ROAS column do not force account ROAS to zero", () => {
  const sold = snap({ ad: "Vende", inicio: "2026-10-29", fin: "2026-10-29", gasto: 30, resultados: 5, roas: null, roasOrigin: "none" });
  const quiet = snap({ ad: "Calla", inicio: "2026-10-29", fin: "2026-10-29", gasto: 10, resultados: 0, roas: null, roasOrigin: "none" });
  const account = accountOf(summarize([sold, quiet], {}), {});
  assert.equal(account.resultados, 5);
  assert.equal(account.roas, null);
});

test("demo stories land on the right verdicts", () => {
  const summaries = summarize(buildDemo(), {});
  const by = Object.fromEntries(summaries.map((s) => [s.ad, s]));
  assert.equal(getVerdict(by["UGC Unboxing — Oferta 29€"].agg).k, "esc");
  assert.equal(getVerdict(by["Testimonio COD — 2,99€"].agg).k, "var");
  assert.equal(getVerdict(by["Carrusel beneficios — fatiga"].agg).k, "apa");
  assert.equal(getVerdict(by["Estático precio — landing lenta"].agg).k, "var");
  assert.equal(siteDiagnosis(by["Testimonio COD — 2,99€"].agg).title, "Fricción en el pago");
  assert.equal(siteDiagnosis(by["Estático precio — landing lenta"].agg).title, "Fuga crítica");
  assert.ok((by["Estático precio — landing lenta"].agg.dropoff ?? 0) > 30);
  assert.equal(toneFor("roas", by["UGC Unboxing — Oferta 29€"].agg.roas), "g");
  const accountRoas = summaries.reduce((a, s) => a + (s.agg.roas ?? 0), 0);
  assert.ok(accountRoas > 0);
});
