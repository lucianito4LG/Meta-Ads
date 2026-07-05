import React, { useState, useRef } from "react";
import { AdReport } from "../types";
import { parseWorkbook } from "../utils";
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet, X } from "lucide-react";

interface UploadZoneProps {
  onImportComplete: (importedAds: AdReport[]) => void;
}

export default function UploadZone({ onImportComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingAds, setPendingAds] = useState<AdReport[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragover") {
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseWorkbook(buffer, file.name);

      if (!parsed.length) {
        setErrorMessage("No se encontraron filas con datos válidos en este archivo.");
        return;
      }

      setPendingAds(parsed);
    } catch (err) {
      console.error(err);
      setErrorMessage("No pudimos leer el archivo. Asegúrate de subir un .xlsx, .xls o .csv válido exportado de Meta Ads Manager.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleLabelChange = (index: number, newLabel: string) => {
    const updated = [...pendingAds];
    updated[index].label = newLabel;
    setPendingAds(updated);
  };

  const handleSave = () => {
    onImportComplete(pendingAds);
    setPendingAds([]);
    setErrorMessage(null);
  };

  const handleCancel = () => {
    setPendingAds([]);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h3 className="font-display font-semibold text-lg text-white">Cargar informe de Meta Ads</h3>
        <p className="text-xs text-slate-400 mt-1">Sube el archivo Excel o CSV exportado directamente de Ads Manager</p>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-xs text-red-400 font-mono">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Drag & Drop Area */}
      {pendingAds.length === 0 && (
        <div
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-orchid bg-orchid/5"
              : "border-white/10 bg-jet-card hover:border-orchid/40 hover:bg-orchid/[0.02]"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleSelectFile}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-jet border border-white/10 rounded-full text-orchid">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="font-display font-semibold text-white">Arrastra o haz clic para subir</p>
              <p className="text-xs text-slate-400 mt-1">Recomendado archivo .xlsx · También acepta .csv</p>
            </div>
          </div>
        </div>
      )}

      {/* Mapped Rows Preview */}
      {pendingAds.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-orchid">
              <CheckCircle2 className="w-4 h-4" />
              Se detectaron {pendingAds.length} anuncios en el archivo
            </span>
            <button
              onClick={handleCancel}
              className="text-slate-500 hover:text-red-400 flex items-center gap-1 text-xs font-mono transition-colors"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>

          <div className="bg-jet-card border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-jet font-mono text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-semibold">Etiqueta para el Panel (editable)</th>
                    <th className="py-3 px-4 font-semibold">Campaña / Anuncio Original</th>
                    <th className="py-3 px-4 font-semibold text-right">Gasto</th>
                    <th className="py-3 px-4 font-semibold text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pendingAds.map((ad, idx) => (
                    <tr key={ad.id} className="hover:bg-orchid/[0.02]">
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={ad.label}
                          onChange={(e) => handleLabelChange(idx, e.target.value)}
                          className="w-full bg-jet border border-white/10 focus:border-orchid focus:outline-none rounded-lg px-3 py-1.5 text-xs text-white font-sans font-medium"
                        />
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-400 truncate max-w-[200px]" title={ad.campaign}>
                        {ad.campaign}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-white">
                        {ad.spend !== null ? `$${ad.spend.toLocaleString("es-AR")}` : "—"}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-jet border border-white/10 text-slate-400">
                          {ad.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="bg-orchid text-jet font-display font-black text-xs uppercase tracking-wider px-6 py-3 rounded-full hover:bg-orchid/90 cursor-pointer transition-all shadow-md"
            >
              Guardar Anuncios en el Panel
            </button>
            <button
              onClick={handleCancel}
              className="border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-orchid/40 font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-colors cursor-pointer"
            >
              Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
