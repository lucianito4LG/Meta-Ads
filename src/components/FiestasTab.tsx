import React, { useState } from "react";
import { AdReport, Collection } from "../types";
import { aggregate } from "../utils";
import KpiGrid from "./KpiGrid";
import VisualCharts from "./VisualCharts";
import AdTable from "./AdTable";
import { PlusCircle, Users, Calendar, Trash2, ArrowLeft, Check, Sparkles } from "lucide-react";

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
      <div className="space-y-6">
        <button
          onClick={() => setSelectedColId(null)}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Fiestas / Grupos
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="font-mono text-xs text-blue-400 uppercase tracking-wider block">Estadísticas del Grupo</span>
            <h3 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              🎉 {selectedCol.name}
            </h3>
          </div>
          <button
            onClick={() => {
              if (confirm("¿Estás seguro de que quieres eliminar esta fiesta? No se borrarán los anuncios.")) {
                onDeleteCollection(selectedCol.id);
                setSelectedColId(null);
              }
            }}
            className="flex items-center gap-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-mono py-2 px-4 rounded-full transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Eliminar Fiesta
          </button>
        </div>

        {/* Aggregate KPI Grid */}
        <KpiGrid agg={colAgg} />

        {/* Visual Charts */}
        {colAds.length > 0 ? (
          <>
            <VisualCharts ads={colAds} />
            <div>
              <h4 className="font-display font-semibold text-base text-white mb-3">Anuncios en esta Fiesta</h4>
              <AdTable ads={colAds} onRename={onRenameAd} onDelete={onDeleteAd} />
            </div>
          </>
        ) : (
          <div className="bg-[#16191f] border border-white/5 rounded-xl p-8 text-center text-slate-500 font-mono">
            No quedan anuncios válidos en este grupo. Todos fueron eliminados del panel.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Creation form */}
      <div className="bg-[#16191f] border border-white/5 rounded-xl p-6">
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
              className="w-full sm:max-w-md bg-[#0a0b0d] border border-white/10 focus:border-blue-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white font-sans"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-500 tracking-wider block">
              Selecciona los anuncios a agrupar ({selectedAdIds.length} seleccionados)
            </label>
            {ads.length > 0 ? (
              <div className="border border-white/10 rounded-xl max-h-56 overflow-y-auto divide-y divide-white/5 bg-[#0a0b0d]">
                {ads.map((ad) => {
                  const isChecked = selectedAdIds.includes(ad.id);
                  return (
                    <div
                      key={ad.id}
                      onClick={() => handleToggleAdSelection(ad.id)}
                      className="flex items-center gap-3 p-3 hover:bg-blue-500/[0.02] cursor-pointer transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isChecked
                          ? "bg-blue-600 border-blue-500"
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
            className="w-full sm:w-auto bg-blue-600 text-white font-display font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
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
                  className="bg-[#16191f] border border-white/5 hover:border-blue-500/30 rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 shadow-md flex flex-col justify-between group animate-fade-in"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="font-display font-bold text-base text-white group-hover:text-blue-400 transition-colors truncate">
                        {col.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 bg-[#0a0b0d] border border-white/10 rounded-full px-2 py-0.5 shrink-0">
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
                        <span className="text-blue-400">{agg.totalAllClicks ? Math.round(agg.totalAllClicks).toLocaleString("es-AR") : "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 mt-4 pt-3 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {col.createdAt}
                    </span>
                    <span className="text-blue-400 group-hover:underline">Ver detalles →</span>
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
