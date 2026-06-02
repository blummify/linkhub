import type { Metadata } from "next";
import { Inter, Manrope, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "./ThemeToggle";
import { Toaster } from "sonner";
import AuthSessionProvider from "./components/AuthSessionProvider";
import { BrandingHydrator } from "./components/BrandingHydrator";
import { MaterialSymbols } from "./components/MaterialSymbols";
import { GoogleOneTap } from "./components/auth/GoogleOneTap";
import { auth } from "@/auth";

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
  weight: ["400", "600", "700", "800"],
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
      className={`${manrope.variable} ${inter.variable} ${instrumentSerif.variable} antialiased scroll-smooth`}
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
        {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
          <script
            src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
            async
            defer
          />
        ) : null}
      </head>
      <body className="bg-surface font-body text-on-surface antialiased">
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
