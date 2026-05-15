import type { Metadata } from "next";
import { Inter, Manrope, Open_Sans, Outfit, Playfair_Display, Roboto } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "./ThemeToggle";
import { Toaster } from "sonner"; // ← added

const manrope = Manrope({
  variable: "--next-font-manrope",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--next-font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

import { SidebarProvider } from "./components/SidebarContext";
import AuthSessionProvider from "./components/AuthSessionProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${inter.variable} ${playfair.variable} ${outfit.variable} ${roboto.variable} ${openSans.variable} antialiased scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("theme");var m=window.matchMedia("(prefers-color-scheme: dark)").matches;var d=t==="dark"||(!t&&m);var c=document.documentElement.classList;if(d){c.add("dark")}else{c.remove("dark")}}catch(e){}})();',
          }}
        />
      </head>
      <body className="bg-surface font-body text-on-surface antialiased">
        <AuthSessionProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </AuthSessionProvider>
        <Toaster position="top-center" richColors /> {/* ← added */}
        <ThemeToggle />
      </body>
    </html>
  );
}