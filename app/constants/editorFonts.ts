export type FontCategory = "serif" | "sans" | "display" | "mono" | "script";

export interface EditorFont {
  id: string;
  name: string;
  /** Stored in DB and used as the CSS font-family value */
  value: string;
  category: FontCategory;
  /** Encoded name for Google Fonts API (spaces as +) */
  googleFamily: string;
  /** True when the font is already bundled via globals.css — no extra load needed */
  preloaded?: boolean;
}

export const EDITOR_FONTS: EditorFont[] = [
  // ── Serif ─────────────────────────────────────────────────────────────────
  { id: "instrument-serif",    name: "Instrument Serif",    value: "Instrument Serif",    category: "serif",   googleFamily: "Instrument+Serif",    preloaded: true  },
  { id: "playfair-display",    name: "Playfair Display",    value: "Playfair Display",    category: "serif",   googleFamily: "Playfair+Display",    preloaded: true  },
  { id: "dm-serif-display",    name: "DM Serif Display",    value: "DM Serif Display",    category: "serif",   googleFamily: "DM+Serif+Display",    preloaded: true  },
  { id: "lora",                name: "Lora",                value: "Lora",                category: "serif",   googleFamily: "Lora"                                  },
  { id: "merriweather",        name: "Merriweather",        value: "Merriweather",        category: "serif",   googleFamily: "Merriweather"                          },
  { id: "eb-garamond",         name: "EB Garamond",         value: "EB Garamond",         category: "serif",   googleFamily: "EB+Garamond"                           },
  { id: "cormorant",           name: "Cormorant Garamond",  value: "Cormorant Garamond",  category: "serif",   googleFamily: "Cormorant+Garamond"                    },
  { id: "libre-baskerville",   name: "Libre Baskerville",   value: "Libre Baskerville",   category: "serif",   googleFamily: "Libre+Baskerville"                     },
  { id: "source-serif",        name: "Source Serif 4",      value: "Source Serif 4",      category: "serif",   googleFamily: "Source+Serif+4"                        },
  { id: "pt-serif",            name: "PT Serif",            value: "PT Serif",            category: "serif",   googleFamily: "PT+Serif"                              },
  { id: "alegreya",            name: "Alegreya",            value: "Alegreya",            category: "serif",   googleFamily: "Alegreya"                              },
  { id: "crimson-text",        name: "Crimson Text",        value: "Crimson Text",        category: "serif",   googleFamily: "Crimson+Text"                          },
  { id: "fraunces",            name: "Fraunces",            value: "Fraunces",            category: "serif",   googleFamily: "Fraunces"                              },
  { id: "spectral",            name: "Spectral",            value: "Spectral",            category: "serif",   googleFamily: "Spectral"                              },

  // ── Sans-serif ────────────────────────────────────────────────────────────
  { id: "geist",               name: "Geist",               value: "Geist",               category: "sans",    googleFamily: "Geist",               preloaded: true  },
  { id: "inter",               name: "Inter",               value: "Inter",               category: "sans",    googleFamily: "Inter"                                 },
  { id: "roboto",              name: "Roboto",              value: "Roboto",              category: "sans",    googleFamily: "Roboto"                                },
  { id: "open-sans",           name: "Open Sans",           value: "Open Sans",           category: "sans",    googleFamily: "Open+Sans"                             },
  { id: "lato",                name: "Lato",                value: "Lato",                category: "sans",    googleFamily: "Lato"                                  },
  { id: "poppins",             name: "Poppins",             value: "Poppins",             category: "sans",    googleFamily: "Poppins"                               },
  { id: "nunito",              name: "Nunito",              value: "Nunito",              category: "sans",    googleFamily: "Nunito"                                },
  { id: "raleway",             name: "Raleway",             value: "Raleway",             category: "sans",    googleFamily: "Raleway"                               },
  { id: "dm-sans",             name: "DM Sans",             value: "DM Sans",             category: "sans",    googleFamily: "DM+Sans"                               },
  { id: "work-sans",           name: "Work Sans",           value: "Work Sans",           category: "sans",    googleFamily: "Work+Sans"                             },
  { id: "jost",                name: "Jost",                value: "Jost",                category: "sans",    googleFamily: "Jost"                                  },
  { id: "outfit",              name: "Outfit",              value: "Outfit",              category: "sans",    googleFamily: "Outfit"                                },
  { id: "plus-jakarta",        name: "Plus Jakarta Sans",   value: "Plus Jakarta Sans",   category: "sans",    googleFamily: "Plus+Jakarta+Sans"                     },
  { id: "manrope",             name: "Manrope",             value: "Manrope",             category: "sans",    googleFamily: "Manrope"                               },
  { id: "figtree",             name: "Figtree",             value: "Figtree",             category: "sans",    googleFamily: "Figtree"                               },
  { id: "urbanist",            name: "Urbanist",            value: "Urbanist",            category: "sans",    googleFamily: "Urbanist"                              },
  { id: "sora",                name: "Sora",                value: "Sora",                category: "sans",    googleFamily: "Sora"                                  },
  { id: "karla",               name: "Karla",               value: "Karla",               category: "sans",    googleFamily: "Karla"                                 },

  // ── Display ───────────────────────────────────────────────────────────────
  { id: "space-grotesk",       name: "Space Grotesk",       value: "Space Grotesk",       category: "display", googleFamily: "Space+Grotesk",       preloaded: true  },
  { id: "montserrat",          name: "Montserrat",          value: "Montserrat",          category: "display", googleFamily: "Montserrat"                            },
  { id: "josefin-sans",        name: "Josefin Sans",        value: "Josefin Sans",        category: "display", googleFamily: "Josefin+Sans"                          },
  { id: "righteous",           name: "Righteous",           value: "Righteous",           category: "display", googleFamily: "Righteous"                             },
  { id: "bebas-neue",          name: "Bebas Neue",          value: "Bebas Neue",          category: "display", googleFamily: "Bebas+Neue"                            },
  { id: "oswald",              name: "Oswald",              value: "Oswald",              category: "display", googleFamily: "Oswald"                                },
  { id: "barlow-condensed",    name: "Barlow Condensed",    value: "Barlow Condensed",    category: "display", googleFamily: "Barlow+Condensed"                      },
  { id: "exo-2",               name: "Exo 2",               value: "Exo 2",               category: "display", googleFamily: "Exo+2"                                 },
  { id: "russo-one",           name: "Russo One",           value: "Russo One",           category: "display", googleFamily: "Russo+One"                             },
  { id: "abril-fatface",       name: "Abril Fatface",       value: "Abril Fatface",       category: "display", googleFamily: "Abril+Fatface"                         },

  // ── Monospace ─────────────────────────────────────────────────────────────
  { id: "geist-mono",          name: "Geist Mono",          value: "Geist Mono",          category: "mono",    googleFamily: "Geist+Mono",          preloaded: true  },
  { id: "space-mono",          name: "Space Mono",          value: "Space Mono",          category: "mono",    googleFamily: "Space+Mono"                            },
  { id: "jetbrains-mono",      name: "JetBrains Mono",      value: "JetBrains Mono",      category: "mono",    googleFamily: "JetBrains+Mono"                        },
  { id: "fira-code",           name: "Fira Code",           value: "Fira Code",           category: "mono",    googleFamily: "Fira+Code"                             },
  { id: "source-code-pro",     name: "Source Code Pro",     value: "Source Code Pro",     category: "mono",    googleFamily: "Source+Code+Pro"                       },
  { id: "ibm-plex-mono",       name: "IBM Plex Mono",       value: "IBM Plex Mono",       category: "mono",    googleFamily: "IBM+Plex+Mono"                         },
  { id: "inconsolata",         name: "Inconsolata",         value: "Inconsolata",         category: "mono",    googleFamily: "Inconsolata"                           },

  // ── Script / Handwriting ─────────────────────────────────────────────────
  { id: "pacifico",            name: "Pacifico",            value: "Pacifico",            category: "script",  googleFamily: "Pacifico"                              },
  { id: "dancing-script",      name: "Dancing Script",      value: "Dancing Script",      category: "script",  googleFamily: "Dancing+Script"                        },
  { id: "satisfy",             name: "Satisfy",             value: "Satisfy",             category: "script",  googleFamily: "Satisfy"                               },
  { id: "great-vibes",         name: "Great Vibes",         value: "Great Vibes",         category: "script",  googleFamily: "Great+Vibes"                           },
  { id: "caveat",              name: "Caveat",              value: "Caveat",              category: "script",  googleFamily: "Caveat"                                },
  { id: "sacramento",          name: "Sacramento",          value: "Sacramento",          category: "script",  googleFamily: "Sacramento"                            },
];

/** All font values as a Set — used for server-side validation */
export const VALID_FONT_VALUES = new Set(EDITOR_FONTS.map((f) => f.value));
