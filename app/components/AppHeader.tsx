import { useSidebar } from "./SidebarContext";

export default function AppHeader({ isAdmin = false }: { isAdmin?: boolean }) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  
  return (
    <header 
      id="header"
      className={`fixed top-0 right-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/60 flex justify-between items-center h-16 px-6 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-full' : 'w-[calc(100%-16rem)]'
      }`}
    >
      <div className="flex items-center gap-6 flex-1">
        {/* Toggle Sidebar Button */}
        <button 
          onClick={toggleSidebar}
          className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline transition-all bg-surface-container-lowest shadow-sm active:scale-90"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>

        {/* Enhanced Search Bar */}
        <div className="relative w-full max-w-xl">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          </div>
          <input 
            className="w-full bg-surface-container-low border-none rounded-full pl-12 pr-6 py-2.5 text-[13px] text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/10 transition-all outline-none font-medium" 
            placeholder={isAdmin ? "Search users, logs, or settings..." : "Search links..."} 
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Action Icons */}
        <div className="flex items-center gap-1">
          <button className="hover:bg-surface-container-high rounded-full p-2.5 transition-colors flex items-center justify-center relative text-on-surface-variant group">
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
          </button>
          <button className="hover:bg-surface-container-high rounded-full p-2.5 transition-colors flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px]">help</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-outline-variant mx-1"></div>

        {/* System Status Button */}
        <button className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-[13px] font-bold shadow-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-2">
          System Status
        </button>

        {/* User Profile */}
        <button className="relative ml-1 group active:scale-95 transition-transform">
          <img 
            alt="User Profile" 
            className="w-10 h-10 rounded-full border-2 border-surface-container-lowest shadow-md object-cover ring-1 ring-outline-variant group-hover:ring-primary/30 transition-all" 
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100"
          />
        </button>
      </div>
    </header>
  );
}
