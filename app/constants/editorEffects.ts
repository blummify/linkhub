export interface EditorEffect {
  id: string;
  name: string;
  icon: string;
}

export const EDITOR_EFFECTS: EditorEffect[] = [
  // — Ambient / Background ——————————————————————
  { id: "starParticles",  name: "Star Particles",  icon: "✦"  },
  { id: "snowfall",       name: "Snowfall",         icon: "❄"  },
  { id: "aurora",         name: "Aurora",           icon: "🌌" },
  { id: "bokeh",          name: "Bokeh Bubbles",    icon: "🫧" },
  { id: "rain",           name: "Rain",             icon: "🌧" },
  { id: "confetti",       name: "Confetti",         icon: "🎊" },
  { id: "floatingEmoji",  name: "Floating Emoji",   icon: "✨" },
  // — Card / UI ——————————————————————————————————
  { id: "glassmorphism",  name: "Glassmorphism",    icon: "▣"  },
  { id: "neonBorders",    name: "Neon Borders",     icon: "⚡" },
  { id: "gradientBorder", name: "Gradient Border",  icon: "🌈" },
  { id: "shimmer",        name: "Shimmer",          icon: "〰" },
  // — Profile ————————————————————————————————————
  { id: "textGlow",       name: "Text Glow",        icon: "☾"  },
  { id: "pulseRing",      name: "Pulse Ring",       icon: "💫" },
];
