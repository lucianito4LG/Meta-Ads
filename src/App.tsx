import React, { useState, useEffect } from "react";
import { AdReport, Collection } from "./types";
import { aggregate } from "./utils";
import KpiGrid from "./components/KpiGrid";
import VisualCharts from "./components/VisualCharts";
import AdTable from "./components/AdTable";
import UploadZone from "./components/UploadZone";
import FiestasTab from "./components/FiestasTab";
import { Download, Upload, AlertCircle, RefreshCw, BarChart2, PlusCircle, Award } from "lucide-react";

export default function App() {
  const [ads, setAds] = useState<AdReport[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeTab, setActiveTab] = useState<"resumen" | "cargar" | "fiestas">("resumen");
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<"connected" | "empty" | "deleted">("connected");

  // Show Toast helper
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 2500);
  };

  // Fetch initial data from /api/reports on mount
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error("No se pudo conectar al servidor");
      const data = await res.json();
      
      const loadedAds = data.ads || [];
      const loadedCols = data.collections || [];
      
      setAds(loadedAds);
      setCollections(loadedCols);

      if (loadedAds.length === 0) {
        setDbStatus("empty");
      } else {
        setDbStatus("connected");
      }
    } catch (err) {
      console.error(err);
      setDbStatus("deleted");
      showToast("Sin conexión al archivo reports.json o fue eliminado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save current state back to backend server
  const saveState = async (newAds: AdReport[], newCollections: Collection[]) => {
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ads: newAds, collections: newCollections }),
      });
      if (!res.ok) throw new Error("No se pudieron guardar los cambios");
      
      setAds(newAds);
      setCollections(newCollections);
      setDbStatus(newAds.length === 0 ? "empty" : "connected");
      return true;
    } catch (err) {
      console.error(err);
      showToast("Error de conexión: No se pudo guardar la información en reports.json.");
      return false;
    }
  };

  // Action: Rename individual ad label
  const handleRenameAd = async (id: string, currentLabel: string) => {
    const newName = prompt("Ingresa el nuevo nombre para este anuncio:", currentLabel);
    if (newName === null || !newName.trim()) return;

    const updatedAds = ads.map((ad) => (ad.id === id ? { ...ad, label: newName.trim() } : ad));
    const ok = await saveState(updatedAds, collections);
    if (ok) showToast("Nombre actualizado con éxito");
  };

  // Action: Delete individual ad
  const handleDeleteAd = async (id: string) => {
    if (!confirm("¿Eliminar este anuncio del panel? También se quitará de cualquier fiesta en la que esté asignado.")) return;

    const updatedAds = ads.filter((ad) => ad.id !== id);
    const updatedCols = collections.map((col) => ({
      ...col,
      adIds: col.adIds.filter((x) => x !== id),
    }));

    const ok = await saveState(updatedAds, updatedCols);
    if (ok) showToast("Anuncio eliminado con éxito");
  };

  // Action: Import new reports
  const handleImportAds = async (importedAds: AdReport[]) => {
    const updatedAds = [...ads, ...importedAds];
    const ok = await saveState(updatedAds, collections);
    if (ok) {
      showToast(`${importedAds.length} anuncio(s) cargado(s) y sincronizado(s)`);
      setActiveTab("resumen");
    }
  };

  // Action: Create collection (fiesta)
  const handleCreateCollection = async (name: string, adIds: string[]) => {
    const newCol: Collection = {
      id: "col_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      name,
      adIds,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updatedCols = [...collections, newCol];
    const ok = await saveState(ads, updatedCols);
    if (ok) showToast(`Fiesta "${name}" creada con éxito`);
  };

  // Action: Delete collection (fiesta)
  const handleDeleteCollection = async (id: string) => {
    const updatedCols = collections.filter((c) => c.id !== id);
    const ok = await saveState(ads, updatedCols);
    if (ok) showToast("Fiesta eliminada con éxito");
  };

  // Action: Download manual JSON backup
  const handleDownloadBackup = () => {
    const payload = {
      ads,
      collections,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "imcrew-ads-backup.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Respaldo JSON descargado con éxito");
  };

  // Action: Restore manual JSON backup
  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const payload = JSON.parse(evt.target?.result as string);
        if (!payload.ads) {
          showToast("El archivo JSON no tiene un formato compatible");
          return;
        }

        const replace = confirm(
          "¿Quieres REEMPLAZAR todos los datos cargados actualmente? Pulsa Aceptar para reemplazarlos, o Cancelar para COMBINARLOS."
        );

        let finalAds = [];
        let finalCols = [];

        if (replace) {
          finalAds = payload.ads || [];
          finalCols = payload.collections || [];
        } else {
          const existingIds = new Set(ads.map((a) => a.id));
          const newAds = (payload.ads || []).filter((a: any) => !existingIds.has(a.id));
          finalAds = [...ads, ...newAds];

          const existingColIds = new Set(collections.map((c) => c.id));
          const newCols = (payload.collections || []).filter((c: any) => !existingColIds.has(c.id));
          finalCols = [...collections, ...newCols];
        }

        const ok = await saveState(finalAds, finalCols);
        if (ok) {
          showToast("Respaldo restaurado e importado con éxito");
          setActiveTab("resumen");
        }
      } catch (err) {
        console.error(err);
        showToast("Error leyendo el archivo de respaldo");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Clear file input
  };

  // Aggregated data for all loaded ads
  const globalAgg = aggregate(ads);

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-slate-300 font-sans selection:bg-blue-500/30 relative pb-20">
      {/* Decorative gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="fixed top-0 left-[15%] w-[800px] h-[500px] rounded-full bg-blue-500/10 blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-10 right-0 w-[600px] h-[400px] rounded-full bg-blue-900/5 blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[1180px] mx-auto px-6 relative z-10">
        <header className="py-10 border-b border-white/10 space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" />
            <span className="font-mono text-xs text-blue-400 uppercase tracking-widest">
              Panel de Anuncios · Meta / Instagram
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-tight leading-none bg-gradient-to-r from-white via-blue-400 to-blue-600 bg-clip-text text-transparent pb-1">
                MetaMetrics <span className="text-blue-500 font-normal">Pro</span>
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl mt-3 leading-relaxed">
                Visualiza los informes exportados de Ads Manager en tiempo real. Agrupa anuncios para fechas de
                fiestas y eventos, y mide su rendimiento integrado sin esfuerzo.
              </p>
            </div>

            {/* Tab navigation */}
            <nav className="flex gap-2 bg-[#0f1115] p-1 border border-white/10 rounded-full self-start shrink-0">
              <button
                onClick={() => setActiveTab("resumen")}
                className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "resumen"
                    ? "bg-blue-600 text-white font-bold shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Resumen General
              </button>
              <button
                onClick={() => setActiveTab("cargar")}
                className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "cargar"
                    ? "bg-blue-600 text-white font-bold shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Cargar Informe
              </button>
              <button
                onClick={() => setActiveTab("fiestas")}
                className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "fiestas"
                    ? "bg-blue-600 text-white font-bold shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Fiestas
              </button>
            </nav>
          </div>

          {/* Database Live Sync Bar */}
          <div className="bg-[#0f1115] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${
                dbStatus === "connected" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-mono text-white">
                  {dbStatus === "connected" && (
                    <span>Archivo de base de datos cargado en vivo: <strong className="text-blue-400">reports.json</strong></span>
                  )}
                  {dbStatus === "empty" && (
                    <span>No hay datos en el archivo <strong className="text-red-400">reports.json</strong></span>
                  )}
                  {dbStatus === "deleted" && (
                    <span>El archivo de datos <strong className="text-red-400">reports.json</strong> no está disponible o fue eliminado.</span>
                  )}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {dbStatus === "connected" && "Si borras el archivo reports.json del proyecto, todo el panel quedará en blanco."}
                  {dbStatus === "empty" && "Sube un informe nuevo para autogenerar los datos del panel en reports.json."}
                  {dbStatus === "deleted" && "Carga un informe o arranca en blanco para volver a crear el archivo reports.json."}
                </p>
              </div>
            </div>

            {/* Quick backup / restore actions */}
            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                onClick={handleDownloadBackup}
                className="flex items-center gap-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono py-2 px-3 rounded-lg transition-all cursor-pointer"
                title="Descargar respaldo local en JSON"
              >
                <Download className="w-3.5 h-3.5" /> Descargar .json
              </button>
              <label
                className="flex items-center gap-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono py-2 px-3 rounded-lg transition-all cursor-pointer"
                title="Restaurar datos desde un .json descargado"
              >
                <Upload className="w-3.5 h-3.5" /> Importar .json
                <input
                  type="file"
                  onChange={handleRestoreBackup}
                  accept=".json"
                  className="hidden"
                />
              </label>
              <button
                onClick={fetchData}
                className="p-2 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                title="Sincronizar base de datos"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-500" : ""}`} />
              </button>
            </div>
          </div>
        </header>

        {/* Core content views */}
        <main className="py-8">
          {loading && ads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <p className="font-mono text-xs text-slate-400 uppercase tracking-wider">Cargando base de datos...</p>
            </div>
          ) : (
            <>
              {activeTab === "resumen" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="border-b border-white/10 pb-2">
                    <h2 className="font-display font-semibold text-lg text-white">Vista General — Todos los Anuncios</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Métricas de rendimiento integradas de todo el panel</p>
                  </div>

                  <KpiGrid agg={globalAgg} />

                  {ads.length > 0 && <VisualCharts ads={ads} />}

                  <div className="space-y-4">
                    <h3 className="font-display font-semibold text-base text-white">Listado de todos los anuncios</h3>
                    <AdTable ads={ads} onRename={handleRenameAd} onDelete={handleDeleteAd} />
                  </div>
                </div>
              )}

              {activeTab === "cargar" && (
                <div className="animate-fade-in">
                  <UploadZone onImportComplete={handleImportAds} />
                </div>
              )}

              {activeTab === "fiestas" && (
                <div className="animate-fade-in">
                  <FiestasTab
                    ads={ads}
                    collections={collections}
                    onCreateCollection={handleCreateCollection}
                    onDeleteCollection={handleDeleteCollection}
                    onRenameAd={handleRenameAd}
                    onDeleteAd={handleDeleteAd}
                  />
                </div>
              )}
            </>
          )}
        </main>

        <footer className="mt-20 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-500">
          <span>IMCREW / Muelle Costanera · Base de datos en reports.json</span>
          <span className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-blue-400" />
            Guardado Local & Archivo Físico Sincronizado
          </span>
        </footer>
      </div>

      {/* Floating Toast notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#16191f] border border-blue-500/40 px-6 py-3 rounded-full text-xs font-mono text-white shadow-[0_4px_20px_rgba(59,130,246,0.15)] z-50 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}
