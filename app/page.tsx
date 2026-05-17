import Image from "next/image";
import Link from "next/link";
import { PublicNav } from "./components/PublicNav";
import { SiteFooter } from "./components/SiteFooter";
import { HomeHeroSection } from "./components/HomeHeroSection";
import { HomeScrollReveal } from "./components/HomeScrollReveal";

export default function Home() {
  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-x-hidden">
      <div className="fixed inset-0 -z-30 overflow-hidden pointer-events-none">
        <div className="bg-orb absolute top-[10%] left-[5%] w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
        <div className="bg-orb absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-secondary/5 blur-[150px] rounded-full" style={{ animationDelay: "-5s" }} />
        <div className="bg-orb absolute top-[40%] right-[30%] w-64 h-64 bg-indigo-200/10 blur-[100px] rounded-full" style={{ animationDelay: "-10s" }} />
      </div>

      <HomeScrollReveal />
      <PublicNav />
      <HomeHeroSection />

      <section
        id="trusted-creators"
        className="py-12 bg-surface-container-low border-y border-surface-variant/30 relative overflow-hidden scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-8 opacity-70">
            Trusted by creators across
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-1000">
            {[
              { icon: "photo_camera", label: "Instagram" },
              { icon: "music_note", label: "TikTok" },
              { icon: "flutter_dash", label: "Twitter" },
              { icon: "movie", label: "YouTube" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 font-headline font-bold text-xl hover:scale-110 transition-transform cursor-default">
                <span className="material-symbols-outlined text-2xl">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto scroll-reveal-container">
        <div className="text-center mb-16 reveal-hidden">
          <h2 className="font-headline text-4xl font-extrabold mb-4">Crafted for the Digital Curator</h2>
          <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "hub", color: "secondary", label: "Centralized Links", delay: "0ms", desc: "Host all your content, shop links, and social profiles in one beautiful, editorial-grade destination." },
            { icon: "analytics", color: "primary", label: "Deep Analytics", delay: "150ms", desc: "Understand your audience with pinpoint precision. Track clicks, conversions, and geographical trends in real-time." },
            { icon: "palette", color: "primary", label: "Custom Branding", delay: "300ms", desc: "Your brand is unique. Fully customize every pixel with custom fonts, colors, and layout configurations." },
          ].map(({ icon, color, label, delay, desc }, i) => (
            <div
              key={label}
              className="reveal-hidden bg-surface-container-low p-10 rounded-xl relative group hover:bg-white hover:shadow-xl hover:translate-y-[-8px] transition-all duration-500 border border-transparent hover:border-surface-variant/50"
              style={delay !== "0ms" ? { transitionDelay: delay } : undefined}
            >
              {i === 0 && <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary rounded-l-xl" />}
              <div className={`w-14 h-14 bg-surface-container-lowest rounded-xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-${color} group-hover:text-white transition-colors duration-500`}>
                <span className={`material-symbols-outlined text-primary text-3xl group-hover:text-white`}>{icon}</span>
              </div>
              <h3 className="font-headline text-2xl font-bold mb-4">{label}</h3>
              <p className="text-on-surface-variant leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-20">
          <div className="w-full md:w-1/2 reveal-hidden">
            <div className="bg-surface-container-low rounded-3xl p-8 relative group">
              <Image
                alt="Elegant dashboard showing clean data visualization"
                className="rounded-xl shadow-lg w-full h-auto group-hover:scale-[1.02] transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCg1jSLuMCVc6TaFQCGlygspePy35lUZtxhyShDJDAav6xALtSK166JAWvEHYvufAHi2SaheMbkXZX1uBv-uIABVqsXTPv6vrvYvBe09hbtJ8tIDgj5mKZNPPBTc7NtXX5TYpc_ntBeeANO0KFcYgK5A7m2wlB6k3ji4eALe4h7ihfUJdNsP7CoYstmMFyvGMtXHaixRr67dS2bUFXAsbjhwutlalFMJemR4s6qT-TLttKzYdU5aY-7S_yQxJju__YWdCYLBmRm6F8G"
                width={1200}
                height={800}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute -bottom-6 -right-6 bg-surface-bright p-6 rounded-2xl shadow-2xl max-w-[240px] group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
                  <span className="font-headline font-bold text-sm">Real-time Growth</span>
                </div>
                <p className="text-xs text-on-surface-variant">Your audience engagement grew by 24% this week.</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 reveal-hidden" style={{ transitionDelay: "200ms" }}>
            <span className="text-secondary font-bold font-label tracking-widest uppercase text-sm mb-4 block">Intelligence</span>
            <h2 className="font-headline text-4xl font-extrabold mb-6">Data that drives <br />decisions.</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
              Stop guessing. Our analytics dashboard provides deep insights into how your audience interacts with your brand.
            </p>
            <ul className="space-y-4">
              {["Individual Link Tracking", "Referrer Attribution", "Exportable Weekly Reports"].map((item) => (
                <li key={item} className="flex items-center gap-3 font-semibold hover:translate-x-2 transition-transform duration-300">
                  <span className="material-symbols-outlined text-secondary">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 reveal-hidden">
        <div className="max-w-5xl mx-auto cta-gradient rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden group">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-white mb-6 relative z-10">
            Ready to take center stage?
          </h2>
          <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto relative z-10">
            Join 50,000+ creators who trust LinkHub to power their digital presence. No credit card required.
          </p>
          <div className="relative z-10">
            <Link
              href="/signup"
              className="inline-block bg-white text-primary px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:scale-105 hover:shadow-white/20 active:scale-95 transition-all duration-300"
            >
              Sign Up Now — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
