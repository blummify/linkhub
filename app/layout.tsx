import type { Metadata, Viewport } from "next";
import {
  Inter,
  Manrope,
  Instrument_Serif,
  Caveat,
  Geist,
  Geist_Mono,
  Playfair_Display,
  Space_Grotesk,
  DM_Serif_Display,
} from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "./ThemeToggle";
import { Toaster } from "sonner";
import AuthSessionProvider from "./components/AuthSessionProvider";
import { BrandingHydrator } from "./components/BrandingHydrator";
import { MaterialSymbols } from "./components/MaterialSymbols";
import { GoogleOneTap } from "./components/auth/GoogleOneTap";
import { auth } from "@/auth";

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--next-font-manrope",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["500"],
  style: ["normal", "italic"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--next-font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LinkHub",
    template: "%s | LinkHub",
  },
  description:
    "Consolidate your digital presence into a single, high-converting editorial stage.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "LinkHub — Your link in bio, elevated",
    description: "Consolidate your digital presence into a single, high-converting editorial stage.",
    url: "https://linkhub.app",
    siteName: "LinkHub",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkHub — Your link in bio, elevated",
    description: "Consolidate your digital presence into a single, high-converting editorial stage.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b46e0",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${inter.variable} ${instrumentSerif.variable} ${caveat.variable} ${geist.variable} ${geistMono.variable} ${playfairDisplay.variable} ${spaceGrotesk.variable} ${dmSerifDisplay.variable} antialiased scroll-smooth`}
    >
      <head>
        {/* fonts.gstatic.com hosts the Material Symbols woff2 — prefetch the DNS early */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("theme");var m=window.matchMedia("(prefers-color-scheme: dark)").matches;var d=t==="dark"||(!t&&m);var c=document.documentElement.classList;if(d){c.add("dark")}else{c.remove("dark")}}catch(e){}})();',
          }}
        />
      </head>
      <body className="bg-surface font-body text-on-surface antialiased">
        <a
          href="#mainContent"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-4 focus:left-4 focus:bg-white focus:text-primary focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-semibold focus:text-sm"
        >
          Skip to main content
        </a>
        <MaterialSymbols />
        <BrandingHydrator />
        <AuthSessionProvider session={session}>
          {children}
        </AuthSessionProvider>
        {!session && process.env.GOOGLE_CLIENT_ID && (
          <GoogleOneTap clientId={process.env.GOOGLE_CLIENT_ID} />
        )}
        <Toaster position="top-center" richColors />
        <ThemeToggle />
      </body>
    </html>
  );
}
