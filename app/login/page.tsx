import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login - LinkHub",
};

export default function LoginPage() {
  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col overflow-hidden relative">
      {/* TopAppBar */}
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

      {/* Main Content: Login Journey */}
      <main className="flex-grow flex items-center justify-center px-4 pt-16 pb-6 relative overflow-hidden">
        {/* Asymmetric Background Decorative Elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />

        <div className="w-full max-w-[400px] z-10">
          {/* Editorial Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black tracking-tighter text-on-surface mb-1">Welcome Back</h1>
            <p className="text-[13px] font-medium text-on-surface-variant/70">The stage is set for your next curation.</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/70 dark:bg-surface/70 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-outline-variant/20 transition-all duration-500 hover:shadow-primary/10">
            <form className="space-y-4">
              {/* Input Email */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant/50 ml-1" htmlFor="email">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/10 dark:border-outline-variant/5 rounded-2xl text-[13px] font-black tracking-tight text-on-surface placeholder:text-on-surface-variant/30 outline-none transition-all duration-500 focus:bg-white dark:focus:bg-surface-container-lowest focus:ring-[8px] focus:ring-primary/5 dark:focus:ring-primary/10 focus:border-primary/40 shadow-sm shadow-on-surface/[0.02] active:scale-[0.99]"
                    id="email"
                    name="email"
                    placeholder="curator@linkhub.com"
                    type="email"
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant/50" htmlFor="password">
                    Password
                  </label>
                  <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-4">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <input
                    className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/10 dark:border-outline-variant/5 rounded-2xl text-[13px] font-black tracking-tight text-on-surface placeholder:text-on-surface-variant/30 outline-none transition-all duration-500 focus:bg-white dark:focus:bg-surface-container-lowest focus:ring-[8px] focus:ring-primary/5 dark:focus:ring-primary/10 focus:border-primary/40 shadow-sm shadow-on-surface/[0.02] active:scale-[0.99]"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                  />
                </div>
              </div>

              {/* Primary Action */}
              <button
                className="w-full py-4 bg-primary text-white text-[13px] font-black uppercase tracking-widest rounded-full hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-500 mt-2"
                type="submit"
              >
                Sign In to LinkHub
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <span className="bg-white/80 dark:bg-surface-container-lowest px-4 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 relative z-10">
                or continue with
              </span>
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-outline-variant/20 -translate-y-1/2" />
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl hover:bg-white hover:border-outline-variant/40 hover:shadow-xl hover:shadow-on-surface/[0.03] active:scale-[0.97] transition-all duration-300 group">
                <img alt="Google" className="w-4 h-4 opacity-80 group-hover:opacity-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaqDTci7JWWwRcxklan86rx2FiMF6bDQ9MyCC7r9z-CWrtZDLPDyNZbcfJUKDWF06ds-Z5eK_hwmuUr-qt1e8ozh0CpS33Yzdtwy5Bj8cxS0oJo9M9eFjCWGpZyLLgwES1oLv6Z3cdHke_u-jW-oluuEQNSrra_DdzOuXG7G63J7OpaKLHFHC4TTgccC02L0bPtRDHlos68Rjq1AU3JL2_Lao5_pqv22GXQZSgp_WEXapCiUSWqVu8xc3SqnozWoqOLNOK6C1Duo6B" />
                <span className="text-[12px] font-black text-on-surface">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl hover:bg-white hover:border-outline-variant/40 hover:shadow-xl hover:shadow-on-surface/[0.03] active:scale-[0.97] transition-all duration-300 group">
                <img alt="Apple" className="w-4 h-4 opacity-80 group-hover:opacity-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXu4bBgOMabyzo2odYRQRVOq75bYU5AJdEf1nT0smNt27MhZ7Xmy8L-YXPkM8w6npyVHub3B331bbg-w9kvjt7Ff3j6U8WEkqOAZy2va06LGP0vgqio5yC07DYJXD2vrzOziFBb6DpYTYkZTRnwmAOJuJRWf4p2engmyltCkhkfy55R0gLn5AaUwxm0IvTpSzPZz8Wl1WkyvKOTz4xl0bYlPn7AMfPWamrwcwnhCkzrz-cgacYXzq0lI2pK0vw4PgzA1ctkRij-znczX" />
                <span className="text-[12px] font-black text-on-surface">Apple</span>
              </button>
            </div>

            {/* Secondary Action */}
            <div className="mt-8 text-center">
              <p className="text-[12px] font-medium text-on-surface-variant/70">
                New to the curator's stage?
                <Link href="/signup" className="font-black text-primary hover:underline underline-offset-4 ml-1">
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="flex -space-x-2">
              <img alt="" className="w-7 h-7 rounded-full border-2 border-white shadow-sm" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=30&h=30" />
              <img alt="" className="w-7 h-7 rounded-full border-2 border-white shadow-sm" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=30&h=30" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/40">Joined by 10k+ Creators</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-transparent py-6 flex flex-col md:flex-row justify-center items-center gap-8 w-full border-t border-outline-variant/10 mt-auto">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/30">
          © 2024 LinkHub.
        </div>
        <div className="flex gap-8">
          <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/30 hover:text-primary transition-colors">Privacy</Link>
          <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/30 hover:text-primary transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  );
}

