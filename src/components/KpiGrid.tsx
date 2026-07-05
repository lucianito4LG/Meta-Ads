import { AggregationResult } from "../types";
import { fmtMoney, fmtInt, fmtPct, fmtMoney2 } from "../utils";
import { DollarSign, Users, Eye, MousePointerClick, BarChart3 } from "lucide-react";

interface KpiGridProps {
  agg: AggregationResult;
}

export default function KpiGrid({ agg }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
  );
}
