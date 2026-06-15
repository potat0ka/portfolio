// src/portfolio_data.ts

export interface HeroProfile {
  name: string;
  codename: string;
  title: string;
  roleClass: string;
  level: string;
  currentXp: string;
  guild: string;
  winRate: string;
  matchesPlayed: number;
  kdaRatio: string;
  gpm: number;
  xpm: number;
  attributes: {
    strength: string; // For system resilience/PostgreSQL
    agility: string;  // For API latency/speed
    intelligence: string; // For analytical engines/Python/Data Science
    primary: "STRENGTH" | "AGILITY" | "INTELLIGENCE";
  };
}

export interface TechItem {
  id: number;
  name: string;
  category: string;
  quality: "Common" | "Rare" | "Mythical" | "Legendary" | "Immortal";
  statBoost: string;
  coolDown: string;
  passiveDesc: string;
  usageDesc?: string;
  synergy: string;
  iconName: string;
}

export interface WorkPatch {
  version: string;
  date: string;
  title: string;
  category: string;
  changes: string[];
}

export interface ProjectMatch {
  matchId: string;
  title: string;
  heroPlayed: string;
  duration: string;
  outcome: "VICTORY" | "DEFEAT";
  gpm: number;
  role: string;
  techKeywords: string[];
  description: string;
  impactMetrics: string[];
}

export interface CertificationAbility {
  name: string;
  issuer: string;
  date: string;
  abilityType: "Passive Aura" | "Active Trigger" | "Passive Buff";
  cooldown: string;
  description: string;
  statBoost: string;
}

export const HERO_PROFILE: HeroProfile = {
  name: "Bigendra Shrestha",
  codename: "potatoka",
  title: "Python & AI Trainee | Data Science Intern Aspirant",
  roleClass: "Early Career Python / Data Science Explorer",
  level: "Proficient / Competent",
  currentXp: "11,200 / 20,000 XP",
  guild: "[Python] Learner to Leader",
  winRate: "100%",
  matchesPlayed: 8,
  kdaRatio: "10.6 / 1.0 / 6.8",
  gpm: 710,
  xpm: 780,
  attributes: {
    strength: "Proficient / Competent",
    agility: "Familiar / Beginner",
    intelligence: "Expert / Advanced",
    primary: "INTELLIGENCE"
  }
};

export const TECH_ITEMS: TechItem[] = [
  {
    id: 1,
    name: "Orb of Python",
    category: "Core Language",
    quality: "Mythical",
    statBoost: "+50 Base Logic",
    coolDown: "0.1s",
    passiveDesc: "Grants absolute core proficiency in Python syntax, structures, asyncio loops, advanced concurrency, and manual memory garbage collection tuning.",
    usageDesc: "Enables instant computation profiles across standard data matrices and server tasks.",
    synergy: "Boosts integration velocity with analytical science tools.",
    iconName: "Binary"
  },
  {
    id: 2,
    name: "Aegis of Django",
    category: "Web Framework",
    quality: "Immortal",
    statBoost: "+120 Security Pool",
    coolDown: "Instant",
    passiveDesc: "Deploys a robust monolithic fortress. Features automated database migrations, safe ORM queries, integrated route handling, and strict CSRF shields.",
    usageDesc: "Guarantees complete protection against malicious cross-site scripting attacks.",
    synergy: "Grants continuous uptime; prevents application failure states.",
    iconName: "ShieldCheck"
  },
  {
    id: 3,
    name: "Staff of Pandas & NumPy",
    category: "Analytical Logic",
    quality: "Mythical",
    statBoost: "+35% Aggregated Damage",
    coolDown: "5.0s",
    passiveDesc: "Allows instant vector calculation and matrix multiplication. Drastically accelerates data aggregation, CSV scrub cycles, and dataset cleansing pipelines.",
    usageDesc: "Converts large-scale multi-gigabyte files into structured arrays in milliseconds.",
    synergy: "Boosts training throughput speeds of local machine learning blades.",
    iconName: "TableOfContents"
  },
  {
    id: 4,
    name: "Scikit-Learn Blade",
    category: "Machine Learning",
    quality: "Legendary",
    statBoost: "+80 Predictive Precision",
    coolDown: "8.0s",
    passiveDesc: "Launches decision forests, gradient boost models, preprocessing scaling algorithms, and linear regression charts to forecast key outcome numbers.",
    usageDesc: "Automatically categorizes and labels raw continuous clusters with high clarity.",
    synergy: "Adds a 94.6% accuracy strike to any standard transaction pipeline.",
    iconName: "Brain"
  },
  {
    id: 5,
    name: "PostgreSQL Database Shard",
    category: "Dynamic Storage",
    quality: "Rare",
    statBoost: "+500 Integrity Shield",
    coolDown: "Passive",
    passiveDesc: "Unlocks relational index schemes, multi-row transaction stability (ACID), JSONB high-density columns, and finely indexed query strategies.",
    usageDesc: "Instantly persists application memory without lag, even under immense heavy loads.",
    synergy: "Prevents query bottlenecks of complex data streams.",
    iconName: "Database"
  },
  {
    id: 6,
    name: "Git Link of Unity",
    category: "Collaboration Tool",
    quality: "Common",
    statBoost: "+15 Speed Coordination",
    coolDown: "Passive",
    passiveDesc: "Synchronizes branches, merges requests, handles conflict resolutions, and establishes automated deployment workflows (Github Actions).",
    usageDesc: "Organizes multihand collaborative code structures with clear traceability.",
    synergy: "Amplifies team alignment across decentralized regional developers.",
    iconName: "GitMerge"
  }
];

export const WORK_PATCHES: WorkPatch[] = [
  {
    version: "v3.15.0",
    date: "June 2026",
    title: "STRENGTHENING BACKEND THROUGHPUT & SECURE INFRASTUCTURES",
    category: "Dynamic Project Developer Core",
    changes: [
      "Django REST Framework: Mana cost of nested serializers reduced. Optimized select_related and prefetch_related filters, dropping search database query latencies by 42%.",
      "Data Pipelines: Substituted standard iteration loops with Pandas vectorized mapping matrices, boosting aggregate ingestion speeds by 18%.",
      "Relational Tuning: Established precise secondary indexes in key tables, neutralizing system cooldown lag during periods of heavy writes.",
      "Security Buff Activation: Enforced strict csrf cryptographic cookie tokens, hardened headers, and locked frame embedded clickjack routes."
    ]
  },
  {
    version: "v3.12.2",
    date: "November 2025",
    title: "ALGORITHMIC TARGETING MODELS & SERVER CLUSTERING",
    category: "Academic & Data Science Explorer",
    changes: [
      "Predictive Targeting Strategy: Integrated automated Scikit-Learn classifier arrays in server side, predicting recruiter matchmaking requests with 94.6% accuracy.",
      "Memory Stability Patch: Isolated a system leakage in massive matrix logs. Re-arranged operations to reuse pre-allocated NumPy storage buffers.",
      "API Autodocs Upgrade: Set up automated OpenAPI definitions generator, aligning frontend devs binding speeds on the main interface."
    ]
  },
  {
    version: "v3.08.0",
    date: "February 2024",
    title: "LEGACY PIPELINE SCALE & INFRASTRUCTURE AUTOMATION",
    category: "IT Tech Enthusiast Core",
    changes: [
      "Automated Migration Engine: Drafted 150+ robust Django database migration schemas, seamlessly moving legacy shards with zero active gameplay disconnects.",
      "Analytics Dashboard Buff: Programmed customizable visual metric filters, allowing recruiters real-time insights into system health benchmarks.",
      "Error Isolation Systems: Configured automated logs notifying channel units immediately upon server request failures."
    ]
  }
];

export const PROJECT_MATCHES: ProjectMatch[] = [
  {
    matchId: "PROJECT #001",
    title: "Personal Technical Blog",
    heroPlayed: "Python + Static Web",
    duration: "Ongoing",
    outcome: "VICTORY",
    gpm: 360,
    role: "Author / Developer",
    techKeywords: ["Python", "HTML", "CSS", "GitHub Pages"],
    description: "Designed and published a personal technical blog to share Python experimentation, data science learning notes, and small automation projects.",
    impactMetrics: [
      "Published developer content on GitHub Pages",
      "Maintains a growing technical portfolio of Python and data science articles",
      "Demonstrates consistent project documentation and learning progress"
    ]
  },
  {
    matchId: "PROJECT #002",
    title: "Phishing Detection Platform",
    heroPlayed: "Python + Machine Learning",
    duration: "3 Months",
    outcome: "VICTORY",
    gpm: 720,
    role: "Data Science Developer",
    techKeywords: ["Python", "Pandas", "NumPy", "Machine Learning"],
    description: "Built a phishing detection platform with Python, using data preprocessing and feature analysis to identify suspicious URL patterns.",
    impactMetrics: [
      "Implemented dataset processing for phishing classification",
      "Published the codebase publicly on GitHub",
      "Validated model predictions on sample phishing cases"
    ]
  },
  {
    matchId: "PROJECT #003",
    title: "House Price Prediction System",
    heroPlayed: "Data Science + Python",
    duration: "1 Month",
    outcome: "VICTORY",
    gpm: 650,
    role: "Data Science Intern",
    techKeywords: ["Python", "Pandas", "Scikit-Learn", "Matplotlib"],
    description: "Developed a house price prediction system using data science workflows and regression modeling shared during an online webinar.",
    impactMetrics: [
      "Designed a data science pipeline for housing prices",
      "Visualized model outputs with Matplotlib plots",
      "Delivered webinar-ready demo content for learners"
    ]
  }
];

export const CERTIFICATIONS: CertificationAbility[] = [
  {
    name: "Generative AI Mastermind",
    issuer: "Outskill",
    date: "Nov 2025",
    abilityType: "Passive Aura",
    cooldown: "Constant",
    description: "Demonstrates foundational generative AI training and practical model understanding for early-career AI tasks.",
    statBoost: "+20 AI Insight"
  },
  {
    name: "House Price Prediction System using Data Science & ML",
    issuer: "SkillEcted (Webinar)",
    date: "Oct 2025",
    abilityType: "Active Trigger",
    cooldown: "45.0 Seconds",
    description: "Showcases a complete housing price prediction workflow built with Python data science tools and regression modeling.",
    statBoost: "+18 Predictive Accuracy"
  },
  {
    name: "Programming with Python 3.X",
    issuer: "Simplilearn SkillUp",
    date: "Oct 2025",
    abilityType: "Passive Buff",
    cooldown: "Instant Trigger",
    description: "Confirms strong Python fundamentals, modern language features, and scripting capability for software tasks.",
    statBoost: "+22 Python Mastery"
  },
  {
    name: "90-hour Learner-to-Leader Internship",
    issuer: "Nobel Fundamentals, USA",
    date: "May 2025",
    abilityType: "Passive Aura",
    cooldown: "Constant",
    description: "Reflects disciplined learning and completion of a structured internship program in software fundamentals.",
    statBoost: "+15 Leadership Momentum"
  },
  {
    name: "Responsive Web Design",
    issuer: "FreeCodeCamp.org",
    date: "Sep 2023",
    abilityType: "Passive Buff",
    cooldown: "Instant Trigger",
    description: "Validates responsive web fundamentals, HTML/CSS skills, and modern page layout practices.",
    statBoost: "+14 UI Adaptability"
  },
  {
    name: "Software Development with React",
    issuer: "Kathmandu Metropolitan City",
    date: "Jan 2023",
    abilityType: "Active Trigger",
    cooldown: "60.0 Seconds",
    description: "Demonstrates practical React development experience through a focused two-month training course.",
    statBoost: "+18 Frontend Agility"
  }
];
