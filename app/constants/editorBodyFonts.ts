export interface BodyFont {
  id: string;
  name: string;
  value: string;
  stack: string;
}

export const BODY_FONTS: BodyFont[] = [
  {
    id: "geist",
    name: "Geist",
    value: "Geist",
    stack: '"Geist", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    value: "DM Sans",
    stack: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: "inter",
    name: "Inter",
    value: "Inter",
    stack: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: "mono",
    name: "Mono",
    value: "Geist Mono",
    stack: '"Geist Mono", ui-monospace, "Cascadia Code", monospace',
  },
];
