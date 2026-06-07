export interface TemplateImage {
  id: string;
  name: string;
  url: string;
  thumb: string;
  dark: boolean;
}

export const TEMPLATE_IMAGES: TemplateImage[] = [
  {
    id: "night-sky",
    name: "Night Sky",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1080&q=80&fit=crop",
    thumb: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&q=60&fit=crop",
    dark: true,
  },
  {
    id: "mountains",
    name: "Mountains",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&q=80&fit=crop",
    thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=60&fit=crop",
    dark: true,
  },
  {
    id: "ocean",
    name: "Ocean",
    url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1080&q=80&fit=crop",
    thumb: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=200&q=60&fit=crop",
    dark: true,
  },
  {
    id: "city-night",
    name: "City Night",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1080&q=80&fit=crop",
    thumb: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200&q=60&fit=crop",
    dark: true,
  },
  {
    id: "marble",
    name: "Marble",
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&q=80&fit=crop",
    thumb: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=60&fit=crop",
    dark: false,
  },
  {
    id: "bokeh",
    name: "Bokeh",
    url: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=1080&q=80&fit=crop",
    thumb: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=200&q=60&fit=crop",
    dark: true,
  },
  {
    id: "neon",
    name: "Neon",
    url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&q=80&fit=crop",
    thumb: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&q=60&fit=crop",
    dark: true,
  },
  {
    id: "forest",
    name: "Forest",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1080&q=80&fit=crop",
    thumb: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=60&fit=crop",
    dark: true,
  },
];
