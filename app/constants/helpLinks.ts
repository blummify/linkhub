import { APP_DOMAIN } from "@/lib/appConfig";

/** Icon keys map to components in app/help/components/helpIcons.tsx */
export type HelpIconKey =
  | "link"
  | "palette"
  | "chart"
  | "account"
  | "billing"
  | "sparkle"
  | "globe"
  | "book"
  | "code"
  | "grid"
  | "clock"
  | "activity"
  | "chat"
  | "mail"
  | "users";

/** Popular search terms shown as chips under the hero. */
export const HELP_POPULAR_TERMS = [
  "publish a link",
  "custom domain",
  "change theme",
  "analytics",
] as const;

export type OnboardingStep = {
  id: string;
  title: string;
  meta: string;
  href: string;
  done?: boolean;
};

export const HELP_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "account",
    title: "Create your account",
    meta: "Done — welcome aboard",
    href: "/my-account",
    done: true,
  },
  { id: "first-link", title: "Add your first link", meta: "2 min · Links", href: "/user-dashboard" },
  {
    id: "branding",
    title: "Customize your branding",
    meta: "3 min · Branding",
    href: "/branding",
  },
  {
    id: "share",
    title: "Share your page",
    meta: "1 min · Publish & connect a domain",
    href: "/branding",
  },
];

export type HelpTopic = {
  id: string;
  icon: HelpIconKey;
  title: string;
  description: string;
  count: string;
  href: string;
};

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: "getting-started",
    icon: "sparkle",
    title: "Getting started",
    description: "Set up your workspace and publish your first page.",
    count: "8 articles",
    href: "/user-dashboard",
  },
  {
    id: "managing-links",
    icon: "link",
    title: "Managing links",
    description: "Add, reorder, schedule, and publish links.",
    count: "12 articles",
    href: "/user-dashboard",
  },
  {
    id: "branding-themes",
    icon: "palette",
    title: "Branding & themes",
    description: "Colors, fonts, button shapes, and templates.",
    count: "9 articles",
    href: "/branding",
  },
  {
    id: "analytics",
    icon: "chart",
    title: "Analytics",
    description: "Track visits, clicks, and growth over time.",
    count: "6 articles",
    href: "/user-analytics",
  },
  {
    id: "domains",
    icon: "globe",
    title: "Domains",
    description: "Connect a custom domain and set up DNS.",
    count: "5 articles",
    href: "/my-account",
  },
  {
    id: "account-billing",
    icon: "billing",
    title: "Account & billing",
    description: "Plans, invoices, seats, and security.",
    count: "7 articles",
    href: "/billing",
  },
];

export type FaqItem = { id: string; question: string; answer: string };
export type FaqGroup = { id: string; label: string; icon: HelpIconKey; items: FaqItem[] };

export const HELP_FAQ_GROUPS: FaqGroup[] = [
  {
    id: "links-pages",
    label: "Links & pages",
    icon: "link",
    items: [
      {
        id: "publish-link",
        question: "How do I publish a link?",
        answer:
          "Open Links on your dashboard, add or edit a link, then turn on Publish. Only published links appear on your public page. Changes go live instantly — no re-deploy needed.",
      },
      {
        id: "reorder-schedule",
        question: "Can I reorder or schedule my links?",
        answer:
          "Drag any link by its handle to reorder. To schedule, open a link's settings and set a go-live and expiry date — it will appear and disappear automatically.",
      },
      {
        id: "link-not-showing",
        question: "Why isn't my link showing on my page?",
        answer:
          "Three things to check: the link is toggled Published, it's not scheduled for a future date, and your page itself is published. If all three are set, try a hard refresh.",
      },
    ],
  },
  {
    id: "branding-themes",
    label: "Branding & themes",
    icon: "palette",
    items: [
      {
        id: "change-theme",
        question: "How do I change my page theme?",
        answer:
          "Go to Branding, pick a theme under Themes & templates, then fine-tune accent color, fonts, and button shape in Quick tune. A live preview updates as you edit.",
      },
      {
        id: "custom-fonts-colors",
        question: "Can I use my own brand fonts and colors?",
        answer:
          "Yes. Set custom hex colors anywhere a color appears, and choose from 40+ fonts. On Pro, you can upload custom web fonts and save reusable brand kits.",
      },
    ],
  },
  {
    id: "domains",
    label: "Domains",
    icon: "globe",
    items: [
      {
        id: "connect-domain",
        question: "How do I connect a custom domain?",
        answer:
          "In My account → Domains, add your domain and copy the CNAME record into your DNS provider. Verification usually completes within an hour, and SSL is issued automatically.",
      },
      {
        id: "domain-pending",
        question: 'My domain says "pending" — what now?',
        answer:
          "DNS changes can take up to 24 hours to propagate. Double-check the CNAME value matches exactly and has no trailing dot. Still stuck after a day? Contact support with your domain name.",
      },
    ],
  },
  {
    id: "account-billing",
    label: "Account & billing",
    icon: "billing",
    items: [
      {
        id: "pro-features",
        question: "What's included in Linkhub Pro?",
        answer:
          "Pro unlocks advanced analytics, unlimited links, custom fonts, brand kits, and priority support. You can compare plans and upgrade anytime from Billing.",
      },
      {
        id: "update-payment",
        question: "How do I update my payment method?",
        answer:
          "Open Billing → Payment method to add or replace a card. Past invoices are available to download as PDFs in the same section.",
      },
    ],
  },
];

export type DocLink = {
  id: string;
  icon: HelpIconKey;
  title: string;
  description: string;
  href: string;
  external?: boolean;
};

export const HELP_DOC_LINKS: DocLink[] = [
  {
    id: "help-center",
    icon: "book",
    title: "Help center",
    description: "All articles, organized by topic",
    href: "/help",
  },
  {
    id: "api",
    icon: "code",
    title: "API reference",
    description: "Build with the Linkhub API & webhooks",
    href: "https://docs.linkhub.io/api",
    external: true,
  },
  {
    id: "integrations",
    icon: "grid",
    title: "Integrations",
    description: "Connect Mailchimp, Stripe, Zapier & more",
    href: "https://docs.linkhub.io/integrations",
    external: true,
  },
  {
    id: "changelog",
    icon: "clock",
    title: "Changelog",
    description: "What's new in Linkhub",
    href: "/features",
  },
  {
    id: "status",
    icon: "activity",
    title: "System status",
    description: "All systems operational",
    href: "https://status.linkhub.io",
    external: true,
  },
];

export type ContactChannel = {
  id: string;
  icon: HelpIconKey;
  title: string;
  description: string;
  href: string;
  external?: boolean;
  /** Shows a green "online" pill when true. */
  online?: boolean;
};

export const HELP_CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: "chat",
    icon: "chat",
    title: "Live chat",
    description: "Chat with the support team now",
    href: "mailto:support@linkhub.io",
    external: true,
    online: true,
  },
  {
    id: "email",
    icon: "mail",
    title: "Email support",
    description: "support@linkhub.io · replies in ~3h",
    href: "mailto:support@linkhub.io",
    external: true,
  },
  {
    id: "community",
    icon: "users",
    title: "Community forum",
    description: "Tips and answers from other creators",
    href: "https://community.linkhub.io",
    external: true,
  },
];

/** Shareable public-URL hint used in hero / docs copy. */
export const HELP_PUBLIC_URL_EXAMPLE = `${APP_DOMAIN}/your-handle`;
