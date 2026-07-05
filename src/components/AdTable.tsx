import { AdReport } from "../types";
import { fmtInt, fmtPct, fmtMoney2 } from "../utils";
import { Edit2, Trash2 } from "lucide-react";

interface AdTableProps {
  ads: AdReport[];
  onRename: (id: string, currentLabel: string) => void;
  onDelete: (id: string) => void;
}

export default function AdTable({ ads, onRename, onDelete }: AdTableProps) {
  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("complet") || s.includes("activ")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-green-500/10 text-green-400 border border-green-500/20">
          Activo
        </span>
      );
    }
    if (s.includes("inactiv") || s.includes("pausad") || s.includes("suspend") || s.includes("off")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Pausado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
        {status || "—"}
      </span>
    );
  };

  return (
    <div className="bg-[#16191f] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-[#0a0b0d] font-mono text-slate-500 uppercase tracking-wider text-[10px]">
              <th className="py-4 px-4 font-semibold">Anuncio / Campaña</th>
              <th className="py-4 px-4 font-semibold text-center">Estado</th>
              <th className="py-4 px-4 font-semibold text-right">Alcance</th>
              <th className="py-4 px-4 font-semibold text-right">Impr.</th>
              <th className="py-4 px-4 font-semibold text-right">Clics enlace</th>
              <th className="py-4 px-4 font-semibold text-right">CTR enlace</th>
              <th className="py-4 px-4 font-semibold text-right">CPC enlace</th>
              <th className="py-4 px-4 font-semibold text-right">Gastado</th>
              <th className="py-4 px-4 font-semibold text-right">CPM</th>
              <th className="py-4 px-4 font-semibold text-right">Landing</th>
              <th className="py-4 px-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {ads.length > 0 ? (
              ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-blue-500/[0.02] transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 max-w-[240px] sm:max-w-xs">
                      <span className="font-semibold text-white truncate" title={ad.label || ad.campaign}>
                        {ad.label || ad.campaign}
                      </span>
                    </div>
                    {ad.campaign !== ad.label && (
                      <span className="block text-[10px] text-slate-500 font-mono truncate max-w-[240px]" title={ad.campaign}>
                        {ad.campaign}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">{getStatusBadge(ad.status)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">{fmtInt(ad.reach)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">{fmtInt(ad.impressions)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">{fmtInt(ad.linkClicks)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">{fmtPct(ad.ctrLink)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">{fmtMoney2(ad.cpcLink)}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-white">{fmtMoney2(ad.spend)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">{fmtMoney2(ad.cpm)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                    {ad.landingViews !== null ? fmtInt(ad.landingViews) : "—"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onRename(ad.id, ad.label || ad.campaign)}
                        className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 transition-all cursor-pointer"
                        title="Renombrar etiqueta"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(ad.id)}
                        className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-all cursor-pointer"
                        title="Eliminar del panel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-500 font-mono text-sm">
                  No hay anuncios cargados. Cargá un reporte desde la pestaña "Cargar Informe" o restaurá un respaldo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
