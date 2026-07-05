import * as XLSX from "xlsx";
import { AdReport, AggregationResult } from "./types";

export function normalize(s: string | null | undefined): string {
  return (s || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export function fmtMoney(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return "$" + Math.round(n).toLocaleString("es-AR");
}

export function fmtInt(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return Math.round(n).toLocaleString("es-AR");
}

export function fmtPct(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return n.toFixed(2) + "%";
}

export function fmtMoney2(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const str = dateStr.toString().trim();
  if (!isNaN(Number(str))) {
    return new Date(Number(str));
  }
  let d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  const parts = str.split(/[-/.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

export function aggregate(ads: AdReport[]): AggregationResult {
  const sum = (key: keyof AdReport) =>
    ads.reduce((acc, a) => acc + (Number(a[key]) || 0), 0);

  const totalSpend = sum("spend");
  const totalImpr = sum("impressions");
  const totalReach = sum("reach");
  const totalAllClicks = sum("allClicks");
  const totalLinkClicks = sum("linkClicks");
  const totalLanding = sum("landingViews");
  const totalPurchases = sum("purchases");
  const totalInitiatedCheckouts = sum("initiatedCheckouts");
  const totalContentViews = sum("contentViews");

  const avgCtrAll = totalImpr ? (totalAllClicks / totalImpr) * 100 : null;
  const avgCtrLink = totalImpr ? (totalLinkClicks / totalImpr) * 100 : null;
  const avgCpcAll = totalAllClicks ? totalSpend / totalAllClicks : null;
  const avgCpcLink = totalLinkClicks ? totalSpend / totalLinkClicks : null;
  const avgCpm = totalImpr ? (totalSpend / totalImpr) * 1000 : null;

  return {
    totalSpend,
    totalImpr,
    totalReach,
    totalAllClicks,
    totalLinkClicks,
    totalLanding,
    totalPurchases,
    totalInitiatedCheckouts,
    totalContentViews,
    avgCtrAll,
    avgCtrLink,
    avgCpcAll,
    avgCpcLink,
    avgCpm,
  };
}

const HEADER_RULES: [keyof AdReport, (h: string) => boolean][] = [
  ["reportStart", (h) => h === "inicio" || h.includes("inicio del informe") || h === "fecha de inicio"],
  ["reportEnd", (h) => h === "fin" || h.includes("fin del informe") || h.includes("fecha de finalizacion") || h === "fecha de fin"],
  ["campaign", (h) => h.includes("nombre de la campana") || h.includes("nombre del conjunto de anuncios") || h.includes("nombre del anuncio") || h.includes("nombre de la campaña")],
  ["status", (h) => h.includes("entrega") || h.includes("estado") || h === "activo" || h === "status" || h.includes("delivery") || h.includes("delivery status")],
  ["results", (h) => h === "resultados"],
  ["resultIndicator", (h) => h.includes("indicador de resultado")],
  ["reach", (h) => h.includes("alcance")],
  ["frequency", (h) => h.includes("frecuencia")],
  ["costPerResult", (h) => h.includes("coste por resultado") || h.includes("costo por resultado")],
  ["budgetType", (h) => h.includes("tipo de presupuesto") || h.includes("budget type") || h.includes("tipo presupuesto") || h === "tipo"],
  ["budget", (h) => h === "presupuesto" || h.includes("presupuesto") || h.includes("budget")],
  ["spend", (h) => h.includes("importe gastado") || h.includes("monto gastado")],
  ["impressions", (h) => h.includes("impresiones")],
  ["cpm", (h) => h.includes("cpm")],
  ["cpcLink", (h) => h.includes("cpc") && h.includes("enlace")],
  ["ctrLink", (h) => h.includes("ctr") && h.includes("enlace")],
  ["linkClicks", (h) => h.includes("clics en el enlace") && !h.includes("cost")],
  ["cpcAll", (h) => h.includes("cpc") && h.includes("todos")],
  ["ctrAll", (h) => h.includes("ctr") && h.includes("todos")],
  ["allClicks", (h) => h.includes("clics") && h.includes("todos") && !h.includes("cost")],
  ["landingViews", (h) => (h.includes("visitas a la pagina de destino") || h.includes("visitas a la página de destino")) && !h.includes("cost")],
  ["costPerLanding", (h) => h.includes("coste por visita a la pagina") || h.includes("costo por visita a la página")],
  ["purchases", (h) => h.includes("compras") && !h.includes("cost") && !h.includes("valor") && !h.includes("retorno") && !h.includes("roas") && !h.includes("promedio")],
  ["initiatedCheckouts", (h) => (h.includes("pagos iniciados") || h.includes("inicio de pago") || h.includes("inicios de pago") || h.includes("checkout")) && !h.includes("cost") && !h.includes("valor") && !h.includes("retorno") && !h.includes("roas") && !h.includes("promedio")],
  ["contentViews", (h) => h.includes("visualizaciones de contenido") || h.includes("vistas de contenido") || h.includes("visualizacion de contenido")],
  ["endDate", (h) => h.trim() === "fin" || h.includes("fecha de finalizacion")],
];

function mapRow(headers: string[], row: any[]): Record<string, any> {
  const obj: Record<string, any> = { raw: {} };
  headers.forEach((h, i) => {
    const nh = normalize(h);
    obj.raw[h] = row[i];
    for (const [field, test] of HEADER_RULES) {
      if (obj[field] === undefined && test(nh)) {
        obj[field] = row[i];
        break;
      }
    }
  });
  return obj;
}

export function parseWorkbook(arrayBuffer: ArrayBuffer, filename: string): AdReport[] {
  const data = new Uint8Array(arrayBuffer);
  const wb = XLSX.read(data, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: null, raw: true });
  if (!rows.length) return [];

  const headers = rows[0].map((h) => (h || "").toString());
  const dataRows = rows.slice(1).filter((r) => r.some((c) => c !== null && c !== ""));

  return dataRows.map((r, i) => {
    const mapped = mapRow(headers, r);
    const label =
      (mapped.campaign || "Anuncio") +
      ` · ${i + 1}` +
      (mapped.reportStart && mapped.reportEnd ? ` (${mapped.reportStart} a ${mapped.reportEnd})` : "");

    // Safely parse numbers
    const parseNum = (val: any) => {
      if (val === null || val === undefined || val === "") return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    };

    return {
      id: "imp_" + Date.now() + "_" + i + "_" + Math.floor(Math.random() * 1000),
      campaign: mapped.campaign || "Sin nombre",
      status: mapped.status || "unknown",
      reportStart: mapped.reportStart ? String(mapped.reportStart) : null,
      reportEnd: mapped.reportEnd ? String(mapped.reportEnd) : null,
      results: parseNum(mapped.results),
      resultIndicator: mapped.resultIndicator ? String(mapped.resultIndicator) : null,
      reach: parseNum(mapped.reach),
      frequency: parseNum(mapped.frequency),
      costPerResult: parseNum(mapped.costPerResult),
      budget: parseNum(mapped.budget),
      budgetType: mapped.budgetType ? String(mapped.budgetType) : null,
      spend: parseNum(mapped.spend),
      endDate: mapped.endDate ? String(mapped.endDate) : null,
      impressions: parseNum(mapped.impressions),
      cpm: parseNum(mapped.cpm),
      linkClicks: parseNum(mapped.linkClicks),
      cpcLink: parseNum(mapped.cpcLink),
      ctrLink: parseNum(mapped.ctrLink),
      allClicks: parseNum(mapped.allClicks),
      ctrAll: parseNum(mapped.ctrAll),
      cpcAll: parseNum(mapped.cpcAll),
      landingViews: parseNum(mapped.landingViews),
      costPerLanding: parseNum(mapped.costPerLanding),
      purchases: parseNum(mapped.purchases),
      initiatedCheckouts: parseNum(mapped.initiatedCheckouts),
      contentViews: parseNum(mapped.contentViews),
      label,
      uploadedAt: new Date().toISOString().slice(0, 10),
      source: filename,
    };
  });
}
