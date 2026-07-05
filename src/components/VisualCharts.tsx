import { useState } from "react";
import { AdReport } from "../types";
import { fmtMoney, fmtInt, fmtPct, fmtMoney2 } from "../utils";
import { BarChart3, Percent, Flame } from "lucide-react";

interface VisualChartsProps {
  ads: AdReport[];
}

type TabType = "spend" | "ctr" | "funnel";

export default function VisualCharts({ ads }: VisualChartsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("spend");

  if (!ads.length) return null;

  // Find max values to scale the charts correctly
  const maxSpend = Math.max(...ads.map((a) => a.spend || 0), 1);
  const maxResults = Math.max(...ads.map((a) => a.results || 0), 1);
  const maxCtr = Math.max(...ads.map((a) => Math.max(a.ctrLink || 0, a.ctrAll || 0)), 1);

  // Totals for Funnel
  const totalImpr = ads.reduce((sum, a) => sum + (a.impressions || 0), 0);
  const totalReach = ads.reduce((sum, a) => sum + (a.reach || 0), 0);
  const totalClicks = ads.reduce((sum, a) => sum + (a.linkClicks || 0), 0);
  const totalLanding = ads.reduce((sum, a) => sum + (a.landingViews || 0), 0);

  return (
    <div className="bg-[#16191f] border border-white/5 rounded-xl p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4 mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg text-white">Comparativa de Métricas</h3>
          <p className="text-xs text-slate-400 mt-0.5">Visualización en tiempo real de rendimiento</p>
        </div>
        <div className="flex bg-[#0a0b0d] p-1 border border-white/10 rounded-lg self-start">
          <button
            onClick={() => setActiveTab("spend")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all uppercase ${
              activeTab === "spend"
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Inversión y Resultados
          </button>
          <button
            onClick={() => setActiveTab("ctr")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all uppercase ${
              activeTab === "ctr"
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            Rendimiento (CTR)
          </button>
          <button
            onClick={() => setActiveTab("funnel")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all uppercase ${
              activeTab === "funnel"
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Embudo Total
          </button>
        </div>
      </div>

      {activeTab === "spend" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Spend chart */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase text-slate-500 tracking-wider mb-2">Presupuesto Invertido</h4>
              <div className="space-y-4">
                {ads.map((ad) => {
                  const percentage = ((ad.spend || 0) / maxSpend) * 100;
                  return (
                    <div key={ad.id} className="group">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300 truncate max-w-[200px] sm:max-w-[300px] font-medium" title={ad.label || ad.campaign}>
                          {ad.label || ad.campaign}
                        </span>
                        <span className="font-mono text-slate-400">{fmtMoney(ad.spend)}</span>
                      </div>
                      <div className="h-6 bg-[#0a0b0d] rounded-md overflow-hidden border border-white/5 flex items-center p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600/80 to-blue-500 rounded-sm transition-all duration-500 relative group-hover:brightness-110"
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        >
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-white font-extrabold">
                            {percentage > 10 ? fmtPct((ad.spend || 0) / (ads.reduce((s, x) => s + (x.spend || 0), 0) || 1) * 100) : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Results chart */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase text-slate-500 tracking-wider mb-2">Resultados Obtenidos</h4>
              <div className="space-y-4">
                {ads.map((ad) => {
                  const resultsCount = ad.results || 0;
                  const percentage = (resultsCount / maxResults) * 100;
                  return (
                    <div key={ad.id} className="group">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300 truncate max-w-[200px] sm:max-w-[300px] font-medium" title={ad.label || ad.campaign}>
                          {ad.label || ad.campaign}
                        </span>
                        <span className="font-mono text-blue-400">{resultsCount ? `${fmtInt(resultsCount)}` : "—"}</span>
                      </div>
                      <div className="h-6 bg-[#0a0b0d] rounded-md overflow-hidden border border-white/5 flex items-center p-0.5">
                        <div
                          className="h-full bg-blue-500 rounded-sm transition-all duration-500 flex items-center"
                          style={{ width: `${resultsCount ? Math.max(percentage, 2) : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ctr" && (
        <div className="space-y-6">
          <div className="space-y-5">
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-sm" />
                <span className="text-xs text-slate-400 font-mono">CTR Enlace (Clics directos)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-indigo-400 rounded-sm" />
                <span className="text-xs text-slate-400 font-mono">CTR Total (Toda interacción)</span>
              </div>
            </div>

            <div className="space-y-5">
              {ads.map((ad) => {
                const ctrL = ad.ctrLink || 0;
                const ctrA = ad.ctrAll || 0;
                const pctL = (ctrL / maxCtr) * 100;
                const pctA = (ctrA / maxCtr) * 100;

                return (
                  <div key={ad.id} className="bg-[#0a0b0d] border border-white/5 rounded-lg p-3.5 hover:border-blue-500/20 transition-all">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-200 truncate max-w-[280px] sm:max-w-md">{ad.label || ad.campaign}</span>
                      <div className="flex gap-4 font-mono text-xs">
                        <span className="text-blue-400">L: {fmtPct(ctrL)}</span>
                        <span className="text-indigo-400">T: {fmtPct(ctrA)}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {/* CTR Link Bar */}
                      <div className="h-2.5 bg-[#16191f] rounded-full overflow-hidden flex items-center p-[1px]">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pctL, 1.5)}%` }}
                        />
                      </div>

                      {/* CTR All Bar */}
                      <div className="h-2.5 bg-[#16191f] rounded-full overflow-hidden flex items-center p-[1px]">
                        <div
                          className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pctA, 1.5)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "funnel" && (
        <div className="space-y-8">
          <div className="max-w-xl mx-auto space-y-4">
            <h4 className="text-xs font-mono uppercase text-center text-slate-500 tracking-wider mb-4">
              Embudo de Conversión Consolidado
            </h4>

            {/* Stage 1: Impressions */}
            <div className="relative group">
              <div className="flex justify-between items-center bg-[#0a0b0d] border border-white/5 rounded-xl p-4 relative z-10 hover:border-blue-500/40 transition-colors">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Etapa 1</span>
                  <span className="text-white font-semibold text-sm">Impresiones (Visualizaciones)</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-white font-bold text-lg">{fmtInt(totalImpr)}</div>
                  <div className="text-xs text-slate-400">100% de audiencia</div>
                </div>
              </div>
              <div className="w-full h-2 bg-gradient-to-b from-blue-500/10 to-transparent mx-auto max-w-[90%] -mt-1 rounded-b-lg border-x border-b border-white/5" />
            </div>

            {/* Stage 2: Reach */}
            <div className="relative group">
              <div className="flex justify-between items-center bg-[#0a0b0d] border border-white/5 rounded-xl p-4 relative z-10 hover:border-blue-500/40 transition-colors">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Etapa 2</span>
                  <span className="text-white font-semibold text-sm">Alcance (Usuarios únicos)</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-blue-400 font-bold text-lg">{fmtInt(totalReach)}</div>
                  <div className="text-xs text-slate-400">
                    {totalImpr ? fmtPct((totalReach / totalImpr) * 100) : "—"} del total
                  </div>
                </div>
              </div>
              <div className="w-full h-2 bg-gradient-to-b from-blue-500/5 to-transparent mx-auto max-w-[80%] -mt-1 rounded-b-lg border-x border-b border-white/5" />
            </div>

            {/* Stage 3: Clicks */}
            <div className="relative group">
              <div className="flex justify-between items-center bg-[#0a0b0d] border border-white/5 rounded-xl p-4 relative z-10 hover:border-indigo-400/40 transition-colors">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Etapa 3</span>
                  <span className="text-white font-semibold text-sm">Clics en el Enlace</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-indigo-400 font-bold text-lg">{fmtInt(totalClicks)}</div>
                  <div className="text-xs text-slate-400">
                    {totalReach ? fmtPct((totalClicks / totalReach) * 100) : "—"} CTR / alcance
                  </div>
                </div>
              </div>
              <div className="w-full h-2 bg-gradient-to-b from-indigo-500/5 to-transparent mx-auto max-w-[70%] -mt-1 rounded-b-lg border-x border-b border-white/5" />
            </div>

            {/* Stage 4: Landing Pages */}
            <div className="relative group">
              <div className="flex justify-between items-center bg-[#0a0b0d] border border-white/5 rounded-xl p-4 relative z-10 hover:border-purple-400/40 transition-colors">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Etapa 4</span>
                  <span className="text-white font-semibold text-sm">Visitas a la Página de Destino</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-purple-400 font-bold text-lg">{fmtInt(totalLanding)}</div>
                  <div className="text-xs text-slate-400">
                    {totalClicks ? fmtPct((totalLanding / totalClicks) * 100) : "—"} ratio de carga
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
