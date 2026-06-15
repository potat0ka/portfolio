import { useEffect, useCallback, useState } from "react";
import { X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { ApiCertification } from "../hooks/usePortfolioApi";

interface CertificateLightboxProps {
  cert: ApiCertification;
  onClose: () => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

export function CertificateLightbox({ cert, onClose }: CertificateLightboxProps) {
  const [zoom, setZoom] = useState(1);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
      if (e.key === "-") setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
      if (e.key === "0") setZoom(1);
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const pdfUrl = cert.certificate_pdf;
  const thumbUrl = cert.thumbnail_image;
  const downloadName = `${cert.title.replace(/[^\w\s-]/g, "").trim() || "certificate"}.pdf`;

  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)));
  const resetZoom = () => setZoom(1);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center cert-lightbox-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Certificate viewer: ${cert.title}`}
    >
      <div className="relative flex flex-col w-full max-w-5xl h-[90vh] mx-4 bg-[#111215] border border-[#c3a152]/30 rounded-sm overflow-hidden shadow-[0_0_60px_rgba(195,161,82,0.15)] animate-fade-in">
        {/* Header bar */}
        <div className="flex-none flex items-center justify-between bg-[#0d0f12] border-b border-white/10 px-5 py-3 gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold truncate">
              {cert.issuer}
            </p>
            <h2 className="text-sm font-black text-[#c3a152] uppercase tracking-wide truncate">
              {cert.title}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-none flex-wrap justify-end">
            <span className="text-[10px] font-mono text-gray-500 hidden sm:block">{cert.issue_date}</span>

            {/* Zoom controls */}
            <div className="flex items-center border border-white/10 rounded-sm overflow-hidden">
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoom <= MIN_ZOOM}
                className="flex items-center justify-center w-8 h-8 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Zoom out"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[10px] font-mono text-gray-400 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoom >= MAX_ZOOM}
                className="flex items-center justify-center w-8 h-8 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Zoom in"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="flex items-center justify-center w-8 h-8 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-l border-white/10 transition-colors"
                aria-label="Reset zoom"
                title="Reset zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-sm text-[11px] font-mono font-bold transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:block">OPEN</span>
            </a>

            <a
              href={pdfUrl}
              download={downloadName}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#48823a]/80 hover:bg-[#5ca14c] text-white border border-[#48823a] rounded-sm text-[11px] font-mono font-bold transition-colors"
              title="Download certificate"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:block">DOWNLOAD</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 bg-red-900/30 hover:bg-red-700/60 text-red-400 hover:text-white border border-red-800/40 rounded-sm transition-colors"
              aria-label="Close certificate viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row gap-0 overflow-hidden min-h-0">
          {thumbUrl && (
            <div className="md:w-56 flex-none flex flex-col bg-[#0d0f12] border-b md:border-b-0 md:border-r border-white/5 overflow-y-auto">
              <div className="p-3 flex-none">
                <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1.5">
                  Preview Image
                </p>
                <div className="overflow-auto max-h-48 rounded-sm border border-white/10 bg-[#0a0b0d]">
                  <img
                    src={thumbUrl}
                    alt={`${cert.title} preview`}
                    className="w-full object-contain transition-transform duration-200 origin-top-left"
                    style={{ transform: `scale(${zoom})` }}
                  />
                </div>
              </div>
              <div className="px-3 pb-3 space-y-2 flex-none">
                <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Description</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{cert.description}</p>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 relative min-h-0 overflow-auto bg-[#0a0b0d] cert-pdf-scroll">
              <div
                className="w-full min-h-full origin-top-left transition-transform duration-200"
                style={{
                  transform: `scale(${zoom})`,
                  width: `${100 / zoom}%`,
                  height: `${100 / zoom}%`,
                }}
              >
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full min-h-[60vh] border-0"
                  title={`${cert.title} PDF viewer`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-none flex items-center justify-between bg-[#0d0f12] border-t border-white/5 px-5 py-2 text-[10px] font-mono text-gray-600">
          <span>CERT VIEWER · SECURE ORIGIN</span>
          <span className="text-[#48823a]">● SUPABASE STORAGE ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
