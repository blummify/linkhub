export interface EditorEffect {
  id: string;
  name: string;
  icon: string;
}

export const EDITOR_EFFECTS: EditorEffect[] = [
  { id: "starParticles",  name: "Star Particles", icon: "✦" },
  { id: "snowfall",       name: "Snowfall",        icon: "❄" },
  { id: "glassmorphism",  name: "Glassmorphism",   icon: "▣" },
  { id: "neonBorders",    name: "Neon Borders",    icon: "⚡" },
  { id: "textGlow",       name: "Text Glow",       icon: "☾" },
];
