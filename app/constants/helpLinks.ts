export type HelpLinkItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
};

export const HELP_CENTER_LINKS: HelpLinkItem[] = [
  {
    id: "features",
    title: "What's new",
    description: "Latest features and product updates",
    href: "/features",
  },
  {
    id: "branding",
    title: "Customize branding",
    description: "Themes, fonts, colors, and button shapes",
    href: "/branding",
  },
  {
    id: "analytics",
    title: "View analytics",
    description: "Track visits, clicks, and growth over time",
    href: "/user-analytics",
  },
  {
    id: "support",
    title: "Contact support",
    description: "We usually reply within a few hours",
    href: "mailto:support@linkhub.io",
    external: true,
  },
];

export const HELP_FAQ: { question: string; answer: string }[] = [
  {
    question: "How do I publish a link?",
    answer:
      "Open Links on your dashboard, add or edit a link, then turn on Publish. Only published links appear on your public page.",
  },
  {
    question: "How do I change my page theme?",
    answer:
      "Go to Branding, pick a theme under Themes & templates, then fine-tune accent color, fonts, and button shape in Quick tune.",
  },
  {
    question: "Where can I see my public URL?",
    answer:
      "Your handle appears in the live preview on Branding and Links. Share linkhub.co/yourhandle once your profile is set up.",
  },
];
