import { AdReport } from "../types";
import { fmtInt, fmtPct, fmtMoney2 } from "../utils";
import { Edit2, Trash2 } from "lucide-react";

interface AdTableProps {
  ads: AdReport[];
  onRename: (id: string, currentLabel: string) => void;
  onDelete: (id: string) => void;
}

interface TooltipHeaderProps {
  title: string;
  tooltipText: string;
  align?: "left" | "right" | "center";
}

function TooltipHeader({ title, tooltipText, align = "center" }: TooltipHeaderProps) {
  const justifyClass = align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";
  
  return (
    <div className={`flex items-center ${justifyClass}`}>
      <div className="relative group/tooltip inline-flex items-center gap-1 cursor-help py-1">
        <span className="border-b border-dotted border-slate-600 hover:border-slate-300 transition-colors">
          {title}
        </span>
        <span className="text-[10px] text-slate-500 hover:text-slate-400 select-none">
          ⓘ
        </span>
        <div className={`absolute top-full mt-2 hidden group-hover/tooltip:block bg-[#0a0b0d] border border-white/10 text-slate-200 rounded-lg p-3 text-[11px] w-64 z-50 normal-case whitespace-normal tracking-normal shadow-2xl text-left font-sans ${
          align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2"
        }`}>
          <div className="font-semibold text-white mb-1">{title}</div>
          <p className="text-slate-400 leading-relaxed font-normal">{tooltipText}</p>
          <div className={`absolute bottom-full border-4 border-transparent border-b-[#0a0b0d] ${
            align === "left" ? "left-4" : align === "right" ? "right-4" : "left-1/2 -translate-x-1/2"
          }`} />
        </div>
      </div>
    </div>
  );
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
              <th className="py-4 px-4 font-semibold">
                <TooltipHeader
                  title="Anuncio / Campaña"
                  tooltipText="Nombre del anuncio o campaña correspondiente a esta fila en tus informes."
                  align="left"
                />
              </th>
              <th className="py-4 px-4 font-semibold text-center">
                <TooltipHeader
                  title="Estado"
                  tooltipText="Estado de entrega de la campaña o conjunto de anuncios en Meta Ads (Activo, Pausado, etc.)."
                  align="center"
                />
              </th>
              <th className="py-4 px-4 font-semibold text-right">
                <TooltipHeader
                  title="Alcance"
                  tooltipText="El número de personas únicas que vieron tus anuncios al menos una vez."
                  align="right"
                />
              </th>
              <th className="py-4 px-4 font-semibold text-right">
                <TooltipHeader
                  title="Impr."
                  tooltipText="El número de veces que tus anuncios aparecieron en pantalla. Un usuario puede ver el anuncio múltiples veces."
                  align="right"
                />
              </th>
              <th className="py-4 px-4 font-semibold text-right">
                <TooltipHeader
                  title="Clics enlace"
                  tooltipText="Cantidad de clics en enlaces del anuncio que redirigen a los usuarios al destino seleccionado (ej. landing page o sitio web)."
                  align="right"
                />
              </th>
              <th className="py-4 px-4 font-semibold text-right">
                <TooltipHeader
                  title="CTR enlace"
                  tooltipText="Porcentaje de veces que las personas vieron tu anuncio e hicieron clic en el enlace. (Clics / Impresiones) * 100."
                  align="right"
                />
              </th>
              <th className="py-4 px-4 font-semibold text-right">
                <TooltipHeader
                  title="CPC enlace"
                  tooltipText="Costo promedio por cada clic en el enlace. Se calcula dividiendo el importe gastado entre los clics."
                  align="right"
                />
              </th>
              <th className="py-4 px-4 font-semibold text-right">
                <TooltipHeader
                  title="Gastado"
                  tooltipText="Importe total estimado que has invertido en el anuncio o campaña durante el período reportado."
                  align="right"
                />
              </th>
              <th className="py-4 px-4 font-semibold text-right">
                <TooltipHeader
                  title="CPM"
                  tooltipText="Costo promedio que pagas por cada 1,000 impresiones del anuncio. (Gastado / Impresiones) * 1000."
                  align="right"
                />
              </th>
              <th className="py-4 px-4 font-semibold text-right">
                <TooltipHeader
                  title="Landing"
                  tooltipText="Número de veces que una persona hizo clic en el anuncio y cargó con éxito la página de destino seleccionada."
                  align="right"
                />
              </th>
              <th className="py-4 px-4 font-semibold text-right text-amber-400">
                <TooltipHeader
                  title="Pagos Inic."
                  tooltipText="Número de veces que se inició el proceso de pago en tu sitio web gracias al anuncio (evento del píxel de Meta)."
                  align="right"
                />
              </th>
              <th className="py-4 px-4 font-semibold text-right text-rose-400">
                <TooltipHeader
                  title="Compras"
                  tooltipText="Número de eventos de compra completados en tu sitio web como resultado de tus anuncios (evento de conversión del píxel)."
                  align="right"
                />
              </th>
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
                  <td className="py-3.5 px-4 text-right font-mono text-amber-400">
                    {ad.initiatedCheckouts !== null && ad.initiatedCheckouts !== undefined ? fmtInt(ad.initiatedCheckouts) : "—"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-rose-400">
                    {ad.purchases !== null && ad.purchases !== undefined ? fmtInt(ad.purchases) : "—"}
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
                <td colSpan={13} className="py-12 text-center text-slate-500 font-mono text-sm">
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
