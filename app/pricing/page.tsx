import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
};

const filledIconStyle = {
  fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24',
};

export default function PricingPage() {
  return (
    <div className="flex-1 selection:bg-primary-container selection:text-on-primary-container">
      <nav className="fixed top-0 w-full z-50 glass-nav h-20">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-full">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-indigo-900"
          >
            LinkHub
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              className="text-slate-600 hover:text-indigo-600 transition-colors font-inter text-sm font-medium"
              href="/features"
            >
              Features
            </Link>
            <a
              className="text-slate-600 hover:text-indigo-600 transition-colors font-inter text-sm font-medium"
              href="#"
            >
              Solutions
            </a>
            <Link
              className="text-indigo-700 font-bold border-b-2 border-indigo-600 pb-1 font-inter text-sm font-medium"
              href="/pricing"
            >
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100/50 rounded-lg transition-colors">
              Login
            </button>
            <button className="px-6 py-2 text-sm font-semibold bg-primary text-on-primary rounded-full editorial-gradient scale-95 active:scale-90 transition-transform duration-200">
              Sign Up
            </button>
          </div>
        </div>
      </nav>
      <main className="pt-32 pb-24 px-6">
        <header className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="font-headline font-extrabold text-5xl md:text-6xl text-on-surface tracking-tight mb-6 leading-tight">
            Invest in your <span className="text-primary italic">digital</span>{" "}
            presence.
          </h1>
          <p className="font-body text-lg text-on-surface-variant max-w-2xl mx-auto">
            Simple, transparent pricing designed for individual creators and
            global enterprises alike.
          </p>
        </header>
        <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-32">
          <div className="bg-surface-container-low rounded-xl p-8 flex flex-col h-full border-t-4 border-transparent">
            <div className="mb-8">
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
                Starter
              </span>
              <h3 className="font-headline font-bold text-3xl mt-2">Free</h3>
              <p className="text-on-surface-variant mt-2 text-sm">
                Perfect for hobbyists and personal profiles.
              </p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-on-surface-variant">/month</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm">
                <span
                  className="material-symbols-outlined text-secondary text-lg"
                  data-icon="check_circle"
                  style={filledIconStyle}
                >
                  check_circle
                </span>
                Basic link management
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span
                  className="material-symbols-outlined text-secondary text-lg"
                  data-icon="check_circle"
                  style={filledIconStyle}
                >
                  check_circle
                </span>
                1 digital hub
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span
                  className="material-symbols-outlined text-secondary text-lg"
                  data-icon="check_circle"
                  style={filledIconStyle}
                >
                  check_circle
                </span>
                Community support
              </li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant opacity-50">
                <span className="material-symbols-outlined text-lg" data-icon="cancel">
                  cancel
                </span>
                Custom branding
              </li>
            </ul>
            <button className="w-full py-4 rounded-full font-semibold text-primary bg-surface-container-lowest hover:bg-surface-bright transition-colors">
              Start Free
            </button>
          </div>
          <div className="relative bg-surface-container-lowest rounded-xl p-8 flex flex-col h-full ring-2 ring-primary/20 shadow-2xl scale-105 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Most Popular
            </div>
            <div className="mb-8">
              <span className="font-label text-xs uppercase tracking-widest text-primary font-semibold">
                Creator
              </span>
              <h3 className="font-headline font-bold text-3xl mt-2">Pro</h3>
              <p className="text-on-surface-variant mt-2 text-sm">
                The editorial standard for professional creators.
              </p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold">$12</span>
              <span className="text-on-surface-variant">/month</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm">
                <span
                  className="material-symbols-outlined text-secondary text-lg"
                  data-icon="stars"
                  style={filledIconStyle}
                >
                  stars
                </span>
                Unlimited links & hubs
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span
                  className="material-symbols-outlined text-secondary text-lg"
                  data-icon="check_circle"
                  style={filledIconStyle}
                >
                  check_circle
                </span>
                Advanced analytics
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span
                  className="material-symbols-outlined text-secondary text-lg"
                  data-icon="check_circle"
                  style={filledIconStyle}
                >
                  check_circle
                </span>
                Custom branding & fonts
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span
                  className="material-symbols-outlined text-secondary text-lg"
                  data-icon="check_circle"
                  style={filledIconStyle}
                >
                  check_circle
                </span>
                Priority support
              </li>
            </ul>
            <button className="w-full py-4 rounded-full font-semibold text-on-primary editorial-gradient hover:opacity-90 transition-all active:scale-95">
              Upgrade to Pro
            </button>
          </div>
          <div className="bg-surface-container-low rounded-xl p-8 flex flex-col h-full">
            <div className="mb-8">
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
                Scale
              </span>
              <h3 className="font-headline font-bold text-3xl mt-2">
                Enterprise
              </h3>
              <p className="text-on-surface-variant mt-2 text-sm">
                Bespoke solutions for teams and agencies.
              </p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold">Custom</span>
              <span className="text-on-surface-variant">pricing</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm">
                <span
                  className="material-symbols-outlined text-secondary text-lg"
                  data-icon="check_circle"
                  style={filledIconStyle}
                >
                  check_circle
                </span>
                Multiple team seats
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span
                  className="material-symbols-outlined text-secondary text-lg"
                  data-icon="check_circle"
                  style={filledIconStyle}
                >
                  check_circle
                </span>
                Custom domains
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span
                  className="material-symbols-outlined text-secondary text-lg"
                  data-icon="check_circle"
                  style={filledIconStyle}
                >
                  check_circle
                </span>
                Dedicated account manager
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span
                  className="material-symbols-outlined text-secondary text-lg"
                  data-icon="check_circle"
                  style={filledIconStyle}
                >
                  check_circle
                </span>
                SLA & security audits
              </li>
            </ul>
            <button className="w-full py-4 rounded-full font-semibold text-on-surface-variant bg-surface-container-highest hover:bg-surface-dim transition-colors">
              Contact Sales
            </button>
          </div>
        </section>
        <section className="max-w-5xl mx-auto py-20 bg-surface-container-low/50 rounded-3xl text-center mb-32">
          <h4 className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-12">
            The world&apos;s most creative teams trust LinkHub
          </h4>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <img
              alt="Spotify"
              className="h-8 md:h-10"
              data-alt="Logotype of Spotify in a clean minimalist style"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDktKSEXPT6tQT4zjLx_wiV6UuriH-LAGSCXhwTirekzEPoasjONetH4HPqWTBevrIHtvBLQoyJYG59Fs3qwGTRXHZIrhLW9Vh1KvhLKJivMvExjWUHDO6U_qo9rsxuSPk_Sjmg3xta7xjXa7lj3W0CYyR4ZxT4aVdqCPbt-dNmat9kYSB-7x4pNxfESU8sw3SYdUPbV3wsbxfVIE2WrLYKt-Y9VY7cxJQLY590F3CdDUXgrflA2Ar-JBzsomOGfAX4JAp33BsMoKVI"
            />
            <img
              alt="Notion"
              className="h-8 md:h-10"
              data-alt="Logotype of Notion in a clean minimalist style"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB38Vfn6mReYRrJOCtLKS9Sv-Weq6rw682BWqZ9sS_ckXYQLoQFKUtf-12p16tuOy4zKligEF5dFRZ93NOWDKOUgBswimmsUd0pZMfzeZV5pLDkUeL7_cLcnlB5jivbeiyrnLlYL5mfgM55oq4PXyO9FCuoZlsRbmsuSnndHolRzxkOh0nzhWV9pL_UJ-mapShKm8KPsuJBm5-_uoO2CQQT0SHGUJhTFmceXCxypqOwSaSLLn0S2fCDiQFnLIZrOMmE_tK30p4aPdiR"
            />
            <img
              alt="Airbnb"
              className="h-8 md:h-10"
              data-alt="Logotype of Airbnb in a clean minimalist style"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0JdyZFQYx0I3Dz_VUyA9e3fd9n-ikgH0offZ0fCJOoqCqiyucDKl-6Hhiv5_vs55wy9yl2EY5QHL3IGm8bbjqH6aHhTmlmt-cUaTV-sqJmy3lAh3115j6WgWpngLB9fmz5STBpgZbUe6LDXa7IFY8dESLnOT8RV5sMefnIbz59xBf0St5MhYNFxDW_ILTiaoXm4P7ylyALL-08-p2rXESDMcwmOT2NIhxM-Ai6gbWj4sRyQlB_E8Z4j-gc8xpsrIZLORcPQXuZyw5"
            />
            <img
              alt="Dribbble"
              className="h-8 md:h-10"
              data-alt="Logotype of Dribbble in a clean minimalist style"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMp6JB8zD8IAscI8rO5f5Dyu1vof5ndsVPYdK6IHq8B3_0xe4t0jyU5xVEl9iz7c9GLWOKm2Pvs7xN_OZazlBw2HhFdKgpTUvb3EoCeoDKQktd43mAZ47nrl7cMNGXcQQ2KYDxqSgSF07wl1UlpsDqplJYVV0-6YoMiLASNhfjIC_HyFuXU_ugeLYl-XK9sbYuJ0cipv7gxpXrqdKAnfLOYmfjwT4_CZky6a0NeyFYibNL591REkCmLTNs6S5urdU55C4x4HDh1ZBo"
            />
            <img
              alt="Vimeo"
              className="h-8 md:h-10"
              data-alt="Logotype of Vimeo in a clean minimalist style"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIzh4rmazSkDFo37Myl13XHLibRLOiEEPMzVgt0LZKkDdj6bRZxLztCFBzcMv9KvAtUe0f49UZQN4ZdMNL53DbiVxR7geiVBQmSzSlXkCQl2YA38Td9MgnohHSE1iz4yAHFC2Ivxf0JIVeeS4qqoBs294waw8A8v0zPp16B8Ncv2L94-b4AR7MFmJNunHqo2PurobdOikPYHI0T3l4ovxmvjGYaLrr06uxFZqPj1dqxLXq5i8IZ-xHOJMBZUTzbuIi1QNXfi-2i60D"
            />
          </div>
        </section>
        <section className="max-w-3xl mx-auto mb-32">
          <h2 className="font-headline font-bold text-3xl mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="group bg-surface-container-lowest rounded-xl p-6 transition-all hover:bg-surface-bright">
              <button className="flex justify-between items-center w-full text-left">
                <span className="font-bold text-on-surface">
                  Can I switch plans later?
                </span>
                <span
                  className="material-symbols-outlined text-primary group-hover:rotate-180 transition-transform"
                  data-icon="expand_more"
                >
                  expand_more
                </span>
              </button>
              <div className="mt-4 text-sm text-on-surface-variant leading-relaxed">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                are applied immediately and your next billing cycle will be
                prorated accordingly.
              </div>
            </div>
            <div className="group bg-surface-container-lowest rounded-xl p-6 transition-all hover:bg-surface-bright">
              <button className="flex justify-between items-center w-full text-left">
                <span className="font-bold text-on-surface">
                  What constitutes a &apos;custom domain&apos;?
                </span>
                <span
                  className="material-symbols-outlined text-primary group-hover:rotate-180 transition-transform"
                  data-icon="expand_more"
                >
                  expand_more
                </span>
              </button>
              <div className="mt-4 text-sm text-on-surface-variant leading-relaxed">
                Enterprise users can map their hubs to any domain they own (e.g.
                , links.yourbrand.com) instead of our standard linkhub.io URL
                structure.
              </div>
            </div>
            <div className="group bg-surface-container-lowest rounded-xl p-6 transition-all hover:bg-surface-bright">
              <button className="flex justify-between items-center w-full text-left">
                <span className="font-bold text-on-surface">
                  Is there a discount for non-profits?
                </span>
                <span
                  className="material-symbols-outlined text-primary group-hover:rotate-180 transition-transform"
                  data-icon="expand_more"
                >
                  expand_more
                </span>
              </button>
              <div className="mt-4 text-sm text-on-surface-variant leading-relaxed">
                Absolutely. We offer a 50% discount on Pro plans for verified
                educational institutions and non-profit organizations.
              </div>
            </div>
          </div>
        </section>
        <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-indigo-900 rounded-[2.5rem] p-12 md:p-20 text-on-primary-container overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="font-headline font-extrabold text-4xl md:text-5xl leading-tight mb-8 text-white">
              Ready to curate your digital stage?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-full hover:bg-indigo-50 transition-colors shadow-lg shadow-black/20">
                Get Started for Free
              </button>
              <button className="px-8 py-4 bg-indigo-800 text-white font-bold rounded-full border border-indigo-700 hover:bg-indigo-700 transition-colors">
                Book a Demo
              </button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="bg-indigo-800/50 backdrop-blur-3xl rounded-3xl p-8 transform rotate-3 translate-x-12 translate-y-12 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-on-secondary-container"
                    data-icon="trending_up"
                  >
                    trending_up
                  </span>
                </div>
                <div>
                  <div className="h-2 w-24 bg-white/20 rounded-full mb-2"></div>
                  <div className="h-2 w-16 bg-white/10 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-12 w-full bg-white/5 rounded-xl"></div>
                <div className="h-12 w-full bg-white/5 rounded-xl"></div>
                <div className="h-12 w-full bg-white/5 rounded-xl"></div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/50 to-transparent pointer-events-none"></div>
          </div>
        </section>
      </main>
      <footer className="bg-slate-50 w-full py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
          <div className="col-span-2 md:col-span-1">
            <div className="text-lg font-bold text-slate-900 mb-4">
              LinkHub
            </div>
            <p className="text-slate-500 text-sm max-w-xs">
              The world&apos;s premier platform for editorial link curation and
              digital identity management.
            </p>
          </div>
          <div>
            <span className="font-inter text-xs uppercase tracking-widest text-indigo-700 font-bold block mb-4">
              Company
            </span>
            <ul className="space-y-2">
              <li>
                <a
                  className="text-slate-500 hover:text-indigo-500 underline-offset-4 hover:underline transition-opacity text-sm"
                  href="#"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-indigo-500 underline-offset-4 hover:underline transition-opacity text-sm"
                  href="#"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-indigo-500 underline-offset-4 hover:underline transition-opacity text-sm"
                  href="#"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <span className="font-inter text-xs uppercase tracking-widest text-indigo-700 font-bold block mb-4">
              Product
            </span>
            <ul className="space-y-2">
              <li>
                <Link className="text-indigo-600 font-semibold text-sm" href="/pricing">
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-500 hover:text-indigo-500 underline-offset-4 hover:underline transition-opacity text-sm"
                  href="/features"
                >
                  Features
                </Link>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-indigo-500 underline-offset-4 hover:underline transition-opacity text-sm"
                  href="#"
                >
                  Solutions
                </a>
              </li>
            </ul>
          </div>
          <div>
            <span className="font-inter text-xs uppercase tracking-widest text-indigo-700 font-bold block mb-4">
              Legal
            </span>
            <ul className="space-y-2">
              <li>
                <a
                  className="text-slate-500 hover:text-indigo-500 underline-offset-4 hover:underline transition-opacity text-sm"
                  href="#"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  className="text-slate-500 hover:text-indigo-500 underline-offset-4 hover:underline transition-opacity text-sm"
                  href="#"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-200">
          <p className="text-slate-500 text-xs text-center">
            © 2024 LinkHub. The Digital Curator.
          </p>
        </div>
      </footer>
    </div>
  );
}

