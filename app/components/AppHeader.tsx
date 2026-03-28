"use client";

export default function AppHeader({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <header 
      id="header"
      className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex justify-between items-center h-16 px-6 transition-all duration-300 ease-in-out"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="w-8"></div> {/* Spacer for toggle button */}
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input 
            className="w-full bg-surface-container-highest border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all" 
            placeholder={isAdmin ? "Search users, logs, or settings..." : "Search links..."} 
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="hover:bg-slate-100 rounded-full p-2 transition-colors flex items-center justify-center relative">
          <span className="material-symbols-outlined text-slate-500">notifications</span>
          {isAdmin && <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>}
        </button>
        <button className="hover:bg-slate-100 rounded-full p-2 transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-slate-500">help</span>
        </button>
        <div className="h-6 w-px bg-slate-200 mx-2"></div>
        <button className="bg-gradient-to-br from-primary to-primary-container text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:opacity-90 transition-all active:scale-95">
          {isAdmin ? 'System Status' : 'Share Hub'}
        </button>
        <img 
          alt="User Profile" 
          className="w-10 h-10 rounded-full border-2 border-white shadow-sm ml-2 object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3C8ffKjXogmoEnGKxR7GFcuWSQ7Ms5bD23F2Bli4xzYsvrkCAXDhRW_nMzJiwyg1unKkUamgyATO5dNebOfM1ndY2ONW8hZs1fNele0JcXyNhYi9Z2jh0Ts1gNatV4gDfvWLQZLGGMviHyMfaR3O0qGi_aDAz0P4hugchrXGJiGfNElr4Z0qOof9M7DRlVf_aAFLcfLBkML9cKTED0MVU3jmBgisKILW74Dj8p_9qa_h0KqN4srFIA3CvrlJK6PCESHQ9qHIQPoKQ"
        />
      </div>
    </header>
  );
}
