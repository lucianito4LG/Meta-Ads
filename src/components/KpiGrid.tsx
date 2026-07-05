import { AggregationResult } from "../types";
import { fmtMoney, fmtInt, fmtPct, fmtMoney2 } from "../utils";
import { DollarSign, Users, Eye, MousePointerClick, BarChart3, ShoppingCart, CreditCard, Target } from "lucide-react";

interface KpiGridProps {
  agg: AggregationResult;
}

export default function KpiGrid({ agg }: KpiGridProps) {
  const costPerPurchase = agg.totalPurchases > 0 ? agg.totalSpend / agg.totalPurchases : null;
  const costPerInitiated = agg.totalInitiatedCheckouts > 0 ? agg.totalSpend / agg.totalInitiatedCheckouts : null;
  const costPerView = agg.totalContentViews > 0 ? agg.totalSpend / agg.totalContentViews : null;

  const hasPixelData = agg.totalPurchases > 0 || agg.totalInitiatedCheckouts > 0 || agg.totalContentViews > 0;

  return (
    <div className="space-y-6 mb-8">
      <div>
        <h4 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-wider mb-3">Rendimiento de Anuncios</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* KPI 1 */}
          <div className="bg-[#16191f] border border-white/5 rounded-xl p-5 hover:border-blue-500/30 transition-colors duration-200">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider">Invertido</span>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <div className="font-display font-extrabold text-2xl text-white tracking-tight">
              {fmtMoney(agg.totalSpend)}
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-[#16191f] border border-white/5 rounded-xl p-5 hover:border-blue-500/30 transition-colors duration-200">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider">Alcance</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="font-display font-extrabold text-2xl text-white tracking-tight">
              {fmtInt(agg.totalReach)}
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-[#16191f] border border-white/5 rounded-xl p-5 hover:border-blue-500/30 transition-colors duration-200">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider">Impresiones</span>
              <Eye className="w-4 h-4 text-blue-500" />
            </div>
            <div className="font-display font-extrabold text-2xl text-white tracking-tight">
              {fmtInt(agg.totalImpr)}
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-[#16191f] border border-white/5 rounded-xl p-5 hover:border-blue-500/30 transition-colors duration-200">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider">Clics totales</span>
              <MousePointerClick className="w-4 h-4 text-blue-500" />
            </div>
            <div className="font-display font-extrabold text-2xl text-white tracking-tight">
              {fmtInt(agg.totalAllClicks)}
            </div>
          </div>

          {/* KPI 5 */}
          <div className="bg-[#16191f] border border-white/5 rounded-xl p-5 hover:border-blue-500/30 transition-colors duration-200">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider">CTR / CPC prom.</span>
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="font-display font-extrabold text-2xl text-blue-400 tracking-tight">
              {fmtPct(agg.avgCtrAll)}
            </div>
            <div className="font-mono text-[10px] text-slate-400 mt-1">
              CPC Prom. {fmtMoney2(agg.avgCpcAll)}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-wider">Métricas de Conversión (Píxel)</h4>
          {!hasPixelData && (
            <span className="text-[10px] text-slate-500 font-mono italic">No se detectaron datos de píxel en el informe subido</span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Pixel 1 */}
          <div className="bg-[#16191f] border border-white/5 rounded-xl p-5 hover:border-emerald-500/30 transition-colors duration-200">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider">Vistas de Contenido</span>
              <Target className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="font-display font-extrabold text-2xl text-white tracking-tight">
              {fmtInt(agg.totalContentViews)}
            </div>
            <div className="font-mono text-[10px] text-slate-400 mt-1">
              Costo/Vista: {costPerView !== null ? fmtMoney2(costPerView) : "—"}
            </div>
          </div>

          {/* Pixel 2 */}
          <div className="bg-[#16191f] border border-white/5 rounded-xl p-5 hover:border-amber-500/30 transition-colors duration-200">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider">Pagos Iniciados</span>
              <CreditCard className="w-4 h-4 text-amber-500" />
            </div>
            <div className="font-display font-extrabold text-2xl text-white tracking-tight">
              {fmtInt(agg.totalInitiatedCheckouts)}
            </div>
            <div className="font-mono text-[10px] text-slate-400 mt-1">
              Costo/Pago Inic: {costPerInitiated !== null ? fmtMoney2(costPerInitiated) : "—"}
            </div>
          </div>

          {/* Pixel 3 */}
          <div className="bg-[#16191f] border border-white/5 rounded-xl p-5 hover:border-rose-500/30 transition-colors duration-200">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider">Compras (Conversiones)</span>
              <ShoppingCart className="w-4 h-4 text-rose-500" />
            </div>
            <div className="font-display font-extrabold text-2xl text-white tracking-tight">
              {fmtInt(agg.totalPurchases)}
            </div>
            <div className="font-mono text-[10px] text-slate-400 mt-1">
              Costo/Compra: {costPerPurchase !== null ? fmtMoney2(costPerPurchase) : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
