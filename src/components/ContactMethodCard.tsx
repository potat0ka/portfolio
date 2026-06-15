import { Check, Copy, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

type ContactMethodCardProps = {
  key?: string;
  eyebrow: string;
  label: string;
  value: string;
  href: string;
  tone: "gold" | "green" | "violet" | "blue";
  copied: boolean;
  onCopy: () => void;
  icon?: ReactNode;
  external?: boolean;
};

const toneClasses: Record<ContactMethodCardProps["tone"], string> = {
  gold: "hover:border-[#c3a152]/45 hover:bg-[#1c1e22]/30 hover:text-[#c3a152]",
  green: "hover:border-green-500/45 hover:bg-green-500/[0.03] hover:text-green-400",
  violet: "hover:border-violet-500/45 hover:bg-violet-900/[0.03] hover:text-violet-400",
  blue: "hover:border-blue-500/45 hover:bg-blue-500/[0.03] hover:text-blue-300",
};

export function ContactMethodCard({
  eyebrow,
  label,
  value,
  href,
  tone,
  copied,
  onCopy,
  icon,
  external = false,
}: ContactMethodCardProps) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2">
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={`flex min-h-[72px] flex-col justify-center rounded-sm border border-white/5 bg-[#101114] p-3 transition group ${toneClasses[tone]}`}
      >
        <span className="text-[8px] uppercase font-black leading-none tracking-wide text-gray-500">{eyebrow}</span>
        <span className="mt-1 flex items-center gap-2 text-xs font-extrabold text-white transition">
          {icon}
          <span>{label}</span>
          {external && <ExternalLink className="h-3.5 w-3.5" />}
        </span>
        <span className="mt-1 text-[11px] font-mono text-gray-400 break-all">{value}</span>
      </a>

      <button
        type="button"
        onClick={onCopy}
        className="flex min-h-[72px] min-w-[72px] flex-col items-center justify-center rounded-sm border border-white/10 bg-white/[0.02] px-2 text-[10px] font-black uppercase tracking-widest text-gray-300 transition hover:bg-white/[0.06]"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="mb-1 h-4 w-4 text-green-400" /> : <Copy className="mb-1 h-4 w-4" />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
