// src/hooks/usePortfolioApi.ts
// Centralised API data fetching for all dynamic portfolio data.

import { useState, useEffect, useCallback } from "react";

import { fetchJson } from "../lib/api";

export interface ApiSiteSettings {
  id: number;
  full_name: string;
  title: string;
  bio: string;
  location: string;
  phone: string;
  whatsapp: string;
  viber: string;
  email: string;
  github: string;
  linkedin: string;
}

export interface ApiProfileAsset {
  id: number;
  profile_photo: string | null;
  hero_image: string | null;
  updated_at?: string;
}

export interface ApiCVAsset {
  id: number;
  cv_pdf: string | null;
  updated_at?: string;
}

export interface ApiCertification {
  id: number;
  title: string;
  issuer: string;
  issue_date: string;
  description: string;
  thumbnail_image: string | null;
  certificate_pdf: string;
  updated_at?: string;
}

export interface ApiSkill {
  id: number;
  name: string;
  category: string;
  level: string;
  icon_slug: string;
  order: number;
  updated_at?: string;
}

export interface ApiProjectMatch {
  id: number;
  matchId: string;
  title: string;
  heroPlayed: string;
  duration: string;
  outcome: string;
  gpm: number;
  role: string;
  techKeywords: string[];
  description: string;
  impactMetrics: string[];
  updated_at?: string;
}

export interface ApiWorkPatch {
  id: number;
  version: string;
  date: string;
  title: string;
  category: string;
  changes: string[];
  created_at?: string;
  updated_at?: string;
}

export type ApiContactMethod = {
  id: string;
  eyebrow: string;
  label: string;
  value: string;
  href: string;
  copyValue: string;
  tone: "gold" | "green" | "violet" | "blue";
  external?: boolean;
};

function useApiResource<T>(
  path: string,
  fallback: T
): { data: T; loading: boolean; error: string | null; reload: () => Promise<void> } {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchJson<T>(path);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}

const DEFAULT_SETTINGS: ApiSiteSettings = {
  id: 0,
  full_name: "Bigendra Shrestha",
  title: "Python & AI Trainee | Data Science Intern Aspirant",
  bio: "I am an enthusiastic beginner in Python and AI with recent certifications in Python 3.X and Generative AI.",
  location: "Kathmandu, Nepal",
  phone: "+977 9860297032",
  whatsapp: "+977 9860297032",
  viber: "+977 9860297032",
  email: "Bige.stha@gmail.com",
  github: "https://github.com/potat0ka",
  linkedin: "https://www.linkedin.com/in/bigendrashrestha/",
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function buildMailtoLink(settings: ApiSiteSettings) {
  const params = new URLSearchParams();
  params.set("subject", "Portfolio inquiry from your website");
  params.set("body", `Hi ${settings.full_name.split(" ")[0]},\n\nI found your portfolio and would like to discuss a project/opportunity.\n\nThanks,`);
  return `mailto:${settings.email}?${params.toString()}`;
}

export function buildContactMethods(settings: ApiSiteSettings): ApiContactMethod[] {
  const phoneRaw = digitsOnly(settings.phone);
  const whatsappDigits = digitsOnly(settings.whatsapp);
  const viberDigits = digitsOnly(settings.viber);

  return [
    {
      id: "phone",
      eyebrow: "Cellular phone unit",
      label: "Call by phone",
      value: settings.phone,
      href: phoneRaw ? `tel:+${phoneRaw}` : "#",
      copyValue: settings.phone,
      tone: "gold",
    },
    {
      id: "whatsapp",
      eyebrow: "WhatsApp portal",
      label: "Connect on WhatsApp",
      value: settings.whatsapp,
      href: whatsappDigits ? `https://wa.me/${whatsappDigits}` : "#",
      copyValue: settings.whatsapp,
      tone: "green",
      external: true,
    },
    {
      id: "viber",
      eyebrow: "Viber direct chat",
      label: "Open Viber conversation",
      value: settings.viber,
      href: viberDigits ? `viber://chat/${viberDigits}` : "#",
      copyValue: settings.viber,
      tone: "violet",
    },
    {
      id: "email",
      eyebrow: "SMTP email core",
      label: "Draft an email",
      value: settings.email,
      href: buildMailtoLink(settings),
      copyValue: settings.email,
      tone: "blue",
    },
  ] as ApiContactMethod[];
}

export function useSiteSettings() {
  return useApiResource<ApiSiteSettings>("/settings/", DEFAULT_SETTINGS);
}

export function useProfileAsset() {
  return useApiResource<ApiProfileAsset>("/profile/", { id: 0, profile_photo: null, hero_image: null });
}

export function useCVAsset() {
  return useApiResource<ApiCVAsset>("/cv/", { id: 0, cv_pdf: null });
}

export function useCertifications() {
  return useApiResource<ApiCertification[]>("/certificates/", []);
}

export function useSkills() {
  return useApiResource<ApiSkill[]>("/skills/", []);
}

export function useProjectMatches() {
  return useApiResource<ApiProjectMatch[]>("/project-matches/", []);
}

export function useWorkPatches() {
  return useApiResource<ApiWorkPatch[]>("/patches/", []);
}
