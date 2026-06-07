export interface BackgroundGradient {
  id: string;
  name: string;
  value: string;
  dark: boolean;
}

export const BACKGROUND_GRADIENTS: BackgroundGradient[] = [
  { id: "midnight",    name: "Midnight",    value: "linear-gradient(135deg, #0b1020 0%, #1e2a8a 100%)", dark: true  },
  { id: "sunset",      name: "Sunset",      value: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)", dark: false },
  { id: "aurora",      name: "Aurora",      value: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)", dark: false },
  { id: "forest",      name: "Forest",      value: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)", dark: true  },
  { id: "ocean",       name: "Ocean",       value: "linear-gradient(135deg, #0891b2 0%, #1e40af 100%)", dark: true  },
  { id: "rose",        name: "Rose",        value: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)", dark: false },
  { id: "bubblegum",   name: "Bubblegum",   value: "linear-gradient(135deg, #f472b6 0%, #c084fc 100%)", dark: false },
  { id: "noir",        name: "Noir",        value: "linear-gradient(135deg, #1c1c1c 0%, #3d3d3d 100%)", dark: true  },
  { id: "golden-hour", name: "Golden Hour", value: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", dark: false },
  { id: "cobalt",      name: "Cobalt",      value: "linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)", dark: true  },
  { id: "lavender",    name: "Lavender",    value: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)", dark: true  },
  { id: "crimson",     name: "Crimson",     value: "linear-gradient(135deg, #9f1239 0%, #be123c 100%)", dark: true  },
];

export function getGradientById(id: string): BackgroundGradient | undefined {
  return BACKGROUND_GRADIENTS.find((g) => g.id === id);
}
