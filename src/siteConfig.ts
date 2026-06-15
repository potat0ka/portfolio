export type ContactMethod = {
  id: string;
  eyebrow: string;
  label: string;
  value: string;
  href: string;
  copyValue: string;
  tone: "gold" | "green" | "violet" | "blue";
  external?: boolean;
};

export const CONTACT_EMAIL = "Bige.stha@gmail.com";
export const CONTACT_PHONE_DISPLAY = "+977 9860297032";
export const CONTACT_PHONE_RAW = "+9779860297032";
export const CONTACT_WHATSAPP_DIGITS = "9779860297032";
export const CONTACT_VIBER_DIGITS = "9779860297032";
export const CONTACT_LOCATION = "Mhepi Janamargha-16, Kathmandu, Nepal";

export function buildMailtoLink({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body?: string;
}) {
  const params = new URLSearchParams();
  params.set("subject", subject);
  if (body) {
    params.set("body", body);
  }
  return `mailto:${to}?${params.toString()}`;
}

export const EMAIL_MAILTO_HREF = buildMailtoLink({
  to: CONTACT_EMAIL,
  subject: "Portfolio inquiry from your website",
  body: "Hi Bigendra,\n\nI found your portfolio and would like to discuss a project/opportunity.\n\nThanks,",
});

export const CONTACT_METHODS: ContactMethod[] = [
  {
    id: "phone",
    eyebrow: "Cellular phone unit",
    label: "Call by phone",
    value: CONTACT_PHONE_DISPLAY,
    href: `tel:${CONTACT_PHONE_RAW}`,
    copyValue: CONTACT_PHONE_RAW,
    tone: "gold",
  },
  {
    id: "whatsapp",
    eyebrow: "WhatsApp portal",
    label: "Connect on WhatsApp",
    value: CONTACT_PHONE_DISPLAY,
    href: `https://wa.me/${CONTACT_WHATSAPP_DIGITS}`,
    copyValue: CONTACT_PHONE_RAW,
    tone: "green",
    external: true,
  },
  {
    id: "viber",
    eyebrow: "Viber direct chat",
    label: "Open Viber conversation",
    value: CONTACT_PHONE_DISPLAY,
    href: `viber://chat/${CONTACT_VIBER_DIGITS}`,
    copyValue: CONTACT_PHONE_RAW,
    tone: "violet",
  },
  {
    id: "email",
    eyebrow: "SMTP email core",
    label: "Draft an email",
    value: CONTACT_EMAIL,
    href: EMAIL_MAILTO_HREF,
    copyValue: CONTACT_EMAIL,
    tone: "blue",
  },
];

export const SOCIAL_LINKS = [
  {
    id: "github",
    label: "GITHUB ↗",
    href: "https://github.com/potat0ka",
  },
  {
    id: "linkedin",
    label: "LINKEDIN ↗",
    href: "https://www.linkedin.com/in/bigendrashrestha/",
  },
];
