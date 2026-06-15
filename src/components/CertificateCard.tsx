import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { Award, FileText, ShieldCheck, ExternalLink } from "lucide-react";
import type { ApiCertification } from "../hooks/usePortfolioApi";

const HOVER_FLIP_MS = 5000;

interface CertificateCardProps {
  key?: number | string;
  cert: ApiCertification;
  onViewCertificate: (cert: ApiCertification) => void;
}

function usePrefersHoverFlip() {
  const [prefersHoverFlip, setPrefersHoverFlip] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setPrefersHoverFlip(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return prefersHoverFlip;
}

export function CertificateCard({ cert, onViewCertificate }: CertificateCardProps) {
  const prefersHoverFlip = usePrefersHoverFlip();
  const [isFlipped, setIsFlipped] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressFrameRef = useRef<number | null>(null);
  const hoverStartRef = useRef<number | null>(null);
  // manuallyFlipped = user clicked the card body to flip it; don't unflip on mouseLeave
  const manuallyFlippedRef = useRef(false);

  const isVerified = Boolean(cert.certificate_pdf);

  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (progressFrameRef.current !== null) {
      cancelAnimationFrame(progressFrameRef.current);
      progressFrameRef.current = null;
    }
    hoverStartRef.current = null;
    setHoverProgress(0);
  }, []);

  const tickHoverProgress = useCallback(() => {
    if (hoverStartRef.current === null) return;
    const elapsed = Date.now() - hoverStartRef.current;
    setHoverProgress(Math.min(elapsed / HOVER_FLIP_MS, 1));
    if (elapsed < HOVER_FLIP_MS) {
      progressFrameRef.current = requestAnimationFrame(tickHoverProgress);
    }
  }, []);

  const handleMouseEnter = () => {
    if (!prefersHoverFlip || manuallyFlippedRef.current) return;
    clearHoverTimer();
    hoverStartRef.current = Date.now();
    progressFrameRef.current = requestAnimationFrame(tickHoverProgress);
    hoverTimerRef.current = setTimeout(() => {
      setIsFlipped(true);
      setHoverProgress(1);
    }, HOVER_FLIP_MS);
  };

  const handleMouseLeave = () => {
    if (!prefersHoverFlip) return;
    // Don't unflip if user manually clicked the card to flip it
    if (manuallyFlippedRef.current) return;
    clearHoverTimer();
    setIsFlipped(false);
  };

  const handleCardClick = (e: MouseEvent) => {
    // If the view button was clicked, don't toggle the flip
    if ((e.target as HTMLElement).closest("[data-cert-view-btn]")) return;
    manuallyFlippedRef.current = !isFlipped;
    setIsFlipped((prev) => !prev);
  };

  const handleViewClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewCertificate(cert);
  };

  useEffect(() => () => clearHoverTimer(), [clearHoverTimer]);

  return (
    <div
      className="cert-card-scene perspective-1000 h-[340px] sm:h-[360px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      <div
        className={`cert-card-inner relative w-full h-full preserve-3d transition-transform duration-700 ease-[cubic-bezier(0.4,0.2,0.2,1)] ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* FRONT — Aura rune card */}
        <div
          className={`cert-card-face absolute inset-0 backface-hidden rounded-sm border border-[#c3a152]/25 bg-[#1c1e22]/80 dota-panel-glow cert-aura-shell overflow-hidden flex flex-col ${
            isFlipped ? "pointer-events-none z-0" : "pointer-events-auto z-10"
          }`}
        >
          <div className="cert-aura-pulse pointer-events-none" aria-hidden="true" />
          <div className="cert-aura-ring pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 flex flex-col h-full p-5">
            <div className="flex items-start justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="cert-aura-dot w-2 h-2 rounded-full bg-[#c3a152]" />
                <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                  Passive Aura
                </span>
              </div>
              <Award className="w-4 h-4 text-[#c3a152]/60" />
            </div>

            <div className="flex-1 space-y-2">
              <p className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wide">
                {cert.issuer}
              </p>
              <h3 className="text-base sm:text-lg font-extrabold text-[#c3a152] uppercase tracking-wide leading-snug line-clamp-2">
                {cert.title}
              </h3>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-end justify-between">
              <div>
                <span className="text-[8px] font-mono text-gray-500 uppercase block font-bold">
                  Issue Date
                </span>
                <span className="text-xs font-black text-white uppercase mt-0.5 block">
                  {cert.issue_date}
                </span>
              </div>
              <span className="text-[9px] font-mono text-gray-500 uppercase hidden sm:block">
                Click to flip
              </span>
            </div>
          </div>

          {prefersHoverFlip && hoverProgress > 0 && !isFlipped && (
            <div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#48823a] via-[#c3a152] to-[#48823a] transition-none z-20"
              style={{ width: `${hoverProgress * 100}%` }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* BACK — Details & action */}
        <div
          className={`cert-card-face absolute inset-0 backface-hidden rotate-y-180 rounded-sm border border-[#48823a]/35 bg-[#16171a]/95 dota-panel-glow overflow-hidden flex flex-col ${
            isFlipped ? "pointer-events-auto z-10" : "pointer-events-none z-0"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 pt-4 pb-2.5 flex-shrink-0">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-bold">
              Aura Details
            </span>
            <div
              className={`flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm border ${
                isVerified
                  ? "text-[#48823a] bg-[#48823a]/10 border-[#48823a]/30"
                  : "text-amber-400 bg-amber-500/10 border-amber-500/30"
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              {isVerified ? "Verified" : "Pending"}
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 min-h-0">
            {cert.thumbnail_image && (
              <div className="h-[110px] w-full overflow-hidden rounded-sm border border-white/10">
                <img src={cert.thumbnail_image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <p className="text-xs text-gray-400 leading-relaxed">
              {cert.description}
            </p>
          </div>

          {/* Sticky View Certificate button at the bottom */}
          {isVerified && (
            <div className="flex-shrink-0 px-5 pb-5 pt-3 border-t border-white/10">
              <button
                type="button"
                data-cert-view-btn
                onMouseDown={(e) => e.stopPropagation()}
                onClick={handleViewClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#48823a] to-[#3a6b2e] hover:from-[#5ca14c] hover:to-[#48823a] border border-[#48823a]/60 text-white text-[11px] font-mono font-black uppercase tracking-widest rounded-sm transition-all duration-200 active:scale-[0.98] shadow-[0_0_20px_rgba(72,130,58,0.3)] hover:shadow-[0_0_28px_rgba(72,130,58,0.5)] cursor-pointer"
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                View Full Certificate
                <ExternalLink className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
