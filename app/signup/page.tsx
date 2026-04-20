import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Join LinkHub - The Digital Curator",
};

export default function SignupPage() {
  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col overflow-hidden relative">
      {/* TopAppBar Navigation Shell */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <nav className="flex justify-between items-center w-full px-8 py-3 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <img src="/link_hub_logo.png" alt="LinkHub logo" className="w-24 sm:w-28 opacity-90" />
          </Link>
          <div className="flex items-center gap-6">
            <Link 
              href="#" 
              className="text-on-surface-variant/60 text-xs font-black uppercase tracking-widest hover:text-primary transition-all duration-300"
            >
              Help
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 pt-16 pb-6 relative overflow-hidden">
        {/* Asymmetric Background Decorative Elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />

        <div className="w-full max-w-[440px] z-10">
          {/* Central Card */}
          <div className="bg-white/70 dark:bg-surface/70 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-outline-variant/20 transition-all duration-500 hover:shadow-primary/10">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-black tracking-tighter text-on-surface mb-1">
                Join the curators
              </h1>
              <p className="text-[13px] font-medium text-on-surface-variant/70">
                Create your stage. Share your vision.
              </p>
            </div>

            {/* Social Sign-Up */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl hover:bg-white hover:border-outline-variant/40 hover:shadow-xl hover:shadow-on-surface/[0.03] active:scale-[0.97] transition-all duration-300 group">
                <img alt="Google" className="w-4 h-4 opacity-80 group-hover:opacity-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaqDTci7JWWwRcxklan86rx2FiMF6bDQ9MyCC7r9z-CWrtZDLPDyNZbcfJUKDWF06ds-Z5eK_hwmuUr-qt1e8ozh0CpS33Yzdtwy5Bj8cxS0oJo9M9eFjCWGpZyLLgwES1oLv6Z3cdHke_u-jW-oluuEQNSrra_DdzOuXG7G63J7OpaKLHFHFHC4TTgccC02L0bPtRDHlos68Rjq1AU3JL2_Lao5_pqv22GXQZSgp_WEXapCiUSWqVu8xc3SqnozWoqOLNOK6C1Duo6B" />
                <span className="text-[12px] font-black text-on-surface">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl hover:bg-white hover:border-outline-variant/40 hover:shadow-xl hover:shadow-on-surface/[0.03] active:scale-[0.97] transition-all duration-300 group">
                <img alt="Apple" className="w-4 h-4 opacity-80 group-hover:opacity-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXu4bBgOMabyzo2odYRQRVOq75bYU5AJdEf1nT0smNt27MhZ7Xmy8L-YXPkM8w6npyVHub3B331bbg-w9kvjt7Ff3j6U8WEkqOAZy2va06LGP0vgqio5yC07DYJXD2vrzOziFBb6DpYTYkZTRnwmAOJuJRWf4p2engmyltCkhkfy55R0gLn5AaUwxm0IvTpSzPZz8Wl1WkyvKOTz4xl0bYlPn7AMfPWamrwcwnhCkzrz-cgacYXzq0lI2pK0vw4PgzA1ctkRij-znczX" />
                <span className="text-[12px] font-black text-on-surface">Apple</span>
              </button>
            </div>

            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-outline-variant/20" />
              <span className="bg-white/80 dark:bg-surface-container-lowest px-4 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 relative z-10">
                or use email
              </span>
              <div className="flex-grow border-t border-outline-variant/20" />
            </div>

            {/* Registration Form */}
            <form className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant/50 ml-1" htmlFor="name">
                  Full Name
                </label>
                <input
                  className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/10 dark:border-outline-variant/5 rounded-2xl text-[13px] font-black tracking-tight text-on-surface placeholder:text-on-surface-variant/30 outline-none transition-all duration-500 focus:bg-white dark:focus:bg-surface-container-lowest focus:ring-[8px] focus:ring-primary/5 dark:focus:ring-primary/10 focus:border-primary/40 shadow-sm shadow-on-surface/[0.02] active:scale-[0.99]"
                  id="name"
                  placeholder="John Doe"
                  type="text"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant/50 ml-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/10 dark:border-outline-variant/5 rounded-2xl text-[13px] font-black tracking-tight text-on-surface placeholder:text-on-surface-variant/30 outline-none transition-all duration-500 focus:bg-white dark:focus:bg-surface-container-lowest focus:ring-[8px] focus:ring-primary/5 dark:focus:ring-primary/10 focus:border-primary/40 shadow-sm shadow-on-surface/[0.02] active:scale-[0.99]"
                  id="email"
                  placeholder="curator@linkhub.com"
                  type="email"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant/50 ml-1" htmlFor="password">
                  Password
                </label>
                <input
                  className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/10 dark:border-outline-variant/5 rounded-2xl text-[13px] font-black tracking-tight text-on-surface placeholder:text-on-surface-variant/30 outline-none transition-all duration-500 focus:bg-white dark:focus:bg-surface-container-lowest focus:ring-[8px] focus:ring-primary/5 dark:focus:ring-primary/10 focus:border-primary/40 shadow-sm shadow-on-surface/[0.02] active:scale-[0.99]"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                />
              </div>
              <div className="pt-2">
                <button
                  className="w-full py-4 bg-primary text-white text-[13px] font-black uppercase tracking-widest rounded-full hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-500"
                  type="submit"
                >
                  Create Account
                </button>
              </div>
            </form>
            <p className="mt-6 text-center text-[12px] font-medium text-on-surface-variant/70">
              Already part of the hub?
              <Link href="/login" className="font-black text-primary hover:underline underline-offset-4 ml-1">
                Log In
              </Link>
            </p>
          </div>
          
          {/* Visual Editorial Element */}
          <div className="mt-6 flex justify-center items-center gap-12 opacity-30">
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-2xl font-light">auto_awesome</span>
              <span className="text-[9px] font-black uppercase tracking-[0.25em]">Curate</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-2xl font-light">rocket_launch</span>
              <span className="text-[9px] font-black uppercase tracking-[0.25em]">Launch</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-2xl font-light">insights</span>
              <span className="text-[9px] font-black uppercase tracking-[0.25em]">Growth</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Navigation Shell */}
      <footer className="bg-transparent border-t border-outline-variant/10 py-6">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 w-full px-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/30">
            © 2024 LinkHub.
          </div>
          <nav className="flex gap-8">
            <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/30 hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/30 hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/30 hover:text-primary transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

