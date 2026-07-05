import React, { useState, useEffect } from "react";
import { AdReport, Collection } from "./types";
import { aggregate, parseDate } from "./utils";
import KpiGrid from "./components/KpiGrid";
import VisualCharts from "./components/VisualCharts";
import AdTable from "./components/AdTable";
import UploadZone from "./components/UploadZone";
import FiestasTab from "./components/FiestasTab";
import { Download, Upload, AlertCircle, RefreshCw, BarChart2, PlusCircle, Award, Settings, FileDown, Calendar } from "lucide-react";
import { generatePDF } from "./utils/pdfGenerator";

export default function App() {
  const [ads, setAds] = useState<AdReport[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeTab, setActiveTab] = useState<"resumen" | "cargar" | "fiestas">("resumen");
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<"connected" | "empty" | "deleted">("connected");
  const [showSettings, setShowSettings] = useState(false);
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");

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
      
      // Check if server is empty, but we have a backup in browser's local storage
      const backupAdsRaw = localStorage.getItem("metametrics_ads");
      const backupColsRaw = localStorage.getItem("metametrics_collections");

      if (loadedAds.length === 0 && backupAdsRaw) {
        try {
          const parsedAds = JSON.parse(backupAdsRaw);
          const parsedCols = backupColsRaw ? JSON.parse(backupColsRaw) : [];
          
          if (parsedAds.length > 0) {
            console.log("Restaurando datos automáticamente desde el respaldo del navegador...");
            setAds(parsedAds);
            setCollections(parsedCols);
            setDbStatus("connected");
            
            // Re-write to server's reports.json
            await fetch("/api/reports", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ads: parsedAds, collections: parsedCols }),
            });
            
            showToast("¡Datos recuperados y restaurados automáticamente en el servidor!");
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Error parsing local backup:", e);
        }
      }
      
      setAds(loadedAds);
      setCollections(loadedCols);

      // Keep local backup updated
      if (loadedAds.length > 0) {
        localStorage.setItem("metametrics_ads", JSON.stringify(loadedAds));
        localStorage.setItem("metametrics_collections", JSON.stringify(loadedCols));
      }

      if (loadedAds.length === 0) {
        setDbStatus("empty");
      } else {
        setDbStatus("connected");
      }
    } catch (err) {
      console.error(err);
      
      // Fallback: If server is offline/error, try loading from browser backup
      const backupAdsRaw = localStorage.getItem("metametrics_ads");
      const backupColsRaw = localStorage.getItem("metametrics_collections");
      if (backupAdsRaw) {
        try {
          const parsedAds = JSON.parse(backupAdsRaw);
          const parsedCols = backupColsRaw ? JSON.parse(backupColsRaw) : [];
          setAds(parsedAds);
          setCollections(parsedCols);
          setDbStatus("connected");
          showToast("Servidor sin conexión. Cargando datos locales del navegador.");
          setLoading(false);
          return;
        } catch (e) {}
      }

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
    // Save to local storage first as a secure backup
    try {
      localStorage.setItem("metametrics_ads", JSON.stringify(newAds));
      localStorage.setItem("metametrics_collections", JSON.stringify(newCollections));
    } catch (e) {
      console.error("Error writing local backup:", e);
    }

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
      // Update local React state even if server fails so UI is responsive
      setAds(newAds);
      setCollections(newCollections);
      setDbStatus(newAds.length === 0 ? "empty" : "connected");
      showToast("Guardado en navegador. Error de sincronización con el servidor.");
      return true;
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

  // Filter ads by date
  const filteredAds = React.useMemo(() => {
    let result = ads;
    if (startDateFilter) {
      const startLimit = new Date(startDateFilter);
      startLimit.setHours(0, 0, 0, 0);
      result = result.filter((ad) => {
        const startD = parseDate(ad.reportStart) || parseDate(ad.uploadedAt);
        if (!startD) return true;
        const compareD = new Date(startD);
        compareD.setHours(0, 0, 0, 0);
        return compareD >= startLimit;
      });
    }
    if (endDateFilter) {
      const endLimit = new Date(endDateFilter);
      endLimit.setHours(23, 59, 59, 999);
      result = result.filter((ad) => {
        const endD = parseDate(ad.reportEnd) || parseDate(ad.reportStart) || parseDate(ad.uploadedAt);
        if (!endD) return true;
        const compareD = new Date(endD);
        compareD.setHours(0, 0, 0, 0);
        return compareD <= endLimit;
      });
    }
    return result;
  }, [ads, startDateFilter, endDateFilter]);

  // Aggregated data for all loaded ads
  const globalAgg = React.useMemo(() => aggregate(filteredAds), [filteredAds]);

  return (
    <div className={`min-h-screen bg-ink-black text-slate-300 font-sans selection:bg-dusty-denim/30 relative pb-20 transition-colors duration-500 ${activeTab === "fiestas" ? "theme-fiestas" : "theme-default"}`}>
      {/* Decorative gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.08] bg-[radial-gradient(#748cab_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="fixed top-0 left-[15%] w-[800px] h-[500px] rounded-full bg-dusty-denim/10 blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-10 right-0 w-[600px] h-[400px] rounded-full bg-blue-slate/5 blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[1180px] mx-auto px-6 relative z-10">
        <header className="py-10 border-b border-white/10 space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-eggshell shadow-[0_0_10px_rgba(240,235,216,0.6)] animate-pulse" />
            <span className="font-mono text-xs text-eggshell uppercase tracking-widest">
              Panel de Anuncios · Meta / Instagram
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-tight leading-none bg-gradient-to-r from-white via-eggshell to-dusty-denim bg-clip-text text-transparent pb-1">
                MetaMetrics <span className="text-eggshell font-normal">Pro</span>
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl mt-3 leading-relaxed">
                Visualiza los informes exportados de Ads Manager en tiempo real. Agrupa anuncios para fechas de
                fiestas y eventos, y mide su rendimiento integrado sin esfuerzo.
              </p>
            </div>

            {/* Tab navigation & Settings Toggle */}
            <div className="flex items-center gap-3 self-start shrink-0">
              <nav className="flex gap-2 bg-jet-dark p-1 border border-white/10 rounded-full">
                <button
                  onClick={() => setActiveTab("resumen")}
                  className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "resumen"
                      ? "bg-orchid text-jet font-bold shadow-lg"
                      : "text-slate-400 hover:text-orchid"
                  }`}
                >
                  Resumen General
                </button>
                <button
                  onClick={() => setActiveTab("cargar")}
                  className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "cargar"
                      ? "bg-orchid text-jet font-bold shadow-lg"
                      : "text-slate-400 hover:text-orchid"
                  }`}
                >
                  Cargar Informe
                </button>
                <button
                  onClick={() => setActiveTab("fiestas")}
                  className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "fiestas"
                      ? "bg-orchid text-jet font-bold shadow-lg"
                      : "text-slate-400 hover:text-orchid"
                  }`}
                >
                  Fiestas
                </button>
              </nav>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-3 rounded-full border transition-all cursor-pointer relative group ${
                  showSettings
                    ? "bg-orchid border-orchid text-jet font-bold rotate-45 shadow-md"
                    : "border-white/10 bg-jet-dark text-slate-400 hover:text-white hover:border-white/25"
                }`}
                title="Configuración de Base de Datos y Copias"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Collapsible Database & Backup Settings Panel */}
          {showSettings && (
            <div className="bg-jet-card border-2 border-dashed border-white/10 rounded-2xl p-5 mt-6 animate-fade-in relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    dbStatus === "connected" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-mono text-white font-bold uppercase tracking-wider flex items-center gap-2">
                      Sincronización & Respaldos
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    </h4>
                    <p className="text-[11px] font-mono text-slate-300">
                      {dbStatus === "connected" && (
                        <span>Base de datos: <strong className="text-emerald-400">Firebase Firestore (Nube)</strong></span>
                      )}
                      {dbStatus === "empty" && (
                        <span>Estado: <strong className="text-amber-400">Vacío</strong> (No hay datos en la nube)</span>
                      )}
                      {dbStatus === "deleted" && (
                        <span>Estado: <strong className="text-rose-400">Desconectado</strong></span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed max-w-xl">
                      {dbStatus === "connected" && "Tus datos están sincronizados en tiempo real con Google Cloud. Puedes descargar un archivo .json para resguardar tus datos o importarlo en otro navegador."}
                      {dbStatus === "empty" && "Sube un informe de Meta Ads para activar la base de datos persistente en la nube y guardarlo en todos tus dispositivos."}
                      {dbStatus === "deleted" && "Carga un informe nuevo para configurar y habilitar la sincronización en la nube."}
                    </p>
                  </div>
                </div>

                {/* Backup & Restore Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                  <button
                    onClick={handleDownloadBackup}
                    className="flex items-center gap-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono py-2 px-3.5 rounded-lg transition-all cursor-pointer"
                    title="Descargar respaldo local en JSON"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar .json
                  </button>
                  <label
                    className="flex items-center gap-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono py-2 px-3.5 rounded-lg transition-all cursor-pointer"
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
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orchid" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Core content views */}
        <main className="py-8">
          {loading && ads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-orchid" />
              <p className="font-mono text-xs text-slate-400 uppercase tracking-wider">Cargando base de datos...</p>
            </div>
          ) : (
            <>
              {activeTab === "resumen" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h2 className="font-display font-semibold text-lg text-white">Vista General — Todos los Anuncios</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Métricas de rendimiento integradas de todo el panel</p>
                    </div>
                    {filteredAds.length > 0 && (
                      <button
                        onClick={() => {
                          const dateRangeSuffix = startDateFilter || endDateFilter 
                            ? ` (${startDateFilter ? `desde ${startDateFilter}` : ""} ${endDateFilter ? `hasta ${endDateFilter}` : ""})`
                            : "";
                          generatePDF(`Resumen General de Anuncios${dateRangeSuffix}`, filteredAds, false);
                        }}
                        className="inline-flex items-center gap-1.5 bg-orchid text-jet hover:bg-orchid/80 text-xs font-mono font-bold py-2.5 px-5 rounded-full transition-all cursor-pointer shadow-md self-start sm:self-auto"
                        title="Descargar resumen general de anuncios en PDF"
                      >
                        <FileDown className="w-3.5 h-3.5" /> Descargar Reporte PDF
                      </button>
                    )}
                  </div>

                  {/* Filtro por fecha */}
                  <div className="bg-jet-card border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between shadow-lg">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <div className="flex items-center gap-2 text-slate-400 shrink-0">
                        <Calendar className="w-4 h-4 text-orchid" />
                        <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">Filtrar por Fecha:</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Desde</span>
                          <input
                            type="date"
                            value={startDateFilter}
                            onChange={(e) => setStartDateFilter(e.target.value)}
                            className="bg-jet-dark border border-white/10 rounded-lg text-xs font-mono text-white px-3 py-1.5 focus:border-orchid/50 focus:outline-none transition-all cursor-pointer"
                          />
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Hasta</span>
                          <input
                            type="date"
                            value={endDateFilter}
                            onChange={(e) => setEndDateFilter(e.target.value)}
                            className="bg-jet-dark border border-white/10 rounded-lg text-xs font-mono text-white px-3 py-1.5 focus:border-orchid/50 focus:outline-none transition-all cursor-pointer"
                          />
                        </div>

                        {(startDateFilter || endDateFilter) && (
                          <button
                            onClick={() => {
                              setStartDateFilter("");
                              setEndDateFilter("");
                            }}
                            className="bg-white/5 hover:bg-white/10 hover:text-white text-slate-300 text-xs font-mono py-1.5 px-3 rounded-lg border border-white/10 transition-all self-end cursor-pointer"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs font-mono text-slate-400 shrink-0 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">
                      Mostrando <strong className="text-orchid">{filteredAds.length}</strong> de <strong className="text-slate-300">{ads.length}</strong> anuncios
                    </div>
                  </div>

                  <KpiGrid agg={globalAgg} />

                  {filteredAds.length > 0 ? (
                    <>
                      <VisualCharts ads={filteredAds} />

                      <div className="space-y-4">
                        <h3 className="font-display font-semibold text-base text-white">Listado de todos los anuncios</h3>
                        <AdTable ads={filteredAds} onRename={handleRenameAd} onDelete={handleDeleteAd} />
                      </div>
                    </>
                  ) : (
                    <div className="bg-jet-card border-2 border-dashed border-white/10 rounded-2xl p-12 text-center space-y-4">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <Calendar className="w-6 h-6 text-slate-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-slate-300 font-bold">No se encontraron anuncios</p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                          No hay anuncios cargados que correspondan al rango de fechas seleccionado.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setStartDateFilter("");
                          setEndDateFilter("");
                        }}
                        className="text-xs text-orchid font-mono font-bold hover:text-white underline transition-colors cursor-pointer"
                      >
                        Restablecer filtros
                      </button>
                    </div>
                  )}
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
            <Award className="w-3.5 h-3.5 text-eggshell" />
            Guardado Local & Archivo Físico Sincronizado
          </span>
        </footer>
      </div>

      {/* Floating Toast notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-deep-space border border-eggshell/30 px-6 py-3 rounded-full text-xs font-mono text-white shadow-[0_4px_20px_rgba(240,235,216,0.12)] z-50 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-eggshell" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}
