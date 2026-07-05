import React, { useState } from "react";
import { AdReport } from "../types";
import { fmtMoney, fmtInt, fmtPct, fmtMoney2 } from "../utils";
import { BarChart3, Percent, Flame } from "lucide-react";

interface VisualChartsProps {
  ads: AdReport[];
  variant?: "default" | "fiesta";
}

type TabType = "spend" | "ctr" | "funnel";

interface TooltipInfoProps {
  title: string;
  tooltipText: string;
  align?: "left" | "right" | "center";
}

function TooltipInfo({ title, tooltipText, align = "left" }: TooltipInfoProps) {
  return (
    <div className="relative group/tooltip inline-flex items-center gap-1 cursor-help py-1">
      <span className="border-b border-dotted border-slate-600 hover:border-slate-300 transition-colors uppercase text-xs font-mono text-slate-500 tracking-wider">
        {title}
      </span>
      <span className="text-[10px] text-slate-500 hover:text-slate-400 select-none">
        ⓘ
      </span>
      <div className={`absolute top-full mt-2 hidden group-hover/tooltip:block bg-jet border border-white/10 text-slate-200 rounded-lg p-3 text-[11px] w-64 z-50 normal-case whitespace-normal tracking-normal shadow-2xl text-left font-sans ${
        align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2"
      }`}>
        <div className="font-semibold text-white mb-1 font-sans text-xs">{title}</div>
        <p className="text-slate-400 leading-relaxed font-normal">{tooltipText}</p>
        <div className={`absolute bottom-full border-4 border-transparent border-b-jet ${
          align === "left" ? "left-4" : align === "right" ? "right-4" : "left-1/2 -translate-x-1/2"
        }`} />
      </div>
    </div>
  );
}

interface TooltipHoverProps {
  children: React.ReactNode;
  tooltipText: string;
}

function TooltipHover({ children, tooltipText }: TooltipHoverProps) {
  return (
    <div className="relative group/inline inline-flex items-center gap-1 cursor-help">
      <span className="border-b border-dotted border-slate-600 hover:border-slate-300 transition-colors">
        {children}
      </span>
      <div className="absolute top-full mt-2 hidden group-hover/inline:block bg-jet border border-white/10 text-slate-200 rounded-lg p-3 text-[11px] w-64 z-50 normal-case whitespace-normal tracking-normal shadow-2xl text-left font-sans left-1/2 -translate-x-1/2">
        <p className="text-slate-300 leading-relaxed font-normal">{tooltipText}</p>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-jet" />
      </div>
    </div>
  );
}

export default function VisualCharts({ ads, variant = "default" }: VisualChartsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("spend");

  if (!ads.length) return null;

  const isFiesta = variant === "fiesta";

  // Find max values to scale the charts correctly
  const maxSpend = Math.max(...ads.map((a) => a.spend || 0), 1);
  const maxResults = Math.max(...ads.map((a) => a.results || 0), 1);
  const maxCtr = Math.max(...ads.map((a) => Math.max(a.ctrLink || 0, a.ctrAll || 0)), 1);

  // Totals for Funnel
  const totalImpr = ads.reduce((sum, a) => sum + (a.impressions || 0), 0);
  const totalReach = ads.reduce((sum, a) => sum + (a.reach || 0), 0);
  const totalClicks = ads.reduce((sum, a) => sum + (a.linkClicks || 0), 0);
  const totalLanding = ads.reduce((sum, a) => sum + (a.landingViews || 0), 0);
  const totalInitiatedCheckouts = ads.reduce((sum, a) => sum + (a.initiatedCheckouts || 0), 0);
  const totalPurchases = ads.reduce((sum, a) => sum + (a.purchases || 0), 0);

  // Theme-specific styling classes
  const containerClass = isFiesta 
    ? "bg-[#1d2d44]/30 border border-white/10 rounded-xl p-6 mb-8 shadow-lg" 
    : "bg-jet-card border border-white/5 rounded-xl p-6 mb-8";

  const activeTabClass = isFiesta 
    ? "bg-dusty-denim text-[#0d1321] font-bold shadow-sm" 
    : "bg-orchid text-jet font-bold shadow-sm";

  const inactiveTabClass = isFiesta 
    ? "text-slate-400 hover:text-dusty-denim" 
    : "text-slate-400 hover:text-orchid";

  const spendBarClass = isFiesta 
    ? "bg-gradient-to-r from-blue-slate to-dusty-denim" 
    : "bg-gradient-to-r from-orchid/60 to-orchid";

  const resultsTextClass = isFiesta ? "text-dusty-denim" : "text-orchid";
  const resultsBarClass = isFiesta ? "bg-blue-slate" : "bg-orchid";

  const ctrLColorClass = isFiesta ? "bg-dusty-denim" : "bg-orchid";
  const ctrAColorClass = isFiesta ? "bg-blue-slate" : "bg-orchid/50";
  const ctrLTextClass = isFiesta ? "text-dusty-denim" : "text-orchid";
  const ctrATextClass = isFiesta ? "text-blue-slate" : "text-orchid/80";
  const ctrCardHoverClass = isFiesta ? "hover:border-dusty-denim/40 border-white/10" : "hover:border-orchid/30 border-white/5";

  const fText2 = isFiesta ? "text-dusty-denim" : "text-orchid";
  const fText3 = isFiesta ? "text-blue-slate" : "text-orchid/80";
  const fText4 = isFiesta ? "text-dusty-denim/90" : "text-orchid/70";

  const fGrad1 = isFiesta ? "from-dusty-denim/10" : "from-orchid/10";
  const fGrad2 = isFiesta ? "from-blue-slate/5" : "from-orchid/5";
  const fGrad3 = isFiesta ? "from-dusty-denim/5" : "from-orchid/5";
  const fGrad4 = isFiesta ? "from-blue-slate/5" : "from-orchid/5";

  const fHover1 = isFiesta ? "hover:border-dusty-denim/40" : "hover:border-orchid/40";
  const fHover2 = isFiesta ? "hover:border-blue-slate/40" : "hover:border-orchid/40";
  const fHover3 = isFiesta ? "hover:border-dusty-denim/50" : "hover:border-orchid/50";
  const fHover4 = isFiesta ? "hover:border-blue-slate/60" : "hover:border-orchid/60";

  return (
    <div className={containerClass}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4 mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg text-white">
            {isFiesta ? "Comparativa del Grupo (Fiesta)" : "Comparativa de Métricas"}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isFiesta ? "Visualización de rendimiento para este grupo exclusivo" : "Visualización en tiempo real de rendimiento"}
          </p>
        </div>
        <div className="flex bg-jet p-1 border border-white/10 rounded-lg self-start">
          <button
            onClick={() => setActiveTab("spend")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all uppercase cursor-pointer ${
              activeTab === "spend" ? activeTabClass : inactiveTabClass
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Inversión y Resultados
          </button>
          <button
            onClick={() => setActiveTab("ctr")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all uppercase cursor-pointer ${
              activeTab === "ctr" ? activeTabClass : inactiveTabClass
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            Rendimiento (CTR)
          </button>
          <button
            onClick={() => setActiveTab("funnel")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all uppercase cursor-pointer ${
              activeTab === "funnel" ? activeTabClass : inactiveTabClass
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
              <div className="mb-2">
                <TooltipInfo
                  title="Presupuesto Invertido"
                  tooltipText="Muestra el dinero exacto gastado por cada campaña. La barra representa la proporción de gasto de esta campaña sobre la inversión total reportada en tus anuncios."
                />
              </div>
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
                      <div className="h-6 bg-jet rounded-md overflow-hidden border border-white/5 flex items-center p-0.5">
                        <div
                          className={`h-full ${spendBarClass} rounded-sm transition-all duration-500 relative group-hover:brightness-110`}
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        >
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-jet font-extrabold">
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
              <div className="mb-2">
                <TooltipInfo
                  title="Resultados Obtenidos"
                  tooltipText="Muestra el volumen bruto de conversiones u objetivos logrados por la campaña según su configuración de optimización en Meta Ads (clics, conversiones, etc.)."
                />
              </div>
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
                        <span className={`font-mono ${resultsTextClass} font-semibold`}>{resultsCount ? `${fmtInt(resultsCount)}` : "—"}</span>
                      </div>
                      <div className="h-6 bg-jet rounded-md overflow-hidden border border-white/5 flex items-center p-0.5">
                        <div
                          className={`h-full ${resultsBarClass} rounded-sm transition-all duration-500 flex items-center`}
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
            <div className="flex flex-wrap items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 ${ctrLColorClass} rounded-sm`} />
                <TooltipHover tooltipText="Porcentaje de personas que vieron tu anuncio y decidieron hacer clic en el enlace directo hacia tu página de destino. Un CTR de enlace alto significa que el texto, imagen/video y llamado a la acción son muy efectivos.">
                  <span className="text-xs text-slate-400 font-mono">CTR Enlace (Clics directos)</span>
                </TooltipHover>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 ${ctrAColorClass} rounded-sm`} />
                <TooltipHover tooltipText="Porcentaje de personas que interactuaron de cualquier forma con tu anuncio: clics en el enlace, likes, comentarios, compartir, expandir imagen, o ver más. Mide el interés visual general.">
                  <span className="text-xs text-slate-400 font-mono">CTR Total (Toda interacción)</span>
                </TooltipHover>
              </div>
            </div>

            <div className="space-y-5">
              {ads.map((ad) => {
                const ctrL = ad.ctrLink || 0;
                const ctrA = ad.ctrAll || 0;
                const pctL = (ctrL / maxCtr) * 100;
                const pctA = (ctrA / maxCtr) * 100;

                return (
                  <div key={ad.id} className={`bg-jet border ${ctrCardHoverClass} rounded-lg p-3.5 transition-all`}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-200 truncate max-w-[280px] sm:max-w-md">{ad.label || ad.campaign}</span>
                      <div className="flex gap-4 font-mono text-xs">
                        <span className={ctrLTextClass}>L: {fmtPct(ctrL)}</span>
                        <span className={ctrATextClass}>T: {fmtPct(ctrA)}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {/* CTR Link Bar */}
                      <div className="h-2.5 bg-jet-card rounded-full overflow-hidden flex items-center p-[1px]">
                        <div
                          className={`h-full ${ctrLColorClass} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(pctL, 1.5)}%` }}
                        />
                      </div>

                      {/* CTR All Bar */}
                      <div className="h-2.5 bg-jet-card rounded-full overflow-hidden flex items-center p-[1px]">
                        <div
                          className={`h-full ${ctrAColorClass} rounded-full transition-all duration-500`}
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
            <div className="text-center mb-4">
              <TooltipInfo
                title="Embudo de Conversión Consolidado"
                tooltipText="Mide la efectividad de tu funnel publicitario paso a paso. Te ayuda a detectar cuellos de botella (por ejemplo, si la gente hace clic pero tu página web no carga, o si cargan la página pero nadie inicia el proceso de pago)."
                align="center"
              />
            </div>

            {/* Stage 1: Impressions */}
            <div className="relative group z-30 hover:z-50">
              <div className={`flex justify-between items-center bg-jet border border-white/5 rounded-xl p-4 relative z-10 ${fHover1} transition-colors`}>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Etapa 1</span>
                  <TooltipHover tooltipText="El número total de veces que tus anuncios se mostraron en pantalla. Muestra el volumen bruto de exposición de tu marca en las plataformas de Meta.">
                    <span className="text-white font-semibold text-sm">Impresiones (Visualizaciones)</span>
                  </TooltipHover>
                </div>
                <div className="text-right font-mono">
                  <div className="text-white font-bold text-lg">{fmtInt(totalImpr)}</div>
                  <div className="text-xs text-slate-400">100% de audiencia</div>
                </div>
              </div>
              <div className={`w-full h-2 bg-gradient-to-b ${fGrad1} to-transparent mx-auto max-w-[90%] -mt-1 rounded-b-lg border-x border-b border-white/5`} />
            </div>

            {/* Stage 2: Reach */}
            <div className="relative group z-25 hover:z-50">
              <div className={`flex justify-between items-center bg-jet border border-white/5 rounded-xl p-4 relative z-10 ${fHover2} transition-colors`}>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Etapa 2</span>
                  <TooltipHover tooltipText="El número de personas reales y únicas que vieron tus anuncios al menos una vez. Es normal que las impresiones sean mayores que el alcance si las personas ven tu anuncio más de una vez.">
                    <span className="text-white font-semibold text-sm">Alcance (Usuarios únicos)</span>
                  </TooltipHover>
                </div>
                <div className="text-right font-mono">
                  <div className={`${fText2} font-bold text-lg`}>{fmtInt(totalReach)}</div>
                  <div className="text-xs text-slate-400">
                    {totalImpr ? fmtPct((totalReach / totalImpr) * 100) : "—"} del total
                  </div>
                </div>
              </div>
              <div className={`w-full h-2 bg-gradient-to-b ${fGrad2} to-transparent mx-auto max-w-[80%] -mt-1 rounded-b-lg border-x border-b border-white/5`} />
            </div>

            {/* Stage 3: Clicks */}
            <div className="relative group z-20 hover:z-50">
              <div className={`flex justify-between items-center bg-jet border border-white/5 rounded-xl p-4 relative z-10 ${fHover3} transition-colors`}>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Etapa 3</span>
                  <TooltipHover tooltipText="Usuarios que mostraron un interés activo y decidieron hacer clic directo en el enlace de tu anuncio. Representa la efectividad del gancho de tu pieza y de tu llamado a la acción (CTA).">
                    <span className="text-white font-semibold text-sm">Clics en el Enlace</span>
                  </TooltipHover>
                </div>
                <div className="text-right font-mono">
                  <div className={`${fText3} font-bold text-lg`}>{fmtInt(totalClicks)}</div>
                  <div className="text-xs text-slate-400">
                    {totalReach ? fmtPct((totalClicks / totalReach) * 100) : "—"} CTR / alcance
                  </div>
                </div>
              </div>
              <div className={`w-full h-2 bg-gradient-to-b ${fGrad3} to-transparent mx-auto max-w-[70%] -mt-1 rounded-b-lg border-x border-b border-white/5`} />
            </div>

            {/* Stage 4: Landing Pages */}
            <div className="relative group z-15 hover:z-50">
              <div className={`flex justify-between items-center bg-jet border border-white/5 rounded-xl p-4 relative z-10 ${fHover4} transition-colors`}>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Etapa 4</span>
                  <TooltipHover tooltipText="Las personas que no solo hicieron clic, sino que esperaron a que tu página web o landing page cargara por completo. Si este número es muy inferior al de los clics, tu sitio web está cargando muy lento o tiene fallas.">
                    <span className="text-white font-semibold text-sm">Visitas a la Página de Destino</span>
                  </TooltipHover>
                </div>
                <div className="text-right font-mono">
                  <div className={`${fText4} font-bold text-lg`}>{fmtInt(totalLanding)}</div>
                  <div className="text-xs text-slate-400">
                    {totalClicks ? fmtPct((totalLanding / totalClicks) * 100) : "—"} ratio de carga
                  </div>
                </div>
              </div>
              {(totalInitiatedCheckouts > 0 || totalPurchases > 0) && (
                <div className={`w-full h-2 bg-gradient-to-b ${fGrad4} to-transparent mx-auto max-w-[60%] -mt-1 rounded-b-lg border-x border-b border-white/5`} />
              )}
            </div>

            {/* Stage 5: Initiated Checkouts */}
            {(totalInitiatedCheckouts > 0 || totalPurchases > 0) && (
              <div className="relative group z-10 hover:z-50">
                <div className="flex justify-between items-center bg-jet border border-white/5 rounded-xl p-4 relative z-10 hover:border-amber-400/40 transition-colors">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Etapa 5 (Píxel)</span>
                    <TooltipHover tooltipText="Usuarios con alta intención de compra que ingresaron sus datos y comenzaron el proceso de pago (checkout) en tu tienda o sitio web. Paso crucial antes del cierre.">
                      <span className="text-white font-semibold text-sm">Pagos Iniciados</span>
                    </TooltipHover>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-amber-400 font-bold text-lg">{fmtInt(totalInitiatedCheckouts)}</div>
                    <div className="text-xs text-slate-400">
                      {totalLanding ? fmtPct((totalInitiatedCheckouts / totalLanding) * 100) : "—"} checkout inicial
                    </div>
                  </div>
                </div>
                {totalPurchases > 0 && (
                  <div className="w-full h-2 bg-gradient-to-b from-amber-500/5 to-transparent mx-auto max-w-[40%] -mt-1 rounded-b-lg border-x border-b border-white/5" />
                )}
              </div>
            )}

            {/* Stage 6: Purchases */}
            {totalPurchases > 0 && (
              <div className="relative group z-5 hover:z-50">
                <div className="flex justify-between items-center bg-jet border border-white/5 rounded-xl p-4 relative z-10 hover:border-rose-400/40 transition-colors">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Etapa 6 (Píxel)</span>
                    <TooltipHover tooltipText="El objetivo definitivo: transacciones completadas con éxito y registradas por el píxel de Meta. El ratio se calcula comparando este valor contra los pagos iniciados.">
                      <span className="text-white font-semibold text-sm font-display font-bold">Compras Completadas</span>
                    </TooltipHover>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-rose-400 font-bold text-lg">{fmtInt(totalPurchases)}</div>
                    <div className="text-xs text-slate-400">
                      {totalInitiatedCheckouts ? fmtPct((totalPurchases / totalInitiatedCheckouts) * 100) : "—"} cierre de compra
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
