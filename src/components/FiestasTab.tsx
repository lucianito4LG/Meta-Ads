import React, { useState } from "react";
import { AdReport, Collection } from "../types";
import { aggregate } from "../utils";
import KpiGrid from "./KpiGrid";
import VisualCharts from "./VisualCharts";
import AdTable from "./AdTable";
import { PlusCircle, Users, Calendar, Trash2, ArrowLeft, Check, Sparkles, FileDown } from "lucide-react";
import { generatePDF } from "../utils/pdfGenerator";

interface FiestasTabProps {
  ads: AdReport[];
  collections: Collection[];
  onCreateCollection: (name: string, adIds: string[]) => void;
  onDeleteCollection: (id: string) => void;
  onRenameAd: (id: string, currentLabel: string) => void;
  onDeleteAd: (id: string) => void;
}

export default function FiestasTab({
  ads,
  collections,
  onCreateCollection,
  onDeleteCollection,
  onRenameAd,
  onDeleteAd,
}: FiestasTabProps) {
  const [selectedColId, setSelectedColId] = useState<string | null>(null);
  const [newColName, setNewColName] = useState("");
  const [selectedAdIds, setSelectedAdIds] = useState<string[]>([]);

  const handleToggleAdSelection = (id: string) => {
    setSelectedAdIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    if (selectedAdIds.length === 0) return;

    onCreateCollection(newColName.trim(), selectedAdIds);
    setNewColName("");
    setSelectedAdIds([]);
  };

  const selectedCol = collections.find((c) => c.id === selectedColId);
  const colAds = selectedCol ? ads.filter((a) => selectedCol.adIds.includes(a.id)) : [];
  const colAgg = selectedCol ? aggregate(colAds) : null;

  if (selectedCol && colAgg) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Navigation back and deletion bar */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#1d2d44] via-[#1d2d44]/80 to-transparent border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-2xl">
          {/* Decorative shapes inside the banner */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-dusty-denim/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-slate/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 bg-dusty-denim/20 border border-dusty-denim/30 text-eggshell rounded-full px-3 py-1 text-[10px] font-mono tracking-widest uppercase">
              <Sparkles className="w-3 h-3 text-eggshell animate-pulse" /> Vista de Fiesta / Grupo
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight leading-none">
              🎉 {selectedCol.name}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Grupo creado el {selectedCol.createdAt} · {colAds.length} {colAds.length === 1 ? "anuncio asignado" : "anuncios asignados"}
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedColId(null)}
              className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-xs font-mono text-slate-300 hover:text-white hover:bg-white/10 py-2.5 px-5 rounded-full transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver a Grupos
            </button>
            <button
              onClick={() => generatePDF(`Reporte de Fiesta: ${selectedCol.name}`, colAds, true)}
              className="inline-flex items-center gap-1.5 bg-[#d7ceb2] text-[#4c5760] hover:bg-[#d7ceb2]/80 text-xs font-mono font-black py-2.5 px-5 rounded-full transition-all cursor-pointer shadow-md"
              title="Descargar reporte de esta fiesta en PDF"
            >
              <FileDown className="w-3.5 h-3.5" /> Descargar PDF
            </button>
            <button
              onClick={() => {
                if (confirm("¿Estás seguro de que quieres eliminar esta fiesta? No se borrarán los anuncios.")) {
                  onDeleteCollection(selectedCol.id);
                  setSelectedColId(null);
                }
              }}
              className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-xs font-mono py-2.5 px-5 rounded-full transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar Fiesta
            </button>
          </div>
        </div>

        {/* Unified Fiesta Workspace Wrapper */}
        <div className="relative border-2 border-dashed border-blue-slate/20 bg-[#1d2d44]/10 rounded-2xl p-6 sm:p-8 space-y-8 shadow-inner">
          <div className="absolute top-4 right-6 hidden md:block select-none">
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 bg-ink-black/40 border border-white/5 px-2.5 py-1 rounded-md">
              Filtro Activo: {selectedCol.name}
            </span>
          </div>

          {/* Aggregate KPI Grid in Fiesta variant */}
          <KpiGrid agg={colAgg} variant="fiesta" />

          {/* Visual Charts in Fiesta variant */}
          {colAds.length > 0 ? (
            <div className="space-y-8">
              <VisualCharts ads={colAds} variant="fiesta" />
              
              <div className="bg-[#1d2d44]/30 border border-white/10 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
                  <h4 className="font-display font-semibold text-base text-white">
                    Anuncios agrupados
                  </h4>
                  <span className="text-[10px] font-mono text-dusty-denim bg-dusty-denim/10 border border-dusty-denim/20 rounded-full px-2 py-0.5 font-bold">
                    {colAds.length} {colAds.length === 1 ? "anuncio" : "anuncios"}
                  </span>
                </div>
                <AdTable ads={colAds} onRename={onRenameAd} onDelete={onDeleteAd} />
              </div>
            </div>
          ) : (
            <div className="bg-[#1d2d44]/40 border border-white/10 rounded-xl p-8 text-center text-slate-500 font-mono">
              No quedan anuncios válidos en este grupo. Todos fueron eliminados del panel.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Creation form */}
      <div className="bg-jet-card border border-white/5 rounded-xl p-6">
        <h3 className="font-display font-semibold text-lg text-white border-b border-white/10 pb-3 mb-4">
          Crear una Fiesta / Grupo de Anuncios
        </h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-500 tracking-wider block">
              Nombre de la Fiesta o Evento
            </label>
            <input
              type="text"
              placeholder="Ej: Lanzamiento 27 de Junio"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              className="w-full sm:max-w-md bg-jet border border-white/10 focus:border-orchid focus:outline-none rounded-xl px-4 py-3 text-sm text-white font-sans"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-500 tracking-wider block">
              Selecciona los anuncios a agrupar ({selectedAdIds.length} seleccionados)
            </label>
            {ads.length > 0 ? (
              <div className="border border-white/10 rounded-xl max-h-56 overflow-y-auto divide-y divide-white/5 bg-jet">
                {ads.map((ad) => {
                  const isChecked = selectedAdIds.includes(ad.id);
                  return (
                    <div
                      key={ad.id}
                      onClick={() => handleToggleAdSelection(ad.id)}
                      className="flex items-center gap-3 p-3 hover:bg-orchid/[0.02] cursor-pointer transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isChecked
                          ? "bg-orchid border-orchid"
                          : "border-slate-600"
                      }`}>
                        {isChecked && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">{ad.label || ad.campaign}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {ad.spend !== null ? `$${Math.round(ad.spend).toLocaleString("es-AR")}` : "—"} ·{" "}
                          {ad.impressions !== null ? `${Math.round(ad.impressions).toLocaleString("es-AR")}` : "—"} impr.
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-white/10 border-dashed rounded-xl p-6 text-center text-xs text-slate-500 font-mono">
                Carga anuncios en la pestaña "Cargar Informe" para poder agruparlos.
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!newColName.trim() || selectedAdIds.length === 0}
            className="w-full sm:w-auto bg-orchid text-jet font-display font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-full hover:bg-orchid/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
          >
            Crear Fiesta
          </button>
        </form>
      </div>

      {/* Grid of parties */}
      <div className="space-y-4">
        <h3 className="font-display font-semibold text-lg text-white">Tus Fiestas</h3>
        {collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((col) => {
              const activeColAds = ads.filter((a) => col.adIds.includes(a.id));
              const agg = aggregate(activeColAds);

              return (
                <div
                  key={col.id}
                  onClick={() => setSelectedColId(col.id)}
                  className="bg-jet-card border border-white/5 hover:border-orchid/40 rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 shadow-md flex flex-col justify-between group animate-fade-in"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="font-display font-bold text-base text-white group-hover:text-orchid transition-colors truncate">
                        {col.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 bg-jet border border-white/10 rounded-full px-2 py-0.5 shrink-0">
                        {activeColAds.length} {activeColAds.length === 1 ? "anuncio" : "anuncios"}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-slate-400 space-y-1 mt-4">
                      <div className="flex justify-between">
                        <span>Gasto total:</span>
                        <span className="font-bold text-white">{agg.totalSpend ? `$${Math.round(agg.totalSpend).toLocaleString("es-AR")}` : "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Clics:</span>
                        <span className="text-orchid">{agg.totalAllClicks ? Math.round(agg.totalAllClicks).toLocaleString("es-AR") : "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 mt-4 pt-3 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {col.createdAt}
                    </span>
                    <span className="text-orchid group-hover:underline">Ver detalles →</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-white/10 border-dashed rounded-xl py-12 text-center text-sm text-slate-500 font-mono">
            Aún no has creado ninguna fiesta. ¡Escribe un nombre arriba, selecciona algunos anuncios, y crea tu primer grupo!
          </div>
        )}
      </div>
    </div>
  );
}
