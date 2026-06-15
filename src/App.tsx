/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent, useCallback } from "react";
import { 
  ShieldCheck, 
  Binary, 
  Brain, 
  Bot,
  Braces,
  Cloud,
  Code2,
  Cpu,
  Database, 
  Github,
  GitMerge, 
  Globe,
  Layers3, 
  Award, 
  Atom,
  Radio, 
  X, 
  Info, 
  Check, 
  Copy, 
  Clock, 
  Send, 
  BookOpen, 
  Signal, 
  FileCode,
  Gauge,
  TrendingUp,
  Sliders,
  Printer,
  Download,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  FileText,
  Linkedin
} from "lucide-react";

import { 
  HERO_PROFILE, 
  TECH_ITEMS, 
  WORK_PATCHES, 
  PROJECT_MATCHES, 
  TechItem,
  ProjectMatch
} from "./portfolio_data";
import { Toast } from "./components/Toast";
import { ContactMethodCard } from "./components/ContactMethodCard";
import { copyTextToClipboard } from "./lib/clipboard";
import { useSiteSettings, useProfileAsset, useCVAsset, useCertifications, useSkills, useProjectMatches, useWorkPatches, buildContactMethods, buildMailtoLink } from "./hooks/usePortfolioApi";
import type { ApiCertification, ApiSkill, ApiProjectMatch, ApiWorkPatch } from "./hooks/usePortfolioApi";
import { CertificateLightbox } from "./components/CertificateLightbox";
import { CertificateCard } from "./components/CertificateCard";

type PortfolioTab = "HOME" | "ABOUT" | "STACK" | "PROJECTS" | "PATCHES" | "CERTS" | "CONTACT" | "DJANGO_REF";

type TestimonialCard = {
  id: string;
  name: string;
  role: string;
  tag: string;
  quote: string;
  date: string;
  rating: number;
  hash: string;
  color: string;
  avatarBg: string;
  accent: string;
};

type TestimonialFormErrors = {
  name?: string;
  email?: string;
  relationship?: string;
  message?: string;
};

type AppNotice = {
  type: "success" | "error" | "info";
  message: string;
};

function getContactMethodIcon(id: string) {
  switch (id) {
    case "phone":
      return <Phone className="h-3.5 w-3.5 shrink-0" />;
    case "whatsapp":
      return <Radio className="h-3.5 w-3.5 shrink-0" />;
    case "viber":
      return <Signal className="h-3.5 w-3.5 shrink-0" />;
    case "email":
      return <Mail className="h-3.5 w-3.5 shrink-0" />;
    default:
      return null;
  }
}

function normalizeSkillIconSlug(iconSlug: string, skillName: string, category: string) {
  const combined = `${iconSlug} ${skillName} ${category}`.toLowerCase();

  if (combined.includes("python")) return "python";
  if (combined.includes("django")) return "django";
  if (combined.includes("react")) return "react";
  if (combined.includes("javascript") || combined.includes("js")) return "javascript";
  if (combined.includes("typescript") || combined.includes("ts")) return "typescript";
  if (combined.includes("postgres") || combined.includes("sql") || combined.includes("supabase") || combined.includes("database")) return "database";
  if (combined.includes("git") && !combined.includes("github")) return "git";
  if (combined.includes("github")) return "github";
  if (combined.includes("vercel") || combined.includes("deploy") || combined.includes("cloud")) return "cloud";
  if (combined.includes("api") || combined.includes("rest")) return "api";
  if (combined.includes("ai") || combined.includes("ml") || combined.includes("machine")) return "ai";
  if (combined.includes("html") || combined.includes("web")) return "web";
  if (combined.includes("css") || combined.includes("tailwind") || combined.includes("ui")) return "ui";

  return "default";
}

function getSkillIcon(slug: string, className = "h-6 w-6") {
  switch (slug) {
    case "python":
      return <Binary className={className} />;
    case "django":
      return <ShieldCheck className={className} />;
    case "react":
      return <Atom className={className} />;
    case "javascript":
      return <FileCode className={className} />;
    case "typescript":
      return <Braces className={className} />;
    case "database":
      return <Database className={className} />;
    case "git":
      return <GitMerge className={className} />;
    case "github":
      return <Github className={className} />;
    case "cloud":
      return <Cloud className={className} />;
    case "api":
      return <Radio className={className} />;
    case "ai":
      return <Brain className={className} />;
    case "web":
      return <Globe className={className} />;
    case "ui":
      return <Layers3 className={className} />;
    default:
      return <Code2 className={className} />;
  }
}

function getSkillLevelTheme(level: string) {
  if (level === "Expert / Advanced") {
    return {
      quality: "Immortal",
      accent: "text-sky-300",
      border: "border-sky-400/35",
      badge: "bg-sky-500/10 text-sky-300 border-sky-400/30",
      glow: "shadow-[0_0_20px_rgba(56,189,248,0.12)]",
    };
  }

  if (level === "Proficient / Competent") {
    return {
      quality: "Legendary",
      accent: "text-[#c3a152]",
      border: "border-[#c3a152]/35",
      badge: "bg-amber-500/10 text-[#c3a152] border-[#c3a152]/30",
      glow: "shadow-[0_0_18px_rgba(195,161,82,0.12)]",
    };
  }

  return {
    quality: "Rare",
    accent: "text-green-300",
    border: "border-green-400/30",
    badge: "bg-green-500/10 text-green-300 border-green-400/30",
    glow: "shadow-[0_0_18px_rgba(74,222,128,0.10)]",
  };
}

function getSkillSummary(skill: ApiSkill) {
  const normalizedSlug = normalizeSkillIconSlug(skill.icon_slug, skill.name, skill.category);

  switch (normalizedSlug) {
    case "python":
      return "Builds automation, clean backend logic, and practical scripting workflows.";
    case "django":
      return "Supports secure full-stack delivery with routing, models, admin, and APIs.";
    case "react":
      return "Drives interactive UI components, stateful screens, and responsive experiences.";
    case "database":
      return "Handles structured data, persistence, schema design, and platform storage.";
    case "git":
    case "github":
      return "Tracks changes safely and keeps collaboration, history, and delivery organized.";
    case "cloud":
      return "Supports deployment pipelines, hosting flow, and production release readiness.";
    case "ai":
      return "Helps with model-focused workflows, experimentation, and practical AI features.";
    default:
      return "Adds practical capability to the portfolio stack and supports real project delivery.";
  }
}

const TAB_TO_PATH: Record<PortfolioTab, string> = {
  HOME: "/",
  ABOUT: "/about/",
  STACK: "/stack/",
  PROJECTS: "/projects/",
  PATCHES: "/patches/",
  CERTS: "/certs/",
  CONTACT: "/contact/",
  DJANGO_REF: "/django-source/",
};

const TESTIMONIAL_THEMES = [
  {
    color: "from-blue-900/40 to-blue-950/20 border-blue-500/30 text-blue-400",
    avatarBg: "bg-blue-900/50 text-blue-300 border-blue-500/40",
    accent: "#3b82f6",
    tag: "PREDICTIVE LOGIC",
  },
  {
    color: "from-red-900/40 to-red-950/20 border-red-500/30 text-red-400",
    avatarBg: "bg-red-900/50 text-red-350 border-red-500/40",
    accent: "#ef4444",
    tag: "DJANGO ARCHITECTURE",
  },
  {
    color: "from-emerald-900/40 to-emerald-950/20 border-emerald-500/30 text-emerald-400",
    avatarBg: "bg-emerald-900/50 text-emerald-350 border-emerald-500/40",
    accent: "#10b981",
    tag: "STRENGTH & SCHEMA",
  },
  {
    color: "from-amber-900/40 to-amber-950/20 border-amber-500/30 text-amber-400",
    avatarBg: "bg-amber-900/50 text-[#c3a152] border-amber-500/40",
    accent: "#f59e0b",
    tag: "SPRINT SYNERGY",
  },
];

function testimonialThemeForKey(key: string) {
  let seed = 0;
  for (let i = 0; i < key.length; i++) {
    seed = (seed * 31 + key.charCodeAt(i)) % 2147483647;
  }
  return TESTIMONIAL_THEMES[seed % TESTIMONIAL_THEMES.length];
}

function formatTestimonialDate(timestamp: string) {
  const normalized = timestamp.replace("T", " ").replace("Z", "");
  return normalized.length >= 16 ? normalized.slice(0, 16) : normalized;
}

function mapApiTestimonialToCard(apiItem: any): TestimonialCard | null {
  if (!apiItem || apiItem.id == null) return null;
  const id = String(apiItem.id);
  const theme = testimonialThemeForKey(id);
  const authorName = typeof apiItem.author_name === "string" ? apiItem.author_name : "Visitor";
  const authorEmail = typeof apiItem.author_email === "string" ? apiItem.author_email : "";
  const message = typeof apiItem.message === "string" ? apiItem.message : "";
  const createdAt = typeof apiItem.created_at === "string" ? apiItem.created_at : new Date().toISOString();

  return {
    id: `t_${id}`,
    name: authorName,
    role: authorEmail ? authorEmail : "Collaborator / Visitor",
    tag: typeof apiItem.relationship_title === "string" ? apiItem.relationship_title : theme.tag,
    quote: message,
    date: formatTestimonialDate(createdAt),
    rating: 5,
    hash: `TX-${id.padStart(3, "0")}-SECURE`,
    color: theme.color,
    avatarBg: theme.avatarBg,
    accent: theme.accent,
  };
}

function getRouteState(): {
  tab: PortfolioTab;
  openModal: boolean;
  openPrintPreview: boolean;
} {
  if (typeof window === "undefined") {
    return { tab: "HOME", openModal: false, openPrintPreview: false };
  }

  const normalizedPath = window.location.pathname.endsWith("/")
    ? window.location.pathname
    : `${window.location.pathname}/`;

  switch (normalizedPath) {
    case "/about/":
      return { tab: "ABOUT", openModal: false, openPrintPreview: false };
    case "/stack/":
      return { tab: "STACK", openModal: false, openPrintPreview: false };
    case "/projects/":
      return { tab: "PROJECTS", openModal: false, openPrintPreview: false };
    case "/patches/":
      return { tab: "PATCHES", openModal: false, openPrintPreview: false };
    case "/certs/":
      return { tab: "CERTS", openModal: false, openPrintPreview: false };
    case "/contact/":
      return { tab: "CONTACT", openModal: false, openPrintPreview: false };
    case "/django-source/":
      return { tab: "DJANGO_REF", openModal: false, openPrintPreview: false };
    case "/resume/":
      return { tab: "ABOUT", openModal: false, openPrintPreview: true };
    default:
      return { tab: "HOME", openModal: false, openPrintPreview: false };
  }
}

function getPotatoSkinSVG(skin: string) {
  let bodyFill = "#a06c3f"; // warm potato brown
  let borderStroke = "#784824"; // darker outline
  
  if (skin === "GOLD") {
    bodyFill = "#eab308"; // bright gold
    borderStroke = "#ca8a04"; // darker gold outline
  } else if (skin === "STRENGTH") {
    bodyFill = "#854d0e"; // muscular darker potato
    borderStroke = "#451a03";
  } else if (skin === "AGILITY") {
    bodyFill = "#b45309"; // agile reddish-brown
    borderStroke = "#78350f";
  } else if (skin === "NERVOUS") {
    bodyFill = "#d97706"; // pale nervous orange-brown
    borderStroke = "#7c2d12";
  } else if (skin === "SLEEPY") {
    bodyFill = "#7c2d12"; // dark sleepy brown
    borderStroke = "#431407";
  }

  return (
    <div className="animate-custom-wiggle select-none">
      <svg width="34" height="34" viewBox="0 0 24 24" style={{ imageRendering: "pixelated" }} className="select-none">
        {/* Pixel Body Outline */}
        <path d="M6,6 h12 v2 h2 v2 h2 v6 h-2 v2 h-2 v2 h-12 v-2 h-2 v-2 h-2 v-6 h2 v-2 h2 z" fill={borderStroke} />
        {/* Pixel Body Inner Fill */}
        <path d="M7,7 h10 v1 h1 v1 h1 v1 h1 v4 h-1 v1 h-1 v-1 h-1 v1 h-10 v-1 h-1 v-1 h-1 v-1 h-1 v-4 h1 v-1 h1 v-1 h1 z" fill={bodyFill} />
        
        {/* Tiny green leaves on top of potato head */}
        {skin !== "GOLD" && skin !== "MAGE" && (
          <>
            <rect x="11" y="4" width="2" height="2" fill="#387a25" />
            <rect x="12" y="3" width="1" height="1" fill="#4d923a" />
          </>
        )}

        {/* 1. MAGE CUSTOM HAT */}
        {skin === "MAGE" && (
          <>
            {/* Dark violet pointy wizard hat with golden star at top */}
            <path d="M11,1 h2 v1 h1 v1 h-4 v-1 h1 z" fill="#eab308" />
            <path d="M10,3 h4 v1 h-4 z" fill="#6d28d9" />
            <path d="M9,4 h6 v1 h-6 z" fill="#6d28d9" />
            <path d="M8,5 h8 v1 h-8 z" fill="#5b21b6" />
            <path d="M6,6 h12 v1 h-12 z" fill="#4c1d95" />
            {/* Golden pixel star on the hat rim */}
            <rect x="11" y="4" width="1" height="1" fill="#facc15" />
          </>
        )}

        {/* 2. STRENGTH HEADBAND & EYEBROWS */}
        {skin === "STRENGTH" && (
          <>
            {/* Red sports sweatband */}
            <rect x="7" y="7" width="10" height="2" fill="#dc2626" />
            <rect x="10" y="6" width="4" height="1" fill="#ef4444" />
            {/* Tiny Dumbbell weight held on side */}
            <rect x="18" y="10" width="2" height="2" fill="#475569" />
            <rect x="19" y="8" width="1" height="6" fill="#94a3b8" />
            <rect x="18" y="13" width="2" height="2" fill="#475569" />
          </>
        )}

        {/* 3. AGILITY VISOR */}
        {skin === "AGILITY" && (
          <>
            {/* Cyberpunk Futuristic Visor */}
            <rect x="7" y="9" width="10" height="3" fill="#facc15" />
            <rect x="8" y="10" width="2" height="1" fill="#38bdf8" />
            <rect x="14" y="10" width="2" height="1" fill="#38bdf8" />
          </>
        )}

        {/* 4. GOLD CROWN */}
        {skin === "GOLD" && (
          <>
            {/* Golden Crown */}
            <path d="M8,3 h8 v3 h-8 z" fill="#ca8a04" />
            <path d="M8,3 l2,2 l2,-2 l2,2 l2,-2 v3 h-8 z" fill="#facc15" />
            {/* Red Gem */}
            <rect x="11" y="4" width="2" height="1" fill="#dc2626" />
          </>
        )}

        {/* 5. NERVOUS SPECTACLES + SWEAT */}
        {skin === "NERVOUS" && (
          <>
            {/* Big glasses */}
            <rect x="7" y="9" width="4" height="3" fill="#ffffff" stroke="#101114" strokeWidth="1" />
            <rect x="13" y="9" width="4" height="3" fill="#ffffff" stroke="#101114" strokeWidth="1" />
            <rect x="11" y="10" width="2" height="1" fill="#101114" />
            {/* Sweat droplet */}
            <rect x="4" y="8" width="1" height="2" fill="#38bdf8" />
            <rect x="5" y="9" width="1" height="1" fill="#0284c7" />
          </>
        )}

        {/* 6. RECRUITER MONOCLE & TIE */}
        {skin === "RECRUITER" && (
          <>
            <rect x="13" y="9" width="4" height="3" fill="transparent" stroke="#facc15" strokeWidth="1" />
            <rect x="17" y="10" width="2" height="1" fill="#eab308" />
            <rect x="11" y="15" width="2" height="3" fill="#dc2626" />
          </>
        )}

        {/* Standard Face Elements (unless overridden by visor/glasses) */}
        {skin !== "AGILITY" && skin !== "NERVOUS" && (
          <>
            {/* Left Eye */}
            <rect x="8" y="9" width="2" height="2" fill="white" />
            <rect x="9" y="10" width="1" height="1" fill="black" />
            
            {/* Right Eye */}
            {skin !== "RECRUITER" ? (
              <>
                <rect x="14" y="9" width="2" height="2" fill="white" />
                <rect x="15" y="10" width="1" height="1" fill="black" />
              </>
            ) : (
              <rect x="14.5" y="10" width="1" height="1" fill="#38bdf8" />
            )}
          </>
        )}

        {/* Mouth expressions */}
        {skin === "STRENGTH" ? (
          <rect x="10" y="13" width="4" height="1" fill="#3d210b" />
        ) : skin === "SLEEPY" ? (
          <rect x="10" y="13" width="4" height="1" fill="#3d210b" />
        ) : skin === "HAPPY" ? (
          <path d="M10,12 h4 v1 h-1 v1 h-2 v-1 h-1 z" fill="#ef4444" />
        ) : (
          <>
            <rect x="11" y="12" width="2" height="1" fill="#3d210b" />
            <rect x="7" y="11" width="1" height="1" fill="#fb7185" />
            <rect x="16" y="11" width="1" height="1" fill="#fb7185" />
          </>
        )}
      </svg>
    </div>
  );
}

// Sub-component for realistic typewriter effect
function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let active = true;
    setDisplayed("");
    let index = 0;
    
    const interval = setInterval(() => {
      if (!active) return;
      if (index < text.length) {
        setDisplayed((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 12);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [text]);

  return <span>{displayed}</span>;
}

// Humorously engaging dynamic dialog box responses representing each outfit/skin context
// Element-specific, highly engaging dialogue categories to keep user hooked on the platform
const POTATO_HOVER_DIALOGUES: Record<string, { skin: "DEFAULT" | "MAGE" | "STRENGTH" | "AGILITY" | "GOLD" | "NERVOUS" | "HAPPY" | "SLEEPY" | "RECRUITER", lines: string[], subtexts: string[] }> = {
  DEFAULT: {
    skin: "DEFAULT",
    lines: [
      "Keep exploring, chief! I change pixel skins based on where you look.",
      "Greetings, recruiter! I track your pointer with ultimate database security.",
      "Bigendra is ready to deploy, but I am here purely to steal the show!",
      "My potato senses are tingling... looks like an elite collaboration!",
      "Did you know? Raw potatoes carry safe static energy. Just like my Python logic!"
    ],
    subtexts: ["POTATO HELPER", "COMEDY COMPANION", "PEEL MONITOR"]
  },
  LOGO: {
    skin: "HAPPY",
    lines: [
      "You've accessed the main directory of Bigendra & Potatoka.py!",
      "My leaves are tingling! We are hovering the core control station!",
      "This is our logo! Handcrafted pixel by pixel with high visual fidelity!"
    ],
    subtexts: ["CORP CORELUTION", "HEADQUARTERS", "PYTHON ENGINE V3"]
  },
  NAV_HOME: {
    skin: "AGILITY",
    lines: [
      "Return to the home panel to review the latest profile overview.",
      "Refreshing the main developer dashboard with current resume data."
    ],
    subtexts: ["HOME PORTAL", "PROFILE OVERVIEW"]
  },
  NAV_STACK: {
    skin: "MAGE",
    lines: [
      "Browse the technical stack summary and toolset overview.",
      "Inspecting Bigendra's core tools: Python, Django, PostgreSQL, and analysis libraries."
    ],
    subtexts: ["TECH STACK", "TOOL INDEX"]
  },
  NAV_PERFORMANCE: {
    skin: "STRENGTH",
    lines: [
      "View server metrics, project velocity, and performance indicators.",
      "Analyzing real-world technical efficiency and data system throughput."
    ],
    subtexts: ["BENCHMARK STATS", "PERFORMANCE METRICS"]
  },
  NAV_QUEUE: {
    skin: "HAPPY",
    lines: [
      "Review active project matches and collaborative opportunities.",
      "Connect with development tasks and internship pathways."
    ],
    subtexts: ["OPPORTUNITIES", "PROJECT POOL"]
  },
  NAV_FEEDBACK: {
    skin: "NERVOUS",
    lines: [
      "Scroll down to visitor feedback and testimonial entries.",
      "Collect public comments and validate your portfolio impact."
    ],
    subtexts: ["FEEDBACK PANEL", "GUESTBOOK"]
  },
  AVATAR_FLIP: {
    skin: "MAGE",
    lines: [
      "Hover to inspect the profile card and review professional details.",
      "Python core innovator, data science learner, and technology enthusiast.",
      "Behind this card lies a focused early career developer."
    ],
    subtexts: ["PROFILE CARD", "CAREER DOSSIER", "DEVELOPER MODE"]
  },
  STAT_STRENGTH: {
    skin: "STRENGTH",
    lines: [
      "STRENGTH attribute: Robust database durability and schema resilience!",
      "PostgreSQL query optimization with indexes and stable transaction handling.",
      "Built reliable SQL structures for consistent data workflows."
    ],
    subtexts: ["DATABASE POWER", "ACID STABILITY", "STRENGTH SCALE"]
  },
  STAT_AGILITY: {
    skin: "AGILITY",
    lines: [
      "AGILITY attribute: Efficient request handling and responsive interactions!",
      "Fast API routing and lightweight frontend experiences.",
      "Maintains quick feedback loops for a responsive user experience."
    ],
    subtexts: ["AGILITY METRIC", "LATENCY STREAM", "RESPONSE SPEED"]
  },
  STAT_INTELLIGENCE: {
    skin: "MAGE",
    lines: [
      "INTELLIGENCE attribute: Data modeling, analytics, and machine learning insights!",
      "Building predictive systems with NumPy, Pandas, and model evaluation.",
      "Developed thoughtful data workflows and analytic summaries."
    ],
    subtexts: ["ANALYTICS MATRIX", "MATH ENGINE", "DATA ALGO"]
  },
  BADGE_PYTHON: {
    skin: "MAGE",
    lines: [
      "Python is the foundation for efficient scripting and data processing.",
      "Automates workflows and supports machine learning experiments.",
      "Develops clean and readable scripts for real-world tasks."
    ],
    subtexts: ["PYTHON CORE", "PY_OPTIMIZER"]
  },
  BADGE_DJANGO: {
    skin: "MAGE",
    lines: [
      "Django enables structured web development and clean backend logic.",
      "Builds secure routes, data models, and user-facing application flows."
    ],
    subtexts: ["DJANGO FRAMEWORK", "ROUTING ARCHITECTURE"]
  },
  BADGE_POSTGRES: {
    skin: "STRENGTH",
    lines: [
      "PostgreSQL powers reliable relational storage and complex queries.",
      "Designed indexing strategies to improve data load performance."
    ],
    subtexts: ["POSTGRES INDEX", "SQL SCHEMA"]
  },
  BADGE_REACT: {
    skin: "HAPPY",
    lines: [
      "React + Vite delivers smooth component rendering and fast builds.",
      "Creates modern UI interactions with responsive design support."
    ],
    subtexts: ["REACT RENDER", "VITE WORKFLOW"]
  },
  BADGE_PANDAS: {
    skin: "MAGE",
    lines: [
      "Pandas and NumPy enable clean data transformation pipelines.",
      "Uses dataframes to prepare datasets for analysis and modeling."
    ],
    subtexts: ["PANDAS AGGREGATOR", "NUMPY VECTOR"]
  },
  BADGE_AI: {
    skin: "MAGE",
    lines: [
      "Neural Networks and machine learning predictors running with Scikit-learn!",
      "Extracting pattern insights from high-dimensional datasets!"
    ],
    subtexts: ["SCIKIT-LEARN", "PREDICTIVE ENG"]
  },
  BADGE_GENERIC: {
    skin: "DEFAULT",
    lines: [
      "Approved skill of Bigendra! Extensively compiled across commercial products.",
      "Pragmatic coding practices, SOLID design patterns, and zero technical debt!"
    ],
    subtexts: ["VERIFIED SKILL", "ENGINEERING CAP"]
  },
  QUEUE_PANEL: {
    skin: "HAPPY",
    lines: [
      "Custom Matchmaking Queue! Click FIND MATCH to secure a server match simulation!",
      "Accept match when ready. I'll search for team candidates in real-time!",
      "Competitive matchmaking rating indicator: 8.2k MMR performance tier!"
    ],
    subtexts: ["MATCHMAKING LOBBY", "ACTIVE QUEUE"]
  },
  TESTIMONIAL: {
    skin: "GOLD",
    lines: [
      "Ooh, real client testimonials! Hover to spin and inspect logs!",
      "These logs carry sha-256 secure hash markers!",
      "Praise from advisors and leads confirming exceptional python innovation!"
    ],
    subtexts: ["ELITE ENDORSE", "GOLD COMMAND", "SECURE LOGS"]
  },
  INPUT_FORM: {
    skin: "NERVOUS",
    lines: [
      "Drafting a visitor message! Let me encrypt your keystrokes for safe transit!",
      "Establishing secure WebSocket handshakes for sending your guest entry!",
      "Don't worry, my spam filter is active. Your feedback is safe with me!"
    ],
    subtexts: ["INPUT SHIELD", "TLS HANDSHAKE", "FORM BUFFER"]
  },
  DIAGNOSTICS: {
    skin: "AGILITY",
    lines: [
      "Pinging Google core servers... Latency is blazing fast!",
      "Real-time synchronized clocks keep our system timestamps highly correct."
    ],
    subtexts: ["TELEMETRY HUD", "DIAG SYS-CLOCK"]
  },
  BUTTON_SUBMIT: {
    skin: "HAPPY",
    lines: [
      "Ready to dispatch visitor payload down the main event pipeline? Fire!",
      "Click this button to commit your credentials to our live React list state!"
    ],
    subtexts: ["EVENT TRANSIT", "COMMIT DISPATCH"]
  }
};

function TestimonialCardComponent({ item }: { item: TestimonialCard }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const initials = item.name.split(" ").map(n => n ? n[0] : "").join("").substring(0, 2);

  return (
    <div 
      className="h-[210px] perspective-1000 select-none cursor-pointer relative"
      onClick={() => setIsFlipped(prev => !prev)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? "rotate-y-180" : ""}`}>
        
        {/* FRONT FACE: Testimonial & Contributor Quick Look with Dummy Photo */}
        <div className="absolute inset-0 bg-[#1c1e22]/75 border border-white/5 rounded-sm p-4 dota-panel-glow flex flex-col justify-between backface-hidden">
          <div className="space-y-3">
            
            {/* Header section of front face */}
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-mono tracking-wider font-extrabold uppercase bg-amber-500/10 text-[#c3a152] border border-amber-500/20 px-1.5 py-0.5 rounded-sm">
                {item.tag}
              </span>
            </div>

            {/* Contributor Row with Dummy Photo */}
            <div className="flex items-center gap-3">
              {/* Dummy Profile Photo representing the Contributor */}
              <div className={`w-10 h-10 rounded-sm border flex items-center justify-center font-mono font-black text-xs relative overflow-hidden flex-shrink-0 ${item.avatarBg}`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent pointer-events-none" />
                <span>{initials}</span>
                <div className="absolute bottom-0 inset-x-0 h-[3px]" style={{ backgroundColor: item.accent }} />
              </div>

              <div className="overflow-hidden">
                <span className="text-xs font-black text-white hover:text-[#c3a152] transition-colors block truncate uppercase tracking-wide leading-none">{item.name}</span>
                <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase truncate block mt-1">{item.role}</span>
              </div>
            </div>

            {/* Brief Excerpt */}
            <p className="text-[11px] text-gray-300 leading-relaxed italic line-clamp-3 text-left pl-1 border-l border-white/10">
              "{item.quote.length > 85 ? item.quote.substring(0, 82) + "..." : item.quote}"
            </p>
          </div>

          {/* Card bottom indicator */}
          <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-gray-500">
            <span>VERIFIER: {item.hash}</span>
            <span className="text-[#48823a] animate-pulse">TAP OR HOVER TO FLIP ◀</span>
          </div>
        </div>

        {/* BACK FACE: Detailed feedback prose & system telemetry logs */}
        <div className="absolute inset-0 bg-[#16171a]/95 border border-[#c3a152]/30 rounded-sm p-4 dota-panel-glow flex flex-col justify-between backface-hidden rotate-y-180 text-left">
          <div className="space-y-2">
            {/* Back header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
              <span className="text-[9px] font-mono text-gray-400 font-bold uppercase tracking-widest">TRANSMISSION LOG</span>
              <span className="text-[8px] font-mono text-[#c3a152] bg-amber-500/10 px-1 py-0.2 rounded-sm font-semibold">VERIFIED</span>
            </div>

            {/* Original Full Prose */}
            <div className="text-[11px] text-gray-300 leading-relaxed font-sans max-h-[105px] overflow-y-auto">
              {item.quote}
            </div>
          </div>

          {/* Back Bottom info with timezone & packet size */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-gray-500 leading-none">
              <span>TIMESTAMP: {item.date}</span>
              <span className="text-[#c3a152]">SECURE-HASH</span>
            </div>
            <div className="flex justify-between text-[8px] font-mono text-gray-600 leading-none">
              <span>ROUTE: /api/testimonials/</span>
              <span>DATA LENGTH: {item.quote.length} BYTES</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function App() {
  const initialRouteState = getRouteState();

  // --- Dynamic API Data ---
  const { data: siteSettings } = useSiteSettings();
  const { data: profileAsset } = useProfileAsset();
  const { data: cvAsset } = useCVAsset();
  const { data: apiCertifications, loading: certsLoading } = useCertifications();
  const { data: apiSkills, loading: skillsLoading } = useSkills();
  const { data: apiProjectMatches, loading: projectMatchesLoading } = useProjectMatches();
  const { data: apiWorkPatches, loading: workPatchesLoading } = useWorkPatches();

  const cvUrl = cvAsset?.cv_pdf ?? null;
  const cvDownloadName = `${siteSettings.full_name.replace(/\s+/g, "_") || "CV"}.pdf`;
  const contactMethods = buildContactMethods(siteSettings);
  const visibleContactMethods = contactMethods.filter((method) => method.value.trim().length > 0);
  const emailMailtoHref = buildMailtoLink(siteSettings);
  const socialLinks = [
    { id: "github", label: "GITHUB ↗", href: siteSettings.github },
    { id: "linkedin", label: "LINKEDIN ↗", href: siteSettings.linkedin },
  ].filter((link) => link.href.trim().length > 0);
  const professionalBrief =
    "I'm a passionate IT professional dedicated to building secure, scalable infrastructure and streamlining operations. From automated deployments to bulletproof network security, I solve complex technical problems so businesses can scale without downtime. Let's build something efficient together.";
  const professionalNetworkLinks = [
    {
      id: "linkedin",
      label: "LinkedIn",
      value: siteSettings.linkedin,
      href: siteSettings.linkedin,
      icon: <Linkedin className="h-5 w-5 text-sky-300" />,
      accent: "from-sky-500/20 to-blue-500/5 border-sky-400/20 hover:border-sky-300/45",
      external: true,
    },
    {
      id: "github",
      label: "GitHub",
      value: siteSettings.github,
      href: siteSettings.github,
      icon: <Github className="h-5 w-5 text-gray-100" />,
      accent: "from-white/10 to-white/[0.02] border-white/10 hover:border-white/30",
      external: true,
    },
  ].filter((link) => link.value.trim().length > 0 && link.href.trim().length > 0 && link.href !== "#");
  const displayName = siteSettings.full_name.trim() || "Portfolio";
  const heroNameParts = siteSettings.full_name.trim().split(/\s+/);
  const heroNamePrimary = heroNameParts[0] ?? siteSettings.full_name;
  const heroNameSecondary = heroNameParts.slice(1).join(" ");
  const brandMonogram = displayName.charAt(0).toUpperCase() || "B";
  const hasAdminSkills = apiSkills.length > 0;

  // Certificate lightbox state
  const [selectedCert, setSelectedCert] = useState<ApiCertification | null>(null);

  // Navigation State
  const [activeTab, setActiveTab ] = useState<PortfolioTab>(initialRouteState.tab);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Global Pixelated Potato Mouse Companion State
  const [potato, setPotato] = useState<{
    x: number;
    y: number;
    active: boolean;
    skin: "DEFAULT" | "MAGE" | "STRENGTH" | "AGILITY" | "GOLD" | "NERVOUS" | "HAPPY" | "SLEEPY" | "RECRUITER";
    dialogue: string;
    subtext: string;
  }>({
    x: 0,
    y: 0,
    active: false,
    skin: "DEFAULT",
    dialogue: "Greetings, visitor! I'm Potatoka.py!",
    subtext: "READY TO DEPLOY"
  });

  // Time & Latency Simulation
  const [utcTime, setUtcTime] = useState<string>("");
  const [localTime, setLocalTime] = useState<string>("");
  const [latency, setLatency] = useState<number>(12);
  const [profilePhotoSrc, setProfilePhotoSrc] = useState<string | null>(null);
  const [virtualShieldSrc, setVirtualShieldSrc] = useState<string | null>(null);
  
  // Custom Hover/Select Interactive States
  const [hoveredAttribute, setHoveredAttribute] = useState<string | null>(null);
  const [profileFlipped, setProfileFlipped] = useState<boolean>(false);
  const [selectedTechItem, setSelectedTechItem] = useState<TechItem>(TECH_ITEMS[1]); // Default Django Aegis
  const [selectedSkill, setSelectedSkill] = useState<ApiSkill | null>(null);
  const [animatedSkillId, setAnimatedSkillId] = useState<number | null>(null);
  const [spectatedMatch, setSpectatedMatch] = useState<ApiProjectMatch>(PROJECT_MATCHES[0]);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState<boolean>(initialRouteState.openPrintPreview);
  const activeSkill = selectedSkill ?? apiSkills[0] ?? null;
  const displayedProjectMatches = apiProjectMatches.length ? apiProjectMatches : PROJECT_MATCHES;
  const displayedWorkPatches = apiWorkPatches.length ? apiWorkPatches : WORK_PATCHES;

  const navigateToTab = useCallback((tab: PortfolioTab) => {
    setIsModalOpen(false);
    setIsPrintPreviewOpen(false);
    setActiveTab(tab);
  }, []);

  const goToHomeTop = useCallback(() => {
    setIsModalOpen(false);
    setIsPrintPreviewOpen(false);
    if (activeTab !== "HOME") {
      setActiveTab("HOME");
      window.setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 80);
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const handleSkillSelect = useCallback((skill: ApiSkill) => {
    setSelectedSkill(skill);
    setAnimatedSkillId(skill.id);
  }, []);

  // Sync API profile photo into state whenever it loads
  useEffect(() => {
    setProfilePhotoSrc(profileAsset?.profile_photo ?? null);
  }, [profileAsset?.profile_photo]);

  useEffect(() => {
    setVirtualShieldSrc(profileAsset?.hero_image ?? null);
  }, [profileAsset?.hero_image]);

  useEffect(() => {
    if (apiSkills.length === 0) return;

    setSelectedSkill((current) => {
      if (current) {
        const matchedSkill = apiSkills.find((skill) => skill.id === current.id);
        if (matchedSkill) return matchedSkill;
      }
      return apiSkills[0];
    });
  }, [apiSkills]);

  useEffect(() => {
    if (apiProjectMatches.length === 0) return;

    setSpectatedMatch((current) => {
      const matched = apiProjectMatches.find((match) => match.matchId === current.matchId);
      return matched ?? apiProjectMatches[0];
    });
  }, [apiProjectMatches]);

  useEffect(() => {
    if (animatedSkillId === null) return;

    const timeout = window.setTimeout(() => {
      setAnimatedSkillId(null);
    }, 550);

    return () => window.clearTimeout(timeout);
  }, [animatedSkillId]);

  const handleProfilePhotoError = () => {
    setProfilePhotoSrc(null);
  };

  const handleVirtualShieldError = () => {
    setVirtualShieldSrc(null);
  };

  // Matchmaker / Queue Form States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(initialRouteState.openModal);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRelationship, setFormRelationship] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formFieldErrors, setFormFieldErrors] = useState<TestimonialFormErrors>({});
  
  // Dynamic Testimonials List
  const [testimonials, setTestimonials] = useState<TestimonialCard[]>([]);
  const [testimonialsLoadState, setTestimonialsLoadState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testimonialsLoadMessage, setTestimonialsLoadMessage] = useState<string | null>(null);
  const [testimonialSubmitState, setTestimonialSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testimonialSubmitMessage, setTestimonialSubmitMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<AppNotice | null>(null);
  
  // Floating HUD Auto-Retraction & Interactive Hover states
  const [isHudCollapsed, setIsHudCollapsed] = useState<boolean>(false);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Django Code Ref States

  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Lifecycle updates for Time & Latency
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
      setLocalTime(now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

      const measurePing = async () => {
      const startTime = performance.now();
      try {
        const res = await fetch("/__ping?rand=" + Math.random(), { cache: "no-store" });
        if (!res.ok) throw new Error("ping failed");
        const endTime = performance.now();
        setLatency(Math.max(1, Math.round(endTime - startTime)));
      } catch (err) {
        setLatency(Math.round(15 + Math.random() * 15));
      }
    };
    measurePing();
    const latencyInterval = setInterval(measurePing, 5000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(latencyInterval);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const showNotice = useCallback((type: AppNotice["type"], message: string) => {
    setNotice({ type, message });
  }, []);

  const loadTestimonials = useCallback(async () => {
    setTestimonialsLoadState("loading");
    setTestimonialsLoadMessage(null);
    try {
      const res = await fetch("/api/testimonials/", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        const errBody = contentType.includes("application/json") ? await res.json().catch(() => null) : null;
        const message = `Unable to load testimonials (${res.status})`;
        throw new Error(message);
      }
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error("Non-JSON response from API");
      }
      const data = await res.json();
      const mapped = Array.isArray(data)
        ? (data.map(mapApiTestimonialToCard).filter(Boolean) as TestimonialCard[])
        : [];
      setTestimonials(mapped);
      setTestimonialsLoadState("success");
    } catch (err) {
      setTestimonialsLoadState("error");
      setTestimonialsLoadMessage(err instanceof Error ? err.message : "Unable to load testimonials.");
    }
  }, []);

  useEffect(() => {
    void loadTestimonials();
  }, [loadTestimonials]);

  useEffect(() => {
    const syncFromLocation = () => {
      const routeState = getRouteState();
      setActiveTab(routeState.tab);
      setIsModalOpen(routeState.openModal);
      setIsPrintPreviewOpen(routeState.openPrintPreview);
    };

    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, []);

  useEffect(() => {
    const nextPath = isPrintPreviewOpen
      ? "/resume/"
      : TAB_TO_PATH[activeTab] ?? "/";

    if (window.location.pathname !== nextPath) {
      window.history.replaceState({}, "", nextPath);
    }
  }, [activeTab, isPrintPreviewOpen]);

  // Sync scroll detection for header merge/shrink behavior
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Companion Tracking State Refs to avoid state updates on every pixel and keep dialogue stable
  const currentSkinRef = useRef<string>("DEFAULT");
  const currentCategoryRef = useRef<string>("");
  const lastDialogueRef = useRef<string>("Greetings, visitor! I'm Potatoka.py!");
  const lastSubtextRef = useRef<string>("READY TO DEPLOY");

  // Global High-Performance Pixelated Potato viewport follower
  useEffect(() => {
    let lastTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastTime < 16) return; // limit to ~60 frames per second
      lastTime = now;

      // Detect intersecting element
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      let detectedCategory: string = "DEFAULT";

      if (target) {
        let el: HTMLElement | null = target;
        let found = false;
        while (el && !found) {
          // A. Submit or general button actions
          if (el.tagName === "BUTTON") {
            detectedCategory = "BUTTON_SUBMIT";
            found = true;
          }
          // B. Inputs / form elements
          else if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.closest("form")) {
            detectedCategory = "INPUT_FORM";
            found = true;
          }
          // C. Telemetry diagnostics clock / latencies
          else if (el.closest(".font-mono.text-xs.text-right") || el.textContent?.includes("MS") || el.id === "sys_timestamp") {
            detectedCategory = "DIAGNOSTICS";
            found = true;
          }
          // D. Check for logos
          else if (el.id === "logo_brand" || el.id?.includes("logo") || el.closest(".group\\/logo")) {
            detectedCategory = "LOGO";
            found = true;
          }
          // E. Navigation items
          else if (el.closest(".group\\/navitem")) {
            const txt = el.textContent?.trim().toUpperCase() || "";
            if (txt.includes("HOME")) detectedCategory = "NAV_HOME";
            else if (txt.includes("STACK")) detectedCategory = "NAV_STACK";
            else if (txt.includes("PERFORMANCE")) detectedCategory = "NAV_PERFORMANCE";
            else if (txt.includes("QUEUE")) detectedCategory = "NAV_QUEUE";
            else if (txt.includes("FEEDBACK")) detectedCategory = "NAV_FEEDBACK";
            else detectedCategory = "NAV_HOME";
            found = true;
          }
          // F. Matchmaking queue panel / lobby
          else if (el.closest(".bg-\\[\\#1a1d20\\]") || el.closest(".space-y-4") && el.closest(".p-6") && el.textContent?.includes("MATCHTIME")) {
            detectedCategory = "QUEUE_PANEL";
            found = true;
          }
          // G. Testimonial Deck / Feedbacks
          else if (el.closest(".perspective-1000") && el.closest(".h-\\[210px\\]")) {
            detectedCategory = "TESTIMONIAL";
            found = true;
          }
          // H. Hero 3D flip card
          else if (el.closest(".perspective-1000") && el.closest(".aspect-square")) {
            detectedCategory = "AVATAR_FLIP";
            found = true;
          }
          // I. Technology stack badges
          else if (el.closest(".cursor-pointer") && (
            el.textContent?.toLowerCase().includes("python") || 
            el.textContent?.toLowerCase().includes("django") || 
            el.textContent?.toLowerCase().includes("postgres") || 
            el.textContent?.toLowerCase().includes("react") || 
            el.textContent?.toLowerCase().includes("pandas") ||
            el.textContent?.toLowerCase().includes("numpy") ||
            el.textContent?.toLowerCase().includes("scikit") ||
            el.textContent?.toLowerCase().includes("learn")
          )) {
            const txt = el.textContent?.toLowerCase() || "";
            if (txt.includes("python")) detectedCategory = "BADGE_PYTHON";
            else if (txt.includes("django")) detectedCategory = "BADGE_DJANGO";
            else if (txt.includes("postgres") || txt.includes("sql")) detectedCategory = "BADGE_POSTGRES";
            else if (txt.includes("react") || txt.includes("vite")) detectedCategory = "BADGE_REACT";
            else if (txt.includes("pandas") || txt.includes("numpy")) detectedCategory = "BADGE_PANDAS";
            else if (txt.includes("scikit") || txt.includes("learn") || txt.includes("predict")) detectedCategory = "BADGE_AI";
            else detectedCategory = "BADGE_GENERIC";
            found = true;
          }
          else if (el.closest(".cursor-pointer") && el.closest(".grid-cols-2")) {
            detectedCategory = "BADGE_GENERIC";
            found = true;
          }
          // J. Attribute Stats Section
          else if (el.textContent?.includes("STRENGTH") || el.closest(".border-red-500\\/30") || el.closest(".from-red-900")) {
            detectedCategory = "STAT_STRENGTH";
            found = true;
          }
          else if (el.textContent?.includes("AGILITY") || el.closest(".border-green-500\\/30") || el.closest(".from-green-900") || el.closest(".text-emerald-400")) {
            detectedCategory = "STAT_AGILITY";
            found = true;
          }
          else if (el.textContent?.includes("INTELLIGENCE") || el.closest(".border-blue-500\\/30") || el.closest(".from-blue-900")) {
            detectedCategory = "STAT_INTELLIGENCE";
            found = true;
          }

          el = el.parentElement;
        }
      }

      if (detectedCategory !== currentCategoryRef.current) {
        const SKINS: ("DEFAULT" | "MAGE" | "STRENGTH" | "AGILITY" | "GOLD" | "NERVOUS" | "HAPPY" | "SLEEPY" | "RECRUITER")[] = [
          "DEFAULT", "MAGE", "STRENGTH", "AGILITY", "GOLD", "NERVOUS", "HAPPY", "SLEEPY", "RECRUITER"
        ];
        const randomSkin = SKINS[Math.floor(Math.random() * SKINS.length)];
        
        currentCategoryRef.current = detectedCategory;
        currentSkinRef.current = randomSkin;
      }

      setPotato({
        x: e.clientX,
        y: e.clientY,
        active: true,
        skin: currentSkinRef.current as any,
        dialogue: "",
        subtext: ""
      });
    };

    const handleMouseLeave = () => {
      setPotato(prev => ({ ...prev, active: false }));
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Controls auto-retraction flow of the Feedback & Testimonial floating HUD deck
  useEffect(() => {
    if (!isModalOpen) {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
      collapseTimeoutRef.current = setTimeout(() => {
        setIsHudCollapsed(true);
      }, 4000);
    } else {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
      setIsHudCollapsed(false);
    }

    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, [isModalOpen]);

  const handleHudMouseEnter = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
    }
    setIsHudCollapsed(false);
  };

  const handleHudMouseLeave = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
    }
    if (!isModalOpen) {
      collapseTimeoutRef.current = setTimeout(() => {
        setIsHudCollapsed(true);
      }, 2500);
    }
  };

  const validateTestimonialForm = useCallback(() => {
    const fieldErrors: TestimonialFormErrors = {};
    if (!formName.trim() || formName.trim().length < 2) {
      fieldErrors.name = "Name must be at least 2 characters.";
    }
    if (!formEmail.trim()) {
      fieldErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail.trim())) {
      fieldErrors.email = "Enter a valid email address.";
    }
    if (!formRelationship) {
      fieldErrors.relationship = "Please select a relationship.";
    }
    if (!formMessage.trim() || formMessage.trim().length < 10) {
      fieldErrors.message = "Please write at least 10 characters.";
    }
    return fieldErrors;
  }, [formEmail, formMessage, formName, formRelationship]);

  const handleCopyCode = async (codeText: string) => {
    try {
      await copyTextToClipboard(codeText);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    } catch (err) {
      showNotice("error", err instanceof Error ? err.message : "Unable to copy code.");
    }
  };

  const handleCopyContact = useCallback(
    async (label: string, value: string) => {
      try {
        await copyTextToClipboard(value);
        showNotice("success", `${label} copied to clipboard.`);
      } catch (err) {
        showNotice("error", err instanceof Error ? err.message : `Unable to copy ${label}.`);
      }
    },
    [showNotice]
  );

  const openEmailClient = useCallback(() => {
    showNotice("info", "Opening your email app...");
  }, [showNotice]);

  const handleDownloadCV = async () => {
    if (!cvUrl) {
      showNotice("error", "No CV has been uploaded yet.");
      return;
    }

    try {
      const response = await window.fetch(cvUrl);
      const contentType = response.headers.get("content-type");

      if (response.ok && contentType && contentType.toLowerCase().includes("pdf")) {
        const fileBlob = await response.blob();
        const blobUrl = URL.createObjectURL(fileBlob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = cvDownloadName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        return;
      }

      throw new Error("CV file is unavailable.");
    } catch (e) {
      console.warn("CV download failed:", e);
      const link = document.createElement("a");
      link.href = cvUrl;
      link.download = cvDownloadName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFormSubmission = async (e: FormEvent) => {
    e.preventDefault();
    const fieldErrors = validateTestimonialForm();
    setFormFieldErrors(fieldErrors);
    const errors = Object.values(fieldErrors);
    setFormErrors(errors);
    if (errors.length > 0) {
      setTestimonialSubmitState("error");
      setTestimonialSubmitMessage("Please fix the highlighted fields and try again.");
      return;
    }

    setFormErrors([]);
    setFormFieldErrors({});
    setTestimonialSubmitState("loading");
    setTestimonialSubmitMessage(null);

    try {
      const res = await fetch("/api/testimonials/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          author_name: formName.trim(),
          author_email: formEmail.trim(),
          relationship: formRelationship,
          message: formMessage.trim(),
        }),
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        const errBody = contentType.includes("application/json") ? await res.json().catch(() => null) : null;
        const message = `Submission failed (${res.status})`;
        throw new Error(message);
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error("Non-JSON response from API");
      }
      await res.json();
      setTestimonialSubmitState("success");
      setTestimonialSubmitMessage("Thanks. Your testimonial was submitted and is awaiting admin review.");
      showNotice("success", "Testimonial submitted successfully.");

      window.setTimeout(() => {
        setIsModalOpen(false);
        setFormName("");
        setFormEmail("");
        setFormRelationship("");
        setFormMessage("");
        setFormErrors([]);
        setFormFieldErrors({});
        setTestimonialSubmitState("idle");
        setTestimonialSubmitMessage(null);
      }, 1200);
    } catch (err) {
      setTestimonialSubmitState("error");
      setTestimonialSubmitMessage(err instanceof Error ? err.message : "Submission failed. Please try again.");
      showNotice("error", "Testimonial submission failed.");
    }
  };

  return (
    <div id="dota_portfolio_client" className="min-h-screen bg-[#101114] text-gray-200 font-sans select-none tracking-wide pb-16 selection:bg-[#a32c2c] selection:text-white">
      {notice && <Toast type={notice.type} message={notice.message} />}
      
      {/* 1. TOP GLOBAL NAVIGATION BAR */}
      <header 
        className={`sticky top-0 z-40 transition-all duration-300 ease-in-out border-b backdrop-blur-md relative ${
          isScrolled 
            ? "bg-[#0c0d10]/95 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.9)] border-red-950/50" 
            : "bg-gradient-to-r from-[#17191d] to-[#0e0f12] py-3.5 border-white/5"
        }`}
      >

        <div className={`mx-auto flex max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          isScrolled ? "h-11" : "h-14"
        }`}>
          
          {/* Logo Brand mimicking layout with Geometric Balance */}
          <div 
            onClick={goToHomeTop}
            className={`group/logo flex min-w-0 shrink-0 items-center gap-3 pr-3 lg:pr-5 transition-all duration-300 cursor-pointer ${
              isScrolled ? "scale-95 origin-left" : "scale-100"
            }`}
          >
            <div className={`bg-gradient-to-br from-[#a32c2c] to-[#6b1d1d] rotate-45 border border-white/20 flex items-center justify-center text-white font-mono font-black transition-all duration-300 group-hover/logo:scale-110 group-hover/logo:border-[#c3a152] ${
              isScrolled ? "w-6.5 h-6.5 text-[9px]" : "w-7.5 h-7.5 text-xs"
            }`}>
              <span className="-rotate-45 group-hover/logo:animate-pulse">{brandMonogram}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center">
                <span
                  className="block truncate font-sans text-sm font-black tracking-tight text-white transition-colors group-hover/logo:text-[#c3a152] lg:text-base"
                  title={displayName}
                >
                  {displayName.toUpperCase()}
                </span>
              </div>
              <span className="block truncate text-[9px] text-gray-500 font-mono tracking-widest leading-none uppercase group-hover/logo:text-gray-300 transition-colors">
                POTATOKA.PY
              </span>
            </div>
          </div>

          {/* Navigation tabs (Dota-like top bar) */}
          <nav className="hidden items-center overflow-hidden md:flex">
            <div className="dota-topnav flex items-center overflow-hidden">
            {(
              [
                { id: "HOME", label: "HOME" },
                { id: "ABOUT", label: "ABOUT ME" },
                { id: "STACK", label: "SKILLS" },
                { id: "PROJECTS", label: "WATCH" },
                { id: "PATCHES", label: "PATCHES" },
                { id: "CERTS", label: "CERTS" },
                { id: "CONTACT", label: "CONTACT" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => (tab.id === "HOME" ? goToHomeTop() : navigateToTab(tab.id))}
                className={`dota-topnav-item ${activeTab === tab.id ? "is-active" : ""}`}
                aria-current={activeTab === tab.id ? "page" : undefined}
                type="button"
              >
                <span>
                  {tab.label}
                </span>
              </button>
            ))}
            </div>
          </nav>

          {/* Connection diagnostics panel */}
          <div className={`ml-auto flex shrink-0 items-center gap-2 lg:gap-4 transition-all duration-300 ${
            isScrolled ? "scale-95 origin-right" : "scale-100"
          }`}>
            <div className="hidden font-mono text-xs text-right xl:block">
              <div className="flex items-center justify-end space-x-1.5">
                <Signal className="w-3 h-3 text-[#48823a] animate-pulse" />
                <span className="text-gray-500 font-extrabold tracking-wider text-[9px]">GOOGLE PING:</span> 
                <span className="text-[#5ca14c] font-black">{latency} MS</span>
              </div>
              <div className="flex items-center justify-end space-x-1 mt-0.5 text-gray-500 text-[9px]">
                <Clock className="w-2.5 h-2.5 text-[#c3a152] mr-0.5" />
                <span>{localTime}</span>
              </div>
            </div>

            <div 
              className="group/profile cursor-pointer"
              onClick={() => navigateToTab("ABOUT")}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white transition-colors leading-none tracking-wide group-hover/profile:text-[#c3a152]">
                  POTATOKA.PY
                </span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Mobile nav indicator bar */}
      <div className="md:hidden bg-[#16171a] border-b border-gray-800 flex overflow-x-auto whitespace-nowrap py-2 px-4 gap-2 Scrollbar-none scroll-smooth">
        {[
          { id: "HOME", label: "HOME" },
          { id: "ABOUT", label: "ABOUT ME" },
          { id: "STACK", label: "HERO STACK" },
          { id: "PROJECTS", label: "PROJECT WATCH" },
          { id: "PATCHES", label: "PATCH NOTES" },
          { id: "CERTS", label: "CERTS" },
          { id: "CONTACT", label: "CONTACT" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => (tab.id === "HOME" ? goToHomeTop() : navigateToTab(tab.id))}
            className={`px-3 py-1 text-[11px] font-black tracking-wider uppercase rounded-full flex items-center gap-1.5 transition ${
              activeTab === tab.id 
                ? "bg-[#c3a152] text-black" 
                : "bg-gray-900 text-gray-400 hover:text-white"
            }`}
          >
            {activeTab === tab.id && <span className="scale-95 animate-pulse">🥔</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 pt-8 space-y-12">
        
        {/* TAB 1: HOME */}
        {activeTab === "HOME" && (
          <div className="space-y-12 animate-fade-in">
            
            {/* FEATURED HERO SPEC (HERO BANNER) WITH GEOMETRIC BALANCE */}
            <section className="relative overflow-hidden rounded-sm bg-[#1c1e22]/50 border border-white/5 p-6 md:p-12 dota-panel-glow">
              {/* Massive background subtitle word for geometric balance */}
              <div className="absolute top-0 left-0 text-[180px] font-black opacity-[0.03] leading-none select-none pointer-events-none uppercase tracking-tighter">DATA</div>
              
              {/* Decorative radial gradients mirroring Dota client */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#a32c2c]/10 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
                
                {/* Left primary introduction column */}
                <div className="md:col-span-8 space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-[#48823a]/10 text-[#48823a] text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-sm border border-[#48823a]/30 font-bold">
                      {HERO_PROFILE.roleClass}
                    </span>
                    <span className="bg-gray-900 border border-white/10 text-gray-400 text-[10px] font-mono uppercase px-2 py-1 rounded-sm">
                      GUILD: {HERO_PROFILE.guild}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-[10px] tracking-[0.4em] text-[#48823a] font-bold uppercase mb-2">Featured Professional</h2>
                    <h1 className="text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter text-white">
                      {heroNamePrimary}
                      {heroNameSecondary ? (
                        <>
                          <br />
                          {heroNameSecondary}
                        </>
                      ) : null}
                    </h1>
                    <h3 className="text-lg md:text-xl font-bold text-[#c3a152] font-display uppercase tracking-wider block mt-1">
                      {siteSettings.title}
                    </h3>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed max-w-xl pb-4 whitespace-pre-line">
                    {siteSettings.bio}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setActiveTab("STACK")} 
                      className="bg-[#a32c2c] hover:bg-[#c43636] border border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer rounded-none"
                    >
                      DEMO HERO STACK
                    </button>
                    <button 
                      onClick={() => setActiveTab("PROJECTS")}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer rounded-none text-white"
                    >
                      SPECTATE PROJECTS
                    </button>
                  </div>
                </div>

                {/* 3D Flip Card Container wrapping both Profile photo and Stats Panel */}
                <div 
                  className="md:col-span-4 h-[440px] perspective-1000 cursor-pointer group/card"
                  onMouseEnter={() => setProfileFlipped(true)}
                  onMouseLeave={() => setProfileFlipped(false)}
                  onClick={() => setProfileFlipped(!profileFlipped)}
                >
                  <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${
                    profileFlipped ? "rotate-y-180" : ""
                  }`}>
                    
                    {/* FRONT FACE: Profile photo with high quality gaming deck UI details */}
                    <div className="absolute inset-0 bg-[#1c1e22]/80 border border-[#c3a152]/30 rounded-sm p-4 dota-panel-glow flex flex-col justify-between backface-hidden">
                      <div className="space-y-4">
                        {/* Title bar of the avatar frame */}
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c3a152] animate-pulse"></span>
                            <span className="text-[10px] font-bold text-gray-400 tracking-widest font-mono uppercase">HERO PORTRAIT</span>
                          </div>
                          <span className="text-[9px] text-[#c3a152] font-semibold tracking-wider font-mono uppercase bg-[#c3a152]/10 px-1.5 py-0.5 rounded-sm animate-pulse">
                            HOVER TO INSPECT STATS ◀
                          </span>
                        </div>
                        
                        {/* Actual framed photo portrait */}
                        <div className="relative aspect-square w-full rounded-sm overflow-hidden border-2 border-[#c3a152]/40 shadow-[0_0_25px_rgba(195,161,82,0.15)] group-hover/card:border-[#c3a152] group-hover/card:shadow-[0_0_30px_rgba(195,161,82,0.3)] transition-all duration-500">
                          {profilePhotoSrc ? (
                        <img
                          src={profilePhotoSrc}
                          alt={`${siteSettings.full_name} portrait`}
                              className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.05] group-hover/card:scale-105 group-hover/card:brightness-[0.95] transition-all duration-700"
                              referrerPolicy="no-referrer"
                              onError={handleProfilePhotoError}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#17191d] via-[#111215] to-[#0c0d10] text-center">
                              <div className="space-y-2 px-4">
                                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c3a152]/70">
                                  Portrait Sync
                                </p>
                                <p className="text-xs text-gray-500">No profile image loaded yet.</p>
                              </div>
                            </div>
                          )}
                          {/* Inner vignette & cinematic gaming gloss gradient highlights */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#101114]/80 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1500 ease-in-out pointer-events-none" />
                        </div>
                      </div>

                      {/* Brief footer meta stats on the card */}
                      <div className="pt-3 border-t border-white/10 flex justify-between items-center font-mono">
                        <div>
                          <span className="text-[9px] text-gray-500 block uppercase font-bold leading-none">SIGNATURE SPEC</span>
                          <span className="text-xs font-black text-white tracking-wide uppercase mt-1 block">INTELLIGENCE CORE</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-gray-500 block uppercase font-bold leading-none">MATCHES ENROLLED</span>
                          <span className="text-xs font-black text-[#c3a152] tracking-wide uppercase mt-1 block">{HERO_PROFILE.matchesPlayed}</span>
                        </div>
                      </div>
                    </div>

                    {/* BACK FACE: The primary attributes specs stats panel */}
                    <div className="absolute inset-0 bg-[#1c1e22]/90 border border-[#c3a152]/50 rounded-sm p-6 dota-panel-glow flex flex-col justify-between space-y-6 backface-hidden rotate-y-180">
                      
                      {/* Miniature attribute bubble cluster */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                            <span className="text-xs font-bold text-gray-400 tracking-widest font-mono uppercase">PRIMARY ATTRIBUTES</span>
                          </div>
                          <span className="text-[9px] text-gray-500 uppercase font-mono">ACTIVE DECK</span>
                        </div>

                        <div className="space-y-3">
                          {/* Strength Row */}
                          <div 
                            onMouseEnter={(e) => {
                              e.stopPropagation();
                              setHoveredAttribute("STRENGTH");
                            }}
                            onMouseLeave={(e) => {
                              e.stopPropagation();
                              setHoveredAttribute(null);
                            }}
                            className={`flex items-center justify-between p-2 rounded-sm border cursor-help transition ${
                              hoveredAttribute === "STRENGTH" 
                                ? "bg-red-950/20 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.15)]" 
                                : "bg-[#111215]/60 border-white/5"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-5 h-5 bg-gradient-to-br from-red-800 to-red-900 rounded-sm flex items-center justify-center text-[10px] font-black text-white">S</div>
                              <span className="text-xs font-bold text-gray-300">STRENGTH (Postgres)</span>
                            </div>
                            <span className="text-xs font-bold text-red-500 font-mono">{HERO_PROFILE.attributes.strength.split(" / ")[0]}</span>
                          </div>

                          {/* Agility Row */}
                          <div 
                            onMouseEnter={(e) => {
                              e.stopPropagation();
                              setHoveredAttribute("AGILITY");
                            }}
                            onMouseLeave={(e) => {
                              e.stopPropagation();
                              setHoveredAttribute(null);
                            }}
                            className={`flex items-center justify-between p-2 rounded-sm border cursor-help transition ${
                              hoveredAttribute === "AGILITY" 
                                ? "bg-green-950/20 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.15)]" 
                                : "bg-[#111215]/60 border-white/5"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-5 h-5 bg-gradient-to-br from-green-800 to-green-900 rounded-sm flex items-center justify-center text-[10px] font-black text-white">A</div>
                              <span className="text-xs font-bold text-gray-300">AGILITY (Throughput)</span>
                            </div>
                            <span className="text-xs font-bold text-green-500 font-mono">{HERO_PROFILE.attributes.agility.split(" / ")[0]}</span>
                          </div>

                          {/* Intelligence Row */}
                          <div 
                            onMouseEnter={(e) => {
                              e.stopPropagation();
                              setHoveredAttribute("INTELLIGENCE");
                            }}
                            onMouseLeave={(e) => {
                              e.stopPropagation();
                              setHoveredAttribute(null);
                            }}
                            className={`flex items-center justify-between p-2 rounded-sm border cursor-help transition ${
                              hoveredAttribute === "INTELLIGENCE" 
                                ? "bg-blue-950/25 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.15)]" 
                                : "bg-[#111215]/60 border-white/5"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-5 h-5 bg-gradient-to-br from-blue-800 to-blue-900 rounded-sm flex items-center justify-center text-[10px] font-black text-white">I</div>
                              <span className="text-xs font-bold text-[#c3a152] flex items-center">
                                INTELLIGENCE (Logic)
                                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1 ml-1 rounded-sm">CORE</span>
                              </span>
                            </div>
                            <span className="text-xs font-bold text-blue-400 font-mono">{HERO_PROFILE.attributes.intelligence.split(" / ")[0]}</span>
                          </div>
                        </div>
                      </div>

                      {/* Context tooltip area */}
                      <div className="bg-[#101114] p-3 rounded-sm border border-white/5 text-[11px] leading-relaxed min-h-[72px] flex items-center">
                        {!hoveredAttribute ? (
                          <p className="text-gray-500 italic text-center w-full">Hover an attribute above to inspect dynamic system traits...</p>
                        ) : hoveredAttribute === "STRENGTH" ? (
                          <p className="text-red-300/90 leading-relaxed">
                            <strong>Strength Attribute:</strong> Enhances database durability & architecture resilience. Scales security hardening protocols, transaction atomicity, and query resistance against load crashes.
                          </p>
                        ) : hoveredAttribute === "AGILITY" ? (
                          <p className="text-green-300/90 leading-relaxed">
                            <strong>Agility Attribute:</strong> Controls system latencies and response speeds. Powers optimization algorithms, reducing API serialized load timers and execution delays.
                          </p>
                        ) : (
                          <p className="text-blue-300/90 leading-relaxed">
                            <strong>Intelligence Attribute:</strong> Powers deep data science calculations & Django algorithms. Supports predictive logic mapping, multidimensional list models, and custom pandas analytics.
                          </p>
                        )}
                      </div>

                      {/* Level Progression */}
                    </div>

                  </div>
                </div>

              </div>
            </section>

            {/* HIGH-LEVEL QUICK LOOK SUMMARY BENTO & TESTIMONIAL DECK */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-[#c3a152] text-xs">◆</span>
                <span className="text-xs font-bold text-gray-400 tracking-[0.2em] uppercase font-mono">RECOMMENDED TESTIMONIALS & CLIENT FEEDBACK (HOVER TO SPIN)</span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono hidden sm:block">LOCAL LOG ARCHIVE DATA EXPORTED</span>
            </div>

            {testimonialsLoadState === "loading" && (
              <div className="rounded-sm border border-white/10 bg-[#1c1e22]/50 p-4 text-xs font-mono text-gray-400">
                Loading approved testimonials...
              </div>
            )}

            {testimonialsLoadState === "error" && (
              <div className="flex flex-col gap-3 rounded-sm border border-red-500/30 bg-red-950/20 p-4 text-xs font-mono text-red-200 sm:flex-row sm:items-center sm:justify-between">
                <span>{testimonialsLoadMessage ?? "Unable to load testimonials right now."}</span>
                <button
                  type="button"
                  onClick={() => void loadTestimonials()}
                  className="rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-white/10"
                >
                  Retry
                </button>
              </div>
            )}

            {testimonialsLoadState === "success" && testimonials.length === 0 && (
              <div className="rounded-sm border border-white/10 bg-[#1c1e22]/50 p-4 text-xs font-mono text-gray-400">
                No approved testimonials have been published yet. New submissions stay private until an admin reviews them.
              </div>
            )}

            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.slice(0, 4).map((item) => (
                <TestimonialCardComponent key={item.id} item={item} />
              ))}
            </section>

            {/* TRIPLE DIVISION: FEATURED SYSTEM DETAILS WITH GEOMETRIC BALANCE */}
            <section className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Highlighted Stack Showcase Quicklink */}
              <div className="lg:col-span-4 bg-[#1c1e22]/50 border border-white/5 p-6 rounded-sm dota-panel-glow space-y-5">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <h3 className="text-md font-bold text-[#c3a152] font-display uppercase tracking-wider">HERO ACTIVE EQUIPMENTS</h3>
                  <button onClick={() => setActiveTab("STACK")} className="text-xs text-[#c3a152] hover:underline font-mono cursor-pointer">EDIT LOADOUT ↗</button>
                </div>
                
                <p className="text-xs text-gray-400 leading-relaxed">
                  Hover over or inspect the equipment item loadout grid below to check the components powering Bigendra's digital workflows:
                </p>

                <div className="grid grid-cols-6 gap-2">
                  {TECH_ITEMS.map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => {
                        setSelectedTechItem(item);
                        setActiveTab("STACK");
                      }}
                      className={`relative aspect-square border bg-[#111215] flex flex-col items-center justify-center p-1 rounded-sm transition-all cursor-pointer ${
                        selectedTechItem.id === item.id ? "border-[#c3a152] bg-amber-500/[0.03]" : "border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="text-[9px] font-mono font-bold text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap w-full text-center">
                        {item.name.replace("Orb of ", "").replace("Aegis of ", "").replace("Staff of ", "").replace(" Database Shard", "").replace(" Link of Unity", "").substring(0, 6)}
                      </div>
                      <div className="w-1.5 h-1.5 rounded-sm absolute bottom-1 bg-[#c3a152]"></div>
                    </button>
                  ))}
                </div>

                <div className="bg-[#111215]/60 p-4 rounded-sm border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-[#c3a152] uppercase">{selectedTechItem.name}</span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-sm uppercase font-mono">{selectedTechItem.quality}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{selectedTechItem.passiveDesc}</p>
                </div>
              </div>

              {/* Recruitment system matchmaker introduction card / Testimonial and Feedback Deck */}
              <div className="lg:col-span-4 bg-[#1c1e22]/50 border border-white/5 p-6 rounded-sm dota-panel-glow space-y-4">
                <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
                  <span className="text-red-500 text-sm">▶</span>
                  <h3 className="text-md font-bold text-[#c3a152] font-display uppercase tracking-wider">TESTIMONIAL & FEEDBACK LOGS</h3>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  Support this developer portfolio! Submit a public testimonial, suggestions, or write brief feedback. Recorded entries load dynamically onto local diagnostic logs.
                </p>

                <div className="bg-[#101114] border border-white/5 p-4 rounded-sm text-xs space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500">DECK CATEGORY:</span>
                    <span className="text-gray-200">Public Support Portal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">TRANSMISSION:</span>
                    <span className="text-[#48823a] font-bold">SHA-256 secure hash</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">SERVER TARGET:</span>
                    <span className="text-gray-300">Live testifier preview ready</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setFormErrors([]);
                    setIsModalOpen(true);
                  }}
                  className="h-16 w-full bg-gradient-to-r from-[#48823a] to-[#2d5225] border-t border-white/20 shadow-[0_0_20px_rgba(72,130,58,0.3)] flex flex-col items-center justify-center group hover:from-[#5aa349] transition-all cursor-pointer rounded-none animate-pulse"
                >
                  <span className="text-xs font-bold tracking-[0.2em] opacity-80 uppercase leading-none">Submit Feedback</span>
                  <span className="text-md font-black uppercase text-white leading-none mt-1">GIVE TESTIMONIAL</span>
                </button>
              </div>

              {/* Direct Teleport Coordinates / Contact Deck */}
              <div className="lg:col-span-4 bg-[#1c1e22]/50 border border-white/5 p-6 rounded-sm dota-panel-glow space-y-4">
                <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
                  <span className="text-red-500 text-sm">▶</span>
                  <h3 className="text-md font-bold text-[#c3a152] font-display uppercase tracking-wider">DIRECT CONTACT PORTAL</h3>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  Avoid any portfolio warning disconnects. Connect directly through the admin-managed channels below for projects, feedback, or general inquiries.
                </p>

                <div className="space-y-2 text-[11px] font-mono">
                  {visibleContactMethods.map((method) => (
                    <ContactMethodCard
                      key={method.id}
                      eyebrow={method.eyebrow}
                      label={method.label}
                      value={method.value}
                      href={method.href}
                      tone={method.tone}
                      external={method.external}
                      copied={notice?.type === "success" && notice.message.toLowerCase().includes(method.label.toLowerCase())}
                      icon={getContactMethodIcon(method.id)}
                      onCopy={() => void handleCopyContact(method.label, method.copyValue)}
                    />
                  ))}

                  <a
                    href={emailMailtoHref}
                    onClick={openEmailClient}
                    className="block rounded-sm border border-blue-500/20 bg-blue-950/20 p-3 text-[10px] text-blue-100 transition hover:border-blue-400/40 hover:bg-blue-900/20"
                  >
                    Clicking the email card opens your default mail app with the recipient, subject, and a starter message already filled in.
                  </a>

                  {/* Social links */}
                  <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                    {socialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-[#101114] border border-white/5 hover:border-white/20 text-center rounded-sm text-[10px] text-gray-400 hover:text-white font-bold block transition"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

            </section>

          </div>
        )}

        {/* TAB 2: TECH STACK EQUIPMENT */}
        {activeTab === "STACK" && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-2xl font-black tracking-widest text-[#c3a152] font-display uppercase">
                  ITEM SHOP INVENTORY LOADOUT
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  HERO EQUIPMENT SELECTION MATRIX
                </p>
              </div>
              <span className="bg-[#1c1e22]/60 text-gray-400 border border-white/5 px-3 py-1 font-mono text-xs rounded-sm uppercase">
                COOLDOWNS: ACTIVE | SYNERGIES: SECURED
              </span>
            </div>

            {skillsLoading && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="rounded-sm border border-white/5 bg-[#111215] p-5">
                    <div className="h-12 w-12 rounded-sm bg-white/5" />
                    <div className="mt-4 h-3 w-1/3 rounded bg-white/5" />
                    <div className="mt-2 h-5 w-2/3 rounded bg-white/5" />
                    <div className="mt-4 h-10 rounded bg-white/5" />
                  </div>
                ))}
              </div>
            )}

            {!skillsLoading && hasAdminSkills && activeSkill && (
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-[#1c1e22]/50 border border-white/5 p-6 rounded-sm dota-panel-glow space-y-4">
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-xs font-mono font-bold text-gray-500 tracking-widest uppercase">Admin Skill Icons</h3>
                        <p className="mt-1 text-[11px] text-gray-500">Each card is driven by the skill name, level, and `icon_slug` set in admin.</p>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {apiSkills.map((skill, index) => {
                        const normalizedIconSlug = normalizeSkillIconSlug(skill.icon_slug, skill.name, skill.category);
                        const levelTheme = getSkillLevelTheme(skill.level);
                        const isSelected = activeSkill.id === skill.id;
                        const isAnimated = animatedSkillId === skill.id;

                        return (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => handleSkillSelect(skill)}
                            className={`group relative overflow-hidden rounded-sm border bg-[#111215] p-4 text-left transition-all duration-300 ${
                              isSelected
                                ? `${levelTheme.border} ${levelTheme.glow} bg-white/[0.03]`
                                : "border-white/5 hover:border-white/20 hover:bg-white/[0.02]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div
                                className={`skill-icon-shell ${isAnimated ? "skill-icon-activate" : ""} ${isSelected ? "border-[#c3a152]/30 bg-[#c3a152]/10 text-[#c3a152]" : "border-white/10 bg-white/[0.03] text-gray-200"}`}
                              >
                                {getSkillIcon(normalizedIconSlug, "h-7 w-7")}
                              </div>
                              <span className={`rounded-sm border px-2 py-1 text-[9px] font-mono font-black uppercase ${levelTheme.badge}`}>
                                {skill.level}
                              </span>
                            </div>

                            <div className="mt-4 space-y-1">
                              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-gray-500">{skill.category}</p>
                              <h4 className={`text-base font-black uppercase tracking-wide text-white transition ${isSelected ? levelTheme.accent : "group-hover:text-[#c3a152]"}`}>
                                {skill.name}
                              </h4>
                            </div>

                            <p className="mt-3 text-xs leading-relaxed text-gray-400">
                              {getSkillSummary(skill)}
                            </p>

                            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                              <span className="text-[10px] font-mono font-bold uppercase text-[#48823a]">
                                ICON: {(skill.icon_slug || normalizedIconSlug).toUpperCase()}
                              </span>
                              <span className="text-[9px] font-mono uppercase text-gray-500">
                                {levelTheme.quality}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>


                </div>

                <div className="lg:col-span-5 bg-[#1c1e22]/50 border border-white/5 rounded-sm overflow-hidden dota-panel-glow space-y-6">
                  <div className="bg-[#111215] border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-orange-400 tracking-wider uppercase font-bold block">{activeSkill.category}</span>
                      <h3 className="text-xl font-extrabold text-white tracking-wider uppercase">{activeSkill.name}</h3>
                    </div>
                    <div className={`skill-icon-shell skill-icon-panel border-[#c3a152]/25 bg-[#c3a152]/10 text-[#c3a152] ${animatedSkillId === activeSkill.id ? "skill-icon-activate" : ""}`}>
                      {getSkillIcon(normalizeSkillIconSlug(activeSkill.icon_slug, activeSkill.name, activeSkill.category), "h-8 w-8")}
                    </div>
                  </div>

                  <div className="px-6 space-y-5">
                    <div className="flex items-center justify-between rounded-sm border border-[#48823a]/40 bg-[#48823a]/10 p-3 text-xs font-bold leading-none text-green-300">
                      <span>PROFICIENCY STATUS</span>
                      <span className="text-sm">{activeSkill.level}</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-mono uppercase tracking-wider text-gray-500">SKILL SUMMARY</span>
                      <p className="text-sm leading-relaxed text-gray-250">
                        {getSkillSummary(activeSkill)}
                      </p>
                    </div>

                    <div className="space-y-1.5 border-t border-white/10 pt-3">
                      <span className="block text-[10px] font-mono uppercase tracking-wider text-orange-400">ICON SOURCE FROM ADMIN</span>
                      <p className="text-xs leading-relaxed text-gray-400 italic">
                        Current icon slug: <span className="font-mono text-[#c3a152]">{activeSkill.icon_slug || normalizeSkillIconSlug(activeSkill.icon_slug, activeSkill.name, activeSkill.category)}</span>. Update this value in the admin panel to change the visual icon on the site.
                      </p>
                    </div>

                    <div className="space-y-1.5 border-t border-white/10 pt-3 pb-2">
                      <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">CLICK EFFECT</span>
                      <p className="text-xs leading-relaxed font-mono text-gray-400">
                        🔑 Clicking the icon triggers a quick pulse animation so the selected skill feels active and alive in the interface.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {!skillsLoading && !hasAdminSkills && (
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: 6-Slot Grid mimicking the Dota inventory GUI */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-[#1c1e22]/50 border border-white/5 p-6 rounded-sm dota-panel-glow space-y-4">
                    <h3 className="text-xs font-mono font-bold text-gray-500 tracking-widest uppercase">SLOTTED INSTRUMENTS</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {TECH_ITEMS.map((item, index) => {
                        const isSelected = selectedTechItem.id === item.id;
                        return (
                          <div 
                            key={item.id}
                            onClick={() => setSelectedTechItem(item)}
                            className={`bg-[#111215] border rounded-sm p-4 flex flex-col justify-between aspect-[4/3] group relative transition-all duration-300 hover:scale-101 cursor-pointer select-none ${
                              isSelected 
                                ? "border-[#c3a152] shadow-[0_0_15px_rgba(195,161,82,0.15)] bg-amber-500/[0.02]" 
                                : "border-white/5 hover:border-white/20"
                            }`}
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono tracking-wider text-purple-400 block uppercase font-bold leading-none">{item.category}</span>
                              <h4 className="text-sm font-black text-white group-hover:text-[#c3a152] transition uppercase tracking-wide mt-1">{item.name}</h4>
                            </div>

                            <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                              <span className="text-[10px] font-mono font-bold text-[#48823a]">{item.statBoost}</span>
                              <span className="text-[9px] font-mono text-gray-500 uppercase">{item.quality}</span>
                            </div>

                            <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-[0.6] origin-bottom-right translate-y-1 group-hover:translate-y-0 pointer-events-none select-none z-10">
                              {getPotatoSkinSVG(["DEFAULT", "MAGE", "STRENGTH", "AGILITY", "GOLD", "NERVOUS", "HAPPY", "SLEEPY", "RECRUITER"][index % 9])}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="bg-[#1c1e22]/30 border-l-4 border-[#c3a152] p-4 rounded-sm text-xs leading-relaxed text-gray-400 italic">
                    No admin skills have been added yet, so the page is showing the original static stack cards.
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#1c1e22]/50 border border-white/5 rounded-sm overflow-hidden dota-panel-glow space-y-6">
                  <div className="bg-[#111215] border-b border-white/10 px-6 py-4 flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-orange-400 tracking-wider uppercase font-bold block">{selectedTechItem.category}</span>
                      <h3 className="text-xl font-extrabold text-white tracking-wider uppercase">{selectedTechItem.name}</h3>
                    </div>
                    <span className="text-xs bg-amber-500/10 text-[#c3a152] border border-[#c3a152]/40 px-3 py-1 font-mono font-black rounded-sm uppercase">
                      {selectedTechItem.quality}
                    </span>
                  </div>

                  <div className="px-6 space-y-5">
                    <div className="bg-[#48823a]/10 border border-[#48823a]/40 p-3 rounded-sm flex justify-between items-center text-green-300 font-mono text-xs font-bold leading-none select-none">
                      <span>UPGRADE STREAK BONUS</span>
                      <span className="text-sm">{selectedTechItem.statBoost}</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-gray-500 text-[10px] font-mono tracking-wider uppercase block">PASSIVE CAPABILITIES</span>
                      <p className="text-sm text-gray-250 leading-relaxed">
                        {selectedTechItem.passiveDesc}
                      </p>
                    </div>

                    {selectedTechItem.usageDesc && (
                      <div className="space-y-1.5 border-t border-white/10 pt-3">
                        <span className="text-orange-400 text-[10px] font-mono tracking-wider uppercase block">ACTIVE USABILITY TRIGGER</span>
                        <p className="text-xs text-gray-400 leading-relaxed italic">
                          {selectedTechItem.usageDesc}
                        </p>
                      </div>
                    )}

                    <div className="space-y-1.5 border-t border-white/10 pt-3 pb-2">
                      <span className="text-gray-500 text-[10px] font-mono tracking-wider uppercase block font-bold">SYSTEM SYNERGIES INCLUDED</span>
                      <p className="text-xs text-gray-400 leading-relaxed font-mono">
                        🔑 {selectedTechItem.synergy}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#111215] border-t border-white/10 px-6 py-4 flex justify-between items-center text-xs font-mono text-gray-500">
                    <span>COOLDOWN TIMER: {selectedTechItem.coolDown}</span>
                    <span className="text-[#48823a] font-bold">SYSTEM ACTIVE</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROJECTS WATCH */}
        {activeTab === "PROJECTS" && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-2xl font-black tracking-widest text-[#c3a152] font-display uppercase">
                  PROJECT ARCHIVE DEPLOYMENTS
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-1">SPECTATE LIVE DEPLOYMENTS & SYSTEM PIPELINES</p>
              </div>
              <span className="text-xs font-mono text-[#c3a152] bg-amber-500/5 px-3 py-1 rounded-sm border border-[#c3a152]/30">
                ACTIVE PIPELINE METRICS CHARTED
              </span>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Side: Broadcast Channels matches lists */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-xs font-bold text-gray-500 tracking-widest font-mono uppercase">AVAILABLE LIVE STREAMS</h3>
                
                <div className="space-y-3">
                  {displayedProjectMatches.map((match) => {
                    const isSpectated = spectatedMatch.matchId === match.matchId;
                    return (
                      <div 
                        key={match.matchId}
                        onClick={() => setSpectatedMatch(match)}
                        className={`p-4 rounded-sm border justify-between flex items-center transition duration-200 cursor-pointer relative group ${
                          isSpectated 
                            ? "bg-[#1c1e22]/80 border-[#c3a152] shadow-[0_0_15px_rgba(195,161,82,0.1)] dota-panel-glow" 
                            : "bg-[#1c1e22]/45 border-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono text-[#48823a] font-bold">● LIVE SPECTATE</span>
                            <span className="text-xs font-mono text-gray-500">{match.matchId}</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-white uppercase tracking-wide group-hover:text-[#c3a152] transition">
                            {match.title}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {match.techKeywords.map((tech) => (
                              <span key={tech} className="text-[9px] font-mono bg-[#101114] border border-white/5 text-gray-400 px-1.5 py-0.5 rounded-sm">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-right ml-4 relative">
                          <span className="text-[10px] font-mono text-gray-500 block">WIN RATE</span>
                          <span className="text-sm font-black text-[#48823a] leading-none">VICTORY</span>
                          <span className="text-[9px] font-mono text-gray-500 block mt-1">{match.duration}</span>
                        </div>

                        {/* Hover mini potato on Live Stream slots */}
                        <div className="absolute right-2 bottom-1 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-[0.55] origin-bottom-right translate-y-1 group-hover:translate-y-0 pointer-events-none select-none z-10">
                          {getPotatoSkinSVG(["DEFAULT", "MAGE", "STRENGTH", "AGILITY", "GOLD", "NERVOUS", "HAPPY", "SLEEPY", "RECRUITER"][match.title.length % 9])}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Side: BROADCAST DETAILS DISPLAY MODULE */}
              <div className="lg:col-span-7 bg-[#1c1e22]/50 border border-white/5 rounded-sm dota-panel-glow relative overflow-hidden space-y-6">
                
                {/* Background active scanner screen simulation line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-600/30 animate-pulse"></div>

                {/* Module Header */}
                <div className="bg-[#111215] border-b border-white/10 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center space-x-3">
                    <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest leading-none">BROADCASTING FROM SERVER</span>
                    <span className="text-xs font-mono text-gray-500">{spectatedMatch.matchId}</span>
                  </div>
                  <span className="text-xs bg-[#48823a]/10 text-green-300 font-mono px-3 py-0.5 rounded-sm border border-[#48823a]/30">
                    MATCH OUTCOME: {spectatedMatch.outcome}
                  </span>
                </div>

                {/* Module body and data charts */}
                <div className="p-6 space-y-6">
                  
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-gray-500 tracking-wider block uppercase font-bold">PROJECT DEFINITION SUMMARY</span>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wide leading-snug">{spectatedMatch.title}</h3>
                    <p className="text-sm text-gray-300 leading-relaxed pt-1">
                      {spectatedMatch.description}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 bg-[#101114] p-4 rounded-sm border border-white/5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">HERO SETUP USED(SKILLS)</span>
                      <span className="text-sm font-bold text-[#c3a152] font-mono block uppercase">{spectatedMatch.heroPlayed}</span>
                    </div>
                    <div className="space-y-1 sm:border-l sm:border-white/5 sm:pl-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">GPM ACCRUED (NET EFFICIENCY)</span>
                      <span className="text-sm font-bold text-gray-200 font-mono block">{spectatedMatch.gpm} GPM</span>
                    </div>
                  </div>

                  {/* Impact metrics points */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-gray-500 tracking-wider block uppercase font-bold">MEASURED PIPELINE IMPACT / WIN METRICS</span>
                    <ul className="space-y-2">
                       {spectatedMatch.impactMetrics.map((imp, idx) => (
                        <li key={idx} className="flex items-start text-xs text-gray-300 leading-relaxed bg-[#101114]/40 p-2.5 rounded-sm border border-white/5">
                          <span className="text-green-500 font-bold mr-3">✔</span>
                          <div>{imp}</div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CUSTOM DETAILED INLINE SVG DEPLOYMENT PIPELINE CHART */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-mono text-gray-500 tracking-wider block uppercase font-bold">PIPELINE THROUGHPUT RESPONSE TRAJECTORY (LIVE CHART)</span>
                    <div className="bg-[#101114] border border-white/5 rounded-sm p-4 relative overflow-hidden">
                      
                      {/* Grid background curves */}
                      <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none opacity-10">
                        <div className="border-b border-gray-100"></div>
                        <div className="border-b border-gray-100"></div>
                        <div className="border-b border-gray-100"></div>
                      </div>

                      {/* Line Render */}
                      <svg viewBox="0 0 500 120" className="w-full h-[120px] overflow-visible">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c3a152" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#c3a152" stopOpacity="0.0"/>
                          </linearGradient>
                        </defs>
                        {/* Shaded Area under spline */}
                        <path 
                          d="M10 100 Q 120 10, 240 70 T 490 20 L 490 100 L 10 100 Z" 
                          fill="url(#chartGradient)"
                        />
                        {/* Primary path spline */}
                        <path 
                          d="M10 100 Q 120 10, 240 70 T 490 20" 
                          fill="none" 
                          stroke="#c3a152" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                          className="animate-pulse"
                        />
                        {/* Dynamic dot marker */}
                        <circle cx="490" cy="20" r="5" fill="#48823a" className="animate-ping" />
                        <circle cx="490" cy="20" r="3.5" fill="#5ca14c" />
                      </svg>

                      <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 pt-2 border-t border-white/5">
                        <span>INIT DEPLOY (0s)</span>
                        <span className="text-[#48823a] font-bold">94.2% OPTIMAL STEADY THROUGHPUT ARCHIVED</span>
                        <span>FINALLY BALANCED</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Spectate Module footer */}
                <div className="bg-[#111215] border-t border-white/10 px-6 py-4 flex justify-between items-center text-xs font-mono text-gray-500">
                  <span>SPECTATOR DELAY: LOCAL TIME COINCIDENT</span>
                  <span className="text-[#c3a152]">STATUS: DEMO ENABLED</span>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 4: PATCH NOTES (CAREER EXPERIENCE) */}
        {activeTab === "PATCHES" && (
          <div className="space-y-6 animate-fade-in animate-duration-300">
            <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-2xl font-black tracking-widest text-[#c3a152] font-display uppercase">
                  OFFICIAL ARCHIVE PATCH NOTES
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-1">CHRONICAL AND EXPERIENTIAL CAREER DEVELOPMENT LOGS</p>
              </div>
              <span className="bg-[#1c1e22]/60 text-gray-400 border border-white/5 px-3 py-1 font-mono text-xs rounded-sm uppercase">
                VERSION DEPOT SYNCHRONIZED
              </span>
            </div>

            <div className="space-y-6 max-w-4xl mx-auto">
              {displayedWorkPatches.map((patch) => (
                <div key={patch.version} className="bg-[#1c1e22]/50 border border-white/5 rounded-sm p-6 dota-panel-glow relative">
                  
                  {/* Timeline Badge */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-3 mb-4 gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="bg-[#a32c2c] text-white font-mono font-bold text-xs tracking-widest px-3 py-1 rounded-sm">
                        {patch.version}
                      </span>
                      <h3 className="text-sm md:text-base font-black text-[#c3a152] tracking-wide uppercase">{patch.title}</h3>
                    </div>
                    <span className="text-xs text-gray-500 font-mono uppercase bg-[#101114] border border-white/5 px-2.5 py-1 rounded-sm">
                      DEPLOY DATE: {patch.date}
                    </span>
                  </div>

                  {/* Changes metrics list */}
                  <ul className="space-y-3">
                    {patch.changes.map((change, idx) => (
                      <li key={idx} className="flex items-start text-xs md:text-sm text-gray-300 leading-relaxed">
                        <span className="text-[#a32c2c] font-black mr-3 mt-0.5 select-none">•</span>
                        <div>{change}</div>
                      </li>
                    ))}
                  </ul>

                </div>
              ))}
            </div>
            

          </div>
        )}

        {/* TAB 5: CERTIFICATIONS - Dynamic from API */}
        {activeTab === "CERTS" && (
          <div className="space-y-6 animate-fade-in">
            {/* Certificate Lightbox */}
            {selectedCert && (
              <CertificateLightbox
                cert={selectedCert}
                onClose={() => setSelectedCert(null)}
              />
            )}

            <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-2xl font-black tracking-widest text-[#c3a152] font-display uppercase">
                  ACTIVE HERO PASSIVE AURAS (CERTS)
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-1">CERTIFIED KNOWLEDGE BASE & ACQUIRED ENHANCEMENT RUNES</p>
              </div>
              <span className="bg-[#1c1e22]/60 text-gray-400 border border-white/5 px-3 py-1 font-mono text-xs rounded-sm uppercase">
                {certsLoading ? "LOADING AURAS..." : `${apiCertifications.length} AURAS SECURED`}
              </span>
            </div>

            {certsLoading && (
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-[#1c1e22]/30 border border-white/5 rounded-sm p-6 animate-pulse space-y-3">
                    <div className="h-3 bg-white/5 rounded w-2/3"></div>
                    <div className="h-5 bg-white/5 rounded"></div>
                    <div className="h-16 bg-white/5 rounded"></div>
                    <div className="h-3 bg-white/5 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            )}

            {!certsLoading && apiCertifications.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-4">
                {apiCertifications.map((cert) => (
                  <CertificateCard
                    key={cert.id}
                    cert={cert}
                    onViewCertificate={setSelectedCert}
                  />
                ))}
              </div>
            )}

            {!certsLoading && apiCertifications.length === 0 && (
              <div className="max-w-5xl mx-auto pt-8 text-center">
                <div className="bg-[#1c1e22]/30 border border-white/5 rounded-sm p-12 space-y-4">
                  <Award className="w-12 h-12 text-[#c3a152]/30 mx-auto" />
                  <p className="text-sm font-mono text-gray-500 uppercase">No certifications uploaded yet.</p>
                  <p className="text-xs text-gray-600">Admin can add certificates via the admin panel.</p>
                </div>
              </div>
            )}
            

          </div>
        )}

        {/* TAB: GET IN TOUCH */}
        {activeTab === "CONTACT" && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-2xl font-black tracking-widest text-[#c3a152] font-display uppercase">
                  GET IN TOUCH
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  DIRECT COMMUNICATION CHANNELS, PROFESSIONAL LINKS, AND PROJECT COLLABORATION ENTRY POINTS
                </p>
              </div>
              <button
                type="button"
                onClick={goToHomeTop}
                className="rounded-sm border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-gray-200 transition hover:border-[#c3a152]/40 hover:text-[#c3a152]"
              >
                HOME
              </button>
            </div>

            <section className="relative overflow-hidden rounded-sm border border-white/10 bg-[#111317] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
              <div
                className="pointer-events-none absolute inset-0 opacity-35"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5ca14c]/80 to-transparent" />
              <div className="pointer-events-none absolute -right-24 top-10 h-56 w-56 rounded-full bg-[#48823a]/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-[#4c85e0]/10 blur-3xl" />

              <div className="relative z-10 space-y-8">
                <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[11px] font-mono font-bold uppercase tracking-[0.35em] text-[#5ca14c]">
                      Get in Touch
                    </p>
                    <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                      Let&apos;s connect
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
                      Clean contact paths for project discussions, infrastructure consulting, platform support, and long-term technical collaboration.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleCopyContact("Email", siteSettings.email)}
                    className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-gray-200 transition hover:border-[#5ca14c]/40 hover:text-[#9edc92]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Email
                  </button>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-sm border border-white/10 bg-gradient-to-br from-[#1b1f24] via-[#13161b] to-[#101114] p-6 shadow-[0_0_35px_rgba(0,0,0,0.28)]">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-[#5ca14c]/20 bg-[#5ca14c]/10 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-[#9edc92]">
                      <Signal className="h-3.5 w-3.5" />
                      Professional Brief
                    </div>
                    <p className="text-base leading-8 text-gray-200 sm:text-lg">
                      {professionalBrief}
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <a
                        href={emailMailtoHref}
                        onClick={openEmailClient}
                        className="inline-flex items-center justify-center gap-2 rounded-sm border border-blue-400/30 bg-blue-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-blue-100 transition hover:border-blue-300/60 hover:bg-blue-500/15"
                      >
                        <Mail className="h-4 w-4" />
                        Email Me
                      </a>
                      <button
                        type="button"
                        onClick={() => void handleCopyContact("Email", siteSettings.email)}
                        className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-gray-200 transition hover:border-white/20 hover:bg-white/[0.06]"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Email
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                    <div className="rounded-sm border border-[#c3a152]/20 bg-[#171a1f]/80 p-5">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-[0.28em] text-[#c3a152]">
                        Primary Base
                      </p>
                      <div className="mt-3 flex items-start gap-3">
                        <MapPin className="mt-0.5 h-4 w-4 text-red-400" />
                        <div>
                          <p className="text-sm font-bold text-white">{siteSettings.location}</p>
                          <p className="mt-1 text-xs leading-relaxed text-gray-400">Open to remote collaboration, freelance work, and infrastructure-focused technical roles.</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-sm border border-[#5ca14c]/20 bg-[#171a1f]/80 p-5">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-[0.28em] text-[#5ca14c]">
                        Response Mode
                      </p>
                      <div className="mt-3 flex items-start gap-3">
                        <Mail className="mt-0.5 h-4 w-4 text-blue-300" />
                        <div>
                          <p className="text-sm font-bold text-white">Fast async communication</p>
                          <p className="mt-1 break-all text-xs leading-relaxed text-gray-400">{siteSettings.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-sm border border-[#4c85e0]/20 bg-[#171a1f]/80 p-5">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-[0.28em] text-[#7aa7ff]">
                        Direct Channels
                      </p>
                      <div className="mt-3 flex items-start gap-3">
                        <Phone className="mt-0.5 h-4 w-4 text-[#c3a152]" />
                        <div>
                          <p className="text-sm font-bold text-white">{siteSettings.phone}</p>
                          <p className="mt-1 text-xs leading-relaxed text-gray-400">Phone, WhatsApp, and Viber are available for direct coordination.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                      <Phone className="h-4 w-4 text-[#c3a152]" />
                      <h3 className="text-sm font-black uppercase tracking-[0.24em] text-white">
                        Contact Channels
                      </h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {visibleContactMethods.map((method) => (
                        <ContactMethodCard
                          key={`touch-${method.id}`}
                          eyebrow={method.eyebrow}
                          label={method.label}
                          value={method.value}
                          href={method.href}
                          tone={method.tone}
                          external={method.external}
                          copied={notice?.type === "success" && notice.message.toLowerCase().includes(method.label.toLowerCase())}
                          icon={getContactMethodIcon(method.id)}
                          onCopy={() => void handleCopyContact(method.label, method.copyValue)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                      <Layers3 className="h-4 w-4 text-[#5ca14c]" />
                      <h3 className="text-sm font-black uppercase tracking-[0.24em] text-white">
                        Professional Profiles
                      </h3>
                    </div>
                    <div className="grid gap-3">
                      {professionalNetworkLinks.map((link) =>
                        link.external ? (
                          <a
                            key={link.id}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group rounded-sm border bg-gradient-to-r p-4 transition ${link.accent}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <span className="mt-0.5">{link.icon}</span>
                                <div>
                                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-gray-500">
                                    {link.label}
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-white">{link.label}</p>
                                  <p className="mt-2 break-all text-xs leading-relaxed text-gray-400">{link.value}</p>
                                </div>
                              </div>
                              <ExternalLink className="h-4 w-4 shrink-0 text-gray-500 transition group-hover:text-white" />
                            </div>
                          </a>
                        ) : (
                          <button
                            key={link.id}
                            type="button"
                            onClick={() => void handleCopyContact(link.label, link.value)}
                            className={`w-full rounded-sm border bg-gradient-to-r p-4 text-left transition ${link.accent}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <span className="mt-0.5">{link.icon}</span>
                                <div>
                                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-gray-500">
                                    Team Chat
                                  </p>
                                  <p className="mt-1 text-sm font-bold text-white">{link.label}</p>
                                  <p className="mt-2 break-all text-xs leading-relaxed text-gray-400">{link.value}</p>
                                </div>
                              </div>
                              <Copy className="h-4 w-4 shrink-0 text-gray-500" />
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB: ABOUT ME & CV */}
        {activeTab === "ABOUT" && (
          <div className="space-y-8 animate-fade-in text-gray-200" id="main-about-dossier">
            
            {/* Header branding panel */}
            <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-widest text-[#c3a152] font-display uppercase">
                  ABOUT ME
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  DETAILED INTEL ON APPLICANT BIGENDRA SHRESTHA & HIS CODE MATRIX
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2.5">
                <button 
                  onClick={() => setIsPrintPreviewOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#c3a152]/20 to-[#c3a152]/5 border border-[#c3a152]/40 text-[#c3a152] hover:bg-[#c3a152]/30 text-xs font-bold tracking-widest uppercase rounded-sm flex items-center gap-2 cursor-pointer h-11 active:scale-95 transition-all dota-panel-glow"
                >
                  <Printer className="w-4 h-4 animate-pulse" />
                  <span>PRINT PREVIEW</span>
                </button>
                
                <button 
                  onClick={handleDownloadCV}
                  className="px-4 py-2.5 bg-[#48823a] text-white hover:bg-[#5ca14c] text-xs font-bold tracking-widest uppercase rounded-sm flex items-center gap-2 cursor-pointer h-11 active:scale-95 transition-all shadow-[0_0_15px_rgba(72,130,58,0.2)]"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD CV (PDF)</span>
                </button>
              </div>
            </div>

            {/* Main responsive grid columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left dossier profile col */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Visual spec card with portrait photo */}
                <div className="bg-[#1c1e22]/60 border border-white/15 p-5 rounded-sm dota-panel-glow space-y-5">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-[10px] font-bold text-[#c3a152] tracking-widest font-mono uppercase">APPLICANT SPECIMEN</span>
                    <span className="text-[9px] bg-red-950/40 text-red-400 border border-red-900/30 px-1.5 py-0.5 rounded-sm font-mono font-bold uppercase animate-pulse">ACTIVE JUNIOR RECRUIT</span>
                  </div>

                  {/* Responsive grid for photo matching layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                    {/* Portrait Photo */}
                    <div className="sm:col-span-7 relative aspect-square rounded-sm overflow-hidden border-2 border-[#c3a152]/45 shadow-xl group/prof-img">
                      {profilePhotoSrc ? (
                        <img
                          src={profilePhotoSrc}
                          alt={`${siteSettings.full_name} portrait`}
                          className="w-full h-full object-cover filter brightness-[0.92] contrast-[1.05] group-hover/prof-img:scale-105 group-hover/prof-img:brightness-[1.0] transition-all duration-750"
                          referrerPolicy="no-referrer"
                          onError={handleProfilePhotoError}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#17191d] via-[#111215] to-[#0c0d10] text-center">
                          <div className="space-y-2 px-4">
                            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#c3a152]/70">
                              Portrait Sync
                            </p>
                            <p className="text-xs text-gray-500">No profile image loaded yet.</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Companion info next to portrait */}
                    <div className="sm:col-span-5 space-y-3 font-mono text-xs">
                      <div>
                        <span className="text-gray-500 block text-[9.5px] uppercase font-bold leading-none">REAL NAME</span>
                        <span className="text-white font-black block mt-1 tracking-wide">{siteSettings.full_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9.5px] uppercase font-bold leading-none">LOCATION</span>
                        <span className="text-white font-bold block mt-1">{siteSettings.location}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9.5px] uppercase font-bold leading-none">SIGNATURE ATTRIBUTE</span>
                        <span className="text-blue-400 font-extrabold block mt-1">INTELLIGENCE (118)</span>
                      </div>
                      {/* Mini Companion Picture */}
                      <div className="pt-2 flex items-center gap-2">
                        {virtualShieldSrc ? (
                          <img
                            src={virtualShieldSrc}
                            alt="Potatoka"
                            className="w-8 h-8 rounded-full border border-orange-500/30 object-cover bg-amber-950/20"
                            referrerPolicy="no-referrer"
                            onError={handleVirtualShieldError}
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-500/30 bg-amber-950/20 text-[9px] font-black text-orange-300">
                            BS
                          </div>
                        )}
                        <div className="text-[9px] leading-tight text-gray-400">
                          <span className="block font-black text-orange-400 font-mono">POTATOKA.PY</span>
                          <span>Virtual Shield</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-white/3 border border-white/5 p-2 rounded-sm text-center">
                      <span className="text-[9px] text-gray-500 block">WINRATE ACTIVE</span>
                      <span className="text-[#48823a] text-sm font-black">100% UNBEATEN</span>
                    </div>
                    <div className="bg-white/3 border border-white/5 p-2 rounded-sm text-center">
                      <span className="text-[9px] text-gray-500 block">RELATIONAL GPM</span>
                      <span className="text-[#c3a152] text-sm font-black">850 SEC/TICK</span>
                    </div>
                  </div>
                </div>

                {/* Developer Biography lore */}
                <div className="bg-[#1c1e22]/40 border border-white/5 p-5 rounded-sm space-y-4">
                  <h3 className="text-xs font-extrabold text-[#c3a152] tracking-widest font-mono uppercase pb-1 border-b border-white/5">
                    BIOGRAPHY & SYSTEM VISION
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed text-left">
                    I am an enthusiastic beginner in Python and AI with recent certifications in Python 3.X and Generative AI. I enjoy building data science workflows, preprocessing pipelines, and backend applications using clean code practices.
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed text-left">
                    I am seeking a trainee or internship position where I can apply programming, data analysis, and model-building skills while continuing to learn and contribute with dedication.
                  </p>

                  <div className="space-y-2 pt-2 text-xs">
                    <span className="text-[#c3a152] font-bold font-mono tracking-wider block text-[10px] uppercase">COGNITIVE SKILL DECK:</span>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[11px] text-gray-350">
                      <li className="flex items-center gap-1.5 justify-start">
                        <span className="text-[#48823a]">✔</span> Object-Oriented Dev
                      </li>
                      <li className="flex items-center gap-1.5 justify-start">
                        <span className="text-[#48823a]">✔</span> Data Sanitization
                      </li>
                      <li className="flex items-center gap-1.5 justify-start">
                        <span className="text-[#48823a]">✔</span> Asyncio Web Sockets
                      </li>
                      <li className="flex items-center gap-1.5 justify-start">
                        <span className="text-[#48823a]">✔</span> Scaled DB Indexing
                      </li>
                      <li className="flex items-center gap-1.5 justify-start">
                        <span className="text-[#48823a]">✔</span> ML Matrix Forests
                      </li>
                      <li className="flex items-center gap-1.5 justify-start">
                        <span className="text-[#48823a]">✔</span> Defensive Security
                      </li>
                    </ul>
                  </div>
                </div>

              </div>

              {/* Right CV & Portfolio display hub */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* CV Interactive View Sheet mimicking on-screen documents */}
                <div className="bg-[#1c1e22]/60 border border-white/10 rounded-sm p-6 sm:p-8 dota-panel-glow relative overflow-hidden group/cv-view">
                  {/* Decorative watermarks resembling gaming files */}
                  <div className="absolute right-4 top-4 text-[75px] font-black opacity-[0.015] font-mono select-none pointer-events-none uppercase">CV</div>
                  
                  <div className="space-y-6 text-left">
                    {/* Header bar of on-screen CV */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-3">
                      <div>
                        <h3 className="text-xl font-black text-white font-mono leading-none tracking-wide">{siteSettings.full_name}</h3>
                        <span className="text-xs font-bold text-[#c3a152] uppercase mt-1.5 block">{siteSettings.title}</span>
                      </div>
                      <div className="text-left sm:text-right text-xs font-mono text-gray-400 space-y-1">
                        <a
                          href={emailMailtoHref}
                          onClick={openEmailClient}
                          className="flex items-center sm:justify-end gap-1.5 hover:text-blue-300 transition"
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" /> {siteSettings.email}
                        </a>
                        <p className="flex items-center sm:justify-end gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" /> {siteSettings.location}</p>
                      </div>
                    </div>

                    {/* Section 1: Summary */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-1">
                        <span className="text-[#c3a152] font-mono text-xs font-black">01 //</span>
                        <h4 className="text-xs font-black tracking-widest text-white uppercase font-mono">PROFESSIONAL SUMMARY</h4>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed text-justify">
                        Enthusiastic beginner in Python and AI, recently certified in Python 3.X and Generative AI. Seeking Python, Data Science, or AI trainee/internship opportunities to learn, grow, and contribute practical ML and backend skills.
                      </p>
                    </div>

                    {/* Section 2: Technical Skills */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-1">
                        <span className="text-[#c3a152] font-mono text-xs font-black">02 //</span>
                        <h4 className="text-xs font-black tracking-widest text-white uppercase font-mono">TECHNICAL COMPETENCIES</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        <div className="bg-[#111215]/60 border border-white/5 p-2.5 rounded-sm">
                          <span className="text-[#c3a152] font-bold block text-[10px] uppercase mb-1">CORE SKILLS</span>
                          <span className="text-gray-300">Python, Pandas, NumPy, Matplotlib, Jupyter Notebook, VS Code, Basic Git</span>
                        </div>
                        <div className="bg-[#111215]/60 border border-white/5 p-2.5 rounded-sm">
                          <span className="text-[#c3a152] font-bold block text-[10px] uppercase mb-1">CERTIFICATIONS & TRAINING</span>
                          <span className="text-gray-300">Generative AI Mastermind, Python 3.X, Responsive Web Design, React Development, Internship Certification</span>
                        </div>
                        <div className="bg-[#111215]/60 border border-white/5 p-2.5 rounded-sm">
                          <span className="text-[#c3a152] font-bold block text-[10px] uppercase mb-1">DATA PROJECTS</span>
                          <span className="text-gray-300">House Price Prediction, Phishing Detection Platform, Technical Blog</span>
                        </div>
                        <div className="bg-[#111215]/60 border border-white/5 p-2.5 rounded-sm">
                          <span className="text-[#c3a152] font-bold block text-[10px] uppercase mb-1">TOOLS & ENVIRONMENT</span>
                          <span className="text-gray-300">Jupyter Notebook, GitHub, VS Code, HTML/CSS, JavaScript</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Project Matches Experience */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-1">
                        <span className="text-[#c3a152] font-mono text-xs font-black">03 //</span>
                        <h4 className="text-xs font-black tracking-widest text-white uppercase font-mono">FEATURED PROJECTS</h4>
                      </div>
                      <div className="space-y-4">
                        {PROJECT_MATCHES.map((project) => (
                          <div key={project.matchId} className="space-y-1 bg-[#111215]/30 p-3 rounded-sm border border-white/5">
                            <div className="flex justify-between items-center text-xs">
                              <h5 className="font-bold text-[#c3a152] font-mono">{project.title}</h5>
                              <span className="text-[10px] font-mono text-gray-500 font-bold uppercase">{project.duration}</span>
                            </div>
                            <span className="text-[10px] block text-gray-400 font-mono italic">Role Class: {project.role} | Stack: {project.heroPlayed}</span>
                            <p className="text-xs text-gray-400 leading-relaxed pt-1 text-justify">{project.description}</p>
                            <ul className="list-disc pl-4 text-xs text-gray-550 font-mono space-y-0.5 pt-1.5">
                              {project.impactMetrics.map((metric, i) => (
                                <li key={i}>{metric}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 4: Certifications */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-1">
                        <span className="text-[#c3a152] font-mono text-xs font-black">04 //</span>
                        <h4 className="text-xs font-black tracking-widest text-white uppercase font-mono">CERTIFICATIONS & TRAINING</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-center">
                        {apiCertifications.map((cert) => (
                          <div key={cert.id} className="bg-[#111215]/60 border border-white/5 p-2 rounded-sm flex flex-col justify-between min-h-[58px]">
                            <span className="block font-black text-white leading-tight text-[11px]">{cert.title}</span>
                            <span className="text-[#c3a152] text-[9px] block uppercase font-bold mt-1.5">{cert.issuer}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-1">
                        <span className="text-[#c3a152] font-mono text-xs font-black">05 //</span>
                        <h4 className="text-xs font-black tracking-widest text-white uppercase font-mono">EDUCATION</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        <div className="bg-[#111215]/60 border border-white/5 p-3 rounded-sm">
                          <p className="text-[11px] font-black text-white uppercase">BCA (Bachelor’s in Computer Application)</p>
                          <p className="text-[10px] text-gray-400 mt-1">Saraswati Multiple Campus | 2021 - Present (8th Semester)</p>
                        </div>
                        <div className="bg-[#111215]/60 border border-white/5 p-3 rounded-sm">
                          <p className="text-[11px] font-black text-white uppercase">+2 Science School Leaving Certificate</p>
                          <p className="text-[10px] text-gray-400 mt-1">Whitefield International College | 2018 - 2020</p>
                        </div>
                        <div className="bg-[#111215]/60 border border-white/5 p-3 rounded-sm sm:col-span-2">
                          <p className="text-[11px] font-black text-white uppercase">School Leaving Certificate (SLC)</p>
                          <p className="text-[10px] text-gray-400 mt-1">Chirage Higher Secondary Boarding School | 2001 - 2011</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="flex justify-start">
                  <button 
                    onClick={() => setIsPrintPreviewOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#c3a152] hover:bg-amber-600 text-black text-xs font-black tracking-widest uppercase rounded-sm cursor-pointer whitespace-nowrap active:scale-95 transition flex items-center justify-center gap-1.5 h-11 shadow-[0_0_15px_rgba(195,161,82,0.15)]"
                  >
                    <Printer className="w-3.5 h-3.5 mt-0.5" />
                    <span>LAUNCH PRINT PREVIEW</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 6 REMOVED: DJANGO CODE STACK FILES REFERENCE */}

      </main>

      {/* 2. FEEDBACK & TESTIMONIAL FLOATING HUDBIND (BOTTOM RIGHT DECK) */}
      <div 
        className="fixed bottom-6 right-0 z-40 transition-all duration-500 ease-in-out"
        style={{
          transform: isHudCollapsed ? "translateX(calc(100% - 44px))" : "translateX(0)",
        }}
        onMouseEnter={handleHudMouseEnter}
        onMouseLeave={handleHudMouseLeave}
      >
        <div className="bg-[#1c1e22]/95 border border-white/10 rounded-l-md dota-panel-glow flex items-center shadow-2xl p-2 relative overflow-hidden transition-all duration-300 border-r-0 hover:border-[#c3a152]/30 group/hud">
          
          {/* Collapse / Expand interactive handle */}
          <div 
            className="flex flex-col items-center justify-center cursor-pointer select-none px-2 py-1 text-gray-400 hover:text-[#c3a152] transition-colors gap-1 text-center self-stretch border-r border-white/5 pr-3 mr-2"
            onClick={() => setIsHudCollapsed(!isHudCollapsed)}
          >
            {isHudCollapsed ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c3a152] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c3a152]"></span>
                </span>
                <span className="text-[10px] font-black leading-none text-[#c3a152] animate-[bounce_1.5s_infinite] pt-1">◀</span>
                <span className="text-[8px] font-mono tracking-[0.2em] font-extrabold text-gray-500 [writing-mode:vertical-lr] uppercase select-none mt-1">
                  TESTIMONIALS
                </span>
              </>
            ) : (
              <>
                <span className="text-[9px] font-mono tracking-[0.15em] text-[#c3a152] font-semibold block uppercase">HIDE</span>
                <span className="text-xs font-black text-gray-500 hover:text-white transition-colors">▶</span>
              </>
            )}
          </div>

          {/* The actual deck content - hides smoothly on collapse */}
          <div className={`flex items-center space-x-3 transition-opacity duration-300 ${isHudCollapsed ? "opacity-0 w-0 overflow-hidden pointer-events-none" : "opacity-100"}`}>
            <div className="hidden sm:block text-right whitespace-nowrap pl-1">
              <span className="text-[9px] font-mono block text-gray-500 uppercase leading-none font-bold tracking-widest">PORTFOLIO DECK</span>
              <span className="text-[11px] font-bold text-[#c3a152] block uppercase mt-1">FEEDBACK ACTIVE</span>
            </div>

            <button 
              type="button"
              onClick={() => {
                setFormErrors([]);
                setIsModalOpen(true);
              }} 
              className="h-16 px-6 bg-gradient-to-r from-[#a32c2c] to-[#6b1d1d] border-t border-white/20 shadow-[0_0_20px_rgba(163,44,44,0.4)] flex flex-col items-center justify-center group/btn hover:from-[#c23b3b] hover:shadow-[0_0_25px_rgba(194,59,59,0.5)] transition-all cursor-pointer rounded-none relative overflow-hidden active:scale-95"
            >
              {/* Visual light-sweep/gloss sheen across the button on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
              
              <div className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-white leading-none animate-pulse">Testimonials</span>
              </div>
              <span className="text-sm font-black uppercase text-white mt-1 group-hover/btn:scale-105 transition-all">FEEDBACK ↗</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. CONTACT TESTIMONIAL POPUP MODAL SCREEN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1e22] border border-white/10 w-full max-w-lg rounded-sm shadow-2xl overflow-hidden dota-panel-glow relative">
            
            {/* Header top bar */}
            <div className="bg-[#111215] border-b border-white/10 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#a32c2c] animate-pulse"></span>
                <span className="font-decor tracking-wider text-[#c3a152] font-black text-xs uppercase">SUBMIT PORTFOLIO TESTIMONIAL</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-500 hover:text-white transition text-sm font-bold font-mono bg-transparent border-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              
              <div className="bg-[#101114] border border-white/5 p-4 rounded-sm text-[11px] leading-relaxed text-gray-400 space-y-1.5 font-mono">
                <p className="text-[#c3a152]">&gt;&gt;&gt; SECURE DECK HANDSHAKE TRANSMISSION READY</p>
                <p>RECEIVER ACQUIRED: {siteSettings.full_name} ({siteSettings.title})</p>
                <p>PROTECTION LAYER: Secured cryptographic feedback engine active</p>
              </div>

              {formErrors.length > 0 && (
                <div className="p-3 bg-red-950/20 border border-red-500/50 text-red-400 rounded-sm text-xs space-y-1">
                  <span className="font-bold uppercase">🚨 CONFIGURATION ERRORS LOADED:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {formErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              {testimonialSubmitState === "success" && testimonialSubmitMessage && (
                <div className="rounded-sm border border-green-500/40 bg-green-950/20 p-3 text-xs text-green-200">
                  {testimonialSubmitMessage}
                </div>
              )}

              {testimonialSubmitState === "error" && testimonialSubmitMessage && formErrors.length === 0 && (
                <div className="rounded-sm border border-red-500/40 bg-red-950/20 p-3 text-xs text-red-200">
                  {testimonialSubmitMessage}
                </div>
              )}

              <form onSubmit={handleFormSubmission} className="space-y-4">
                
                {/* Honeypot checkbox invisible for real people, flags bots */}
                <div className="hidden">
                  <input type="text" name="hp_checksum" readOnly value="" />
                </div>

                <div>
                  <label className="block text-gray-500 uppercase text-[10px] font-mono tracking-wider mb-1">Your Name / Organization</label>
                  <input 
                    type="text" 
                    required
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      setFormFieldErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Enter your name or organization identifier..." 
                    className={`bg-[#101114] border text-white px-3 py-2.5 w-full rounded-sm focus:outline-none focus:border-[#c3a152] transition text-xs font-mono ${
                      formFieldErrors.name ? "border-red-500/60" : "border-white/10"
                    }`}
                  />
                  {formFieldErrors.name && <p className="mt-1 text-[11px] text-red-300">{formFieldErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-gray-500 uppercase text-[10px] font-mono tracking-wider mb-1">Your Contact Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formEmail}
                    onChange={(e) => {
                      setFormEmail(e.target.value);
                      setFormFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="Provide a valid secure email address..." 
                    className={`bg-[#101114] border text-white px-3 py-2.5 w-full rounded-sm focus:outline-none focus:border-[#c3a152] transition text-xs font-mono ${
                      formFieldErrors.email ? "border-red-500/60" : "border-white/10"
                    }`}
                  />
                  {formFieldErrors.email && <p className="mt-1 text-[11px] text-red-300">{formFieldErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-gray-500 uppercase text-[10px] font-mono tracking-wider mb-1">Relationship Context</label>
                  <select 
                    required
                    value={formRelationship}
                    onChange={(e) => {
                      setFormRelationship(e.target.value);
                      setFormFieldErrors((prev) => ({ ...prev, relationship: undefined }));
                    }}
                    className={`bg-[#101114] border text-gray-300 px-3 py-2.5 w-full rounded-sm focus:outline-none focus:border-[#c3a152] transition text-xs font-mono appearance-none ${
                      formFieldErrors.relationship ? "border-red-500/60" : "border-white/10"
                    }`}
                  >
                    <option value="" disabled>-- Select Relationship Connection --</option>
                    <option value="manager">Current / Ex Bosses & Managers</option>
                    <option value="client">Clients & Customers</option>
                    <option value="college">College & University Friends</option>
                    <option value="coworker">Colleagues & Coworkers</option>
                    <option value="freelance">Freelance & Casual Projects</option>
                  </select>
                  {formFieldErrors.relationship && <p className="mt-1 text-[11px] text-red-300">{formFieldErrors.relationship}</p>}
                </div>

                <div>
                  <label className="block text-gray-500 uppercase text-[10px] font-mono tracking-wider mb-1">Critique, Feedback, or Testimonial</label>
                  <textarea 
                    required
                    rows={4}
                    value={formMessage}
                    onChange={(e) => {
                      setFormMessage(e.target.value);
                      setFormFieldErrors((prev) => ({ ...prev, message: undefined }));
                    }}
                    placeholder="Write your feedback, suggestions, structural critiques, or provide a dynamic public testimonial..." 
                    className={`bg-[#101114] border text-white px-3 py-2.5 w-full rounded-sm focus:outline-none focus:border-[#c3a152] transition text-xs resize-none font-mono ${
                      formFieldErrors.message ? "border-red-500/60" : "border-white/10"
                    }`}
                  ></textarea>
                  {formFieldErrors.message && <p className="mt-1 text-[11px] text-red-300">{formFieldErrors.message}</p>}
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)} 
                    className="px-5 py-2.5 bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-gray-450 font-bold text-xs tracking-wider uppercase rounded-sm transition cursor-pointer font-mono"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit" 
                    disabled={testimonialSubmitState === "loading"}
                    className="h-11 px-6 bg-gradient-to-r from-[#48823a] to-[#2d5225] text-white font-black text-xs tracking-widest uppercase rounded-sm hover:from-[#5aa349] transition duration-200 border-t border-white/20 shadow-[0_0_15px_rgba(72,130,58,0.3)] cursor-pointer flex items-center justify-center gap-2 font-mono disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {testimonialSubmitState === "loading" ? (
                      <>
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        SENDING...
                      </>
                    ) : (
                      "🚀 TRANSMIT TESTIMONIAL"
                    )}
                  </button>
                </div>

              </form>

            </div>
          </div>
        </div>
      )}

      {/* 4. CV PRINT PREVIEW MODAL SCREEN */}
      {isPrintPreviewOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4" id="cv-print-modal">
          <div className="bg-[#1c1e22] border border-[#c3a152]/40 w-full max-w-4xl h-[90vh] rounded-sm shadow-[0_0_50px_rgba(195,161,82,0.15)] overflow-hidden flex flex-col relative z-50">
            
            {/* Header top bar */}
            <div className="bg-[#111215] border-b border-white/10 px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-[#c3a152] animate-pulse" />
                <span className="font-mono tracking-widest text-[#c3a152] font-black text-xs uppercase">
                  SYSTEM DOSSIER CV PRINT PREVIEW
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    const iframe = document.getElementById("cv-iframe") as HTMLIFrameElement;
                    if (iframe && iframe.contentWindow) {
                      iframe.contentWindow.print();
                    } else {
                      window.print();
                    }
                  }}
                  className="px-3.5 py-1.5 bg-[#c3a152] hover:bg-[#d6b565] text-black text-[11px] font-black tracking-wider uppercase rounded-sm cursor-pointer transition flex items-center gap-1.5 h-8 font-mono"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PRINT</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setIsPrintPreviewOpen(false)} 
                  className="text-gray-450 hover:text-white transition text-base font-bold font-mono bg-transparent border-none cursor-pointer px-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 bg-[#101114] p-4 flex flex-col relative">
              <div className="bg-[#16171a] border border-white/5 p-3 rounded-sm mb-3 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-mono">
                <p className="text-gray-400 text-left">
                  <span className="text-[#c3a152] font-bold">&gt;&gt;&gt;</span> Direct PDF rendering stream active. Standard PDF viewer tools available below.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadCV}
                  disabled={!cvUrl}
                  className="px-4 py-2 bg-[#48823a] text-white hover:bg-[#5ca14c] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-[11px] tracking-wider uppercase rounded-sm flex items-center gap-1.5 cursor-pointer h-8 active:scale-95 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD CV (PDF)</span>
                </button>
              </div>

              {/* PDF Container frame */}
              <div className="bg-[#1c1e22]/60 border border-white/10 rounded-sm relative overflow-hidden flex items-stretch" style={{ minHeight: "60vh" }}>
                {cvUrl ? (
                  <object
                    data={cvUrl}
                    type="application/pdf"
                    className="w-full border-none bg-white"
                    style={{ minHeight: "60vh" }}
                    title={`${siteSettings.full_name} CV PDF Stream`}
                  >
                    <iframe
                      id="cv-iframe"
                      src={`https://docs.google.com/gview?url=${encodeURIComponent(cvUrl)}&embedded=true`}
                      className="w-full border-none bg-white font-mono"
                      style={{ minHeight: "60vh", colorScheme: "light" }}
                      title={`${siteSettings.full_name} CV PDF Stream`}
                    />
                  </object>
                ) : (
                  <div className="text-center px-6 py-10 space-y-3 w-full flex flex-col items-center justify-center">
                    <FileText className="w-10 h-10 text-[#c3a152]/40 mx-auto" />
                    <p className="text-sm font-bold text-white uppercase tracking-wide">No CV Uploaded Yet</p>
                    <p className="text-xs text-gray-500 font-mono">Upload a PDF from the admin panel to activate this preview.</p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Interactive Pixelated Potato Mouse Follower Companion */}
      {potato.active && (
        <div 
          className="fixed pointer-events-none z-50 select-none flex flex-col items-center justify-center filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)]"
          style={{
            left: `${potato.x}px`,
            top: `${potato.y}px`,
            transform: 'translate(16px, 16px)',
          }}
        >
          {/* Render Vector Art Potato for current skin */}
          {getPotatoSkinSVG(potato.skin)}
        </div>
      )}

    </div>
  );
}
