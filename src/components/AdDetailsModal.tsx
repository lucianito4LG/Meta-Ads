import React from "react";
import { AdReport } from "../types";
import { X, Calendar, DollarSign, Users, Eye, MousePointer, Percent, TrendingUp, AlertCircle, ShoppingBag, CreditCard, Layers, Download } from "lucide-react";
import { fmtInt, fmtPct, fmtMoney2, parseDate } from "../utils";
import { generateSingleAdPDF } from "../utils/pdfGenerator";

interface AdDetailsModalProps {
  ad: AdReport;
  onClose: () => void;
}

export default function AdDetailsModal({ ad, onClose }: AdDetailsModalProps) {
  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Clean raw keys to display nicely
  const rawData = ad.raw || {};
  const rawKeys = Object.keys(rawData).filter(k => k !== "raw" && k !== "id");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="bg-jet border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="border-b border-white/10 bg-jet-dark px-6 py-5 flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-orchid/10 text-orchid border border-orchid/20 uppercase tracking-wider">
                Detalle Completo
              </span>
              <span className="text-[11px] font-mono text-slate-500">ID: {ad.id}</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white truncate" title={ad.label || ad.campaign}>
              {ad.label || ad.campaign}
            </h3>
            {ad.label !== ad.campaign && (
              <p className="text-xs text-slate-400 font-mono truncate" title={ad.campaign}>
                Original: <span className="text-slate-300">{ad.campaign}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => {
                const isFiesta = ad.campaign?.toLowerCase().includes("fiesta") || 
                                 ad.label?.toLowerCase().includes("fiesta") || 
                                 ad.source?.toLowerCase().includes("fiesta");
                
                const formattedAd = {
                  ...ad,
                  name: ad.label || ad.campaign,
                  spend: ad.spend || 0,
                  results: ad.results || 0,
                  cpr: ad.costPerResult || 0,
                  clicks: ad.linkClicks || ad.allClicks || 0,
                  ctr: ad.ctrLink || ad.ctrAll || 0,
                  impressions: ad.impressions || 0,
                  cpc: ad.cpcLink || ad.cpcAll || 0,
                  cpm: ad.cpm || 0,
                };
                generateSingleAdPDF(formattedAd, isFiesta);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orchid/30 bg-orchid/10 text-orchid hover:bg-orchid/20 hover:text-white transition-all cursor-pointer text-xs font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Section 1: Key Indicators Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-orchid flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-orchid" /> Métricas Clave del Panel
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase">Inversión</span>
                <p className="text-sm font-mono font-bold text-white">{fmtMoney2(ad.spend)}</p>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase">Alcance</span>
                <p className="text-sm font-mono font-bold text-white">{fmtInt(ad.reach)}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase">Impresiones</span>
                <p className="text-sm font-mono font-bold text-white">{fmtInt(ad.impressions)}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase">Clics Enlace</span>
                <p className="text-sm font-mono font-bold text-white">{fmtInt(ad.linkClicks)}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase">CTR Enlace</span>
                <p className="text-sm font-mono font-bold text-white">{fmtPct(ad.ctrLink)}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase">CPC Enlace</span>
                <p className="text-sm font-mono font-bold text-white">{fmtMoney2(ad.cpcLink)}</p>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] font-mono text-amber-400 uppercase">Pagos Iniciados</span>
                <p className="text-sm font-mono font-bold text-amber-300">{fmtInt(ad.initiatedCheckouts)}</p>
              </div>

              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3.5 space-y-1">
                <span className="text-[9px] font-mono text-rose-400 uppercase">Compras</span>
                <p className="text-sm font-mono font-bold text-rose-300">{fmtInt(ad.purchases)}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Campaign & Delivery Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-orchid flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-orchid" /> Detalles de Entrega y Presupuesto
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono block">Estado de Entrega:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-white/5 border border-white/10 text-white uppercase">
                  {ad.status || "—"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono block">Presupuesto asignado:</span>
                <span className="text-xs text-white font-mono font-semibold">
                  {ad.budget !== null && ad.budget !== undefined ? fmtMoney2(ad.budget) : "—"}
                  {ad.budgetType ? ` (${ad.budgetType})` : ""}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono block">Inicio y Fin del Anuncio:</span>
                <span className="text-xs text-slate-200 font-mono flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {ad.reportStart || "—"} al {ad.reportEnd || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Full Raw Excel Report Data */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-orchid flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-orchid" /> Todos los datos del reporte original
              </h4>
              <span className="text-[10px] font-mono text-slate-500">Mapeado desde el archivo importado</span>
            </div>

            {rawKeys.length > 0 ? (
              <div className="bg-jet-dark border border-white/10 rounded-xl overflow-hidden shadow-inner">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 font-mono text-slate-400 text-[10px] uppercase">
                      <th className="py-2.5 px-4 font-semibold w-1/2 border-r border-white/10">Columna Original</th>
                      <th className="py-2.5 px-4 font-semibold w-1/2">Valor Reportado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {rawKeys.map((key) => {
                      const val = rawData[key];
                      const valStr = val === null || val === undefined ? "—" : String(val);
                      return (
                        <tr key={key} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2 px-4 text-slate-400 font-medium border-r border-white/10 break-all select-all">
                            {key}
                          </td>
                          <td className="py-2 px-4 text-white select-all break-all">
                            {valStr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-xs text-slate-400 font-mono">
                No hay datos originales adicionales guardados en esta fila.
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-jet-dark px-6 py-4 flex justify-between items-center text-[10px] font-mono text-slate-500">
          <span>Importado: {ad.uploadedAt ? new Date(ad.uploadedAt).toLocaleString("es-AR") : "—"}</span>
          <button 
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 text-white font-semibold py-1.5 px-4 rounded-lg border border-white/10 transition-all cursor-pointer"
          >
            Cerrar Detalles
          </button>
        </div>

      </div>
    </div>
  );
}
