"use client";

import CollapsibleSidebar from "../components/CollapsibleSidebar";
import AppHeader from "../components/AppHeader";
import { ThemeToggle } from "../ThemeToggle";
import { useSidebar } from "../components/SidebarContext";

export default function SuperAdminClient() {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="bg-surface text-on-surface min-h-screen antialiased">
      <CollapsibleSidebar isAdmin={false}>
        <AppHeader isAdmin={false} />
        {/* Main Content Canvas */}
        <main
          id="mainContent"
          className={`flex-1 pt-16 transition-all duration-500 ease-in-out ${
            isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
          } ml-0 overflow-y-auto bg-surface`}
        >
          <div className="max-w-[1400px] mx-auto p-8 grid grid-cols-12 gap-10">
            {/* Super Admin Dashboard */}
            <section className="col-span-12 space-y-8">
              {/* Super Admin Header */}
              <div className="bg-gradient-to-r from-error-container to-error/10 border border-error/20 rounded-2xl p-8 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-error text-3xl">security</span>
                      <h1 className="text-3xl font-black text-on-surface tracking-tight">Super Admin Dashboard</h1>
                    </div>
                    <p className="text-lg text-on-surface-variant">System-wide administration and control center</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-error text-on-error rounded-full text-sm font-bold">
                        <span className="w-2 h-2 bg-on-error rounded-full animate-pulse"></span>
                        SUPER ADMIN ACCESS
                      </div>
                      <div className="text-sm text-on-surface-variant">
                        Last login: 2 hours ago
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-on-surface-variant mb-1">System Status</p>
                    <p className="text-2xl font-black text-error">CRITICAL</p>
                  </div>
                </div>
              </div>

              {/* System Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
                  <div className="flex items-center justify-between mb-4">
                    <span className="material-symbols-outlined text-error text-2xl">groups</span>
                    <span className="text-xs font-bold text-error uppercase">All Users</span>
                  </div>
                  <p className="text-3xl font-black text-on-surface">2.4M</p>
                  <p className="text-sm text-on-surface-variant mt-1">+12.5% this month</p>
                </div>
                
                <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
                  <div className="flex items-center justify-between mb-4">
                    <span className="material-symbols-outlined text-tertiary text-2xl">admin_panel_settings</span>
                    <span className="text-xs font-bold text-tertiary uppercase">Admins</span>
                  </div>
                  <p className="text-3xl font-black text-on-surface">847</p>
                  <p className="text-sm text-on-surface-variant mt-1">23 active now</p>
                </div>
                
                <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
                  <div className="flex items-center justify-between mb-4">
                    <span className="material-symbols-outlined text-warning text-2xl">warning</span>
                    <span className="text-xs font-bold text-warning uppercase">Alerts</span>
                  </div>
                  <p className="text-3xl font-black text-on-surface">142</p>
                  <p className="text-sm text-error mt-1">3 critical</p>
                </div>
                
                <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
                  <div className="flex items-center justify-between mb-4">
                    <span className="material-symbols-outlined text-primary text-2xl">server</span>
                    <span className="text-xs font-bold text-primary uppercase">Servers</span>
                  </div>
                  <p className="text-3xl font-black text-on-surface">24</p>
                  <p className="text-sm text-error mt-1">2 offline</p>
                </div>
              </div>

              {/* Critical Issues */}
              <div className="bg-error-container/10 border border-error/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-error">priority_high</span>
                    Critical Issues
                  </h2>
                  <button className="text-sm text-error font-semibold hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-xl border border-error/20">
                    <span className="material-symbols-outlined text-error text-xl">database_off</span>
                    <div className="flex-1">
                      <p className="font-semibold text-on-surface">Database Cluster #3 Offline</p>
                      <p className="text-sm text-on-surface-variant">Affecting 45,000 users in EU region</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-error font-bold">12 min ago</p>
                      <button className="text-sm text-primary font-semibold mt-1">Investigate</button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-xl border border-warning/20">
                    <span className="material-symbols-outlined text-warning text-xl">security_update_warning</span>
                    <div className="flex-1">
                      <p className="font-semibold text-on-surface">Security Patch Required</p>
                      <p className="text-sm text-on-surface-variant">Critical vulnerability in auth service</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-warning font-bold">1 hour ago</p>
                      <button className="text-sm text-primary font-semibold mt-1">Deploy Patch</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest rounded-xl p-6">
                  <h3 className="text-lg font-black text-on-surface mb-4">System Controls</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 p-4 bg-error/10 border border-error/20 rounded-xl hover:bg-error/20 transition-colors">
                      <span className="material-symbols-outlined text-error">emergency</span>
                      <div className="text-left">
                        <p className="font-semibold text-on-surface">Emergency Shutdown</p>
                        <p className="text-xs text-on-surface-variant">Immediate system-wide shutdown</p>
                      </div>
                    </button>
                    
                    <button className="w-full flex items-center gap-3 p-4 bg-warning/10 border border-warning/20 rounded-xl hover:bg-warning/20 transition-colors">
                      <span className="material-symbols-outlined text-warning">backup</span>
                      <div className="text-left">
                        <p className="font-semibold text-on-surface">System Backup</p>
                        <p className="text-xs text-on-surface-variant">Create full system backup</p>
                      </div>
                    </button>
                    
                    <button className="w-full flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors">
                      <span className="material-symbols-outlined text-primary">settings_backup_restore</span>
                      <div className="text-left">
                        <p className="font-semibold text-on-surface">Maintenance Mode</p>
                        <p className="text-xs text-on-surface-variant">Enable maintenance mode</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-6">
                  <h3 className="text-lg font-black text-on-surface mb-4">User Management</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 p-4 bg-surface-container-highest rounded-xl hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined text-tertiary">person_add</span>
                      <div className="text-left">
                        <p className="font-semibold text-on-surface">Create Admin</p>
                        <p className="text-xs text-on-surface-variant">Add new system administrator</p>
                      </div>
                    </button>
                    
                    <button className="w-full flex items-center gap-3 p-4 bg-surface-container-highest rounded-xl hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined text-secondary">group_manage</span>
                      <div className="text-left">
                        <p className="font-semibold text-on-surface">Bulk Operations</p>
                        <p className="text-xs text-on-surface-variant">Mass user management</p>
                      </div>
                    </button>
                    
                    <button className="w-full flex items-center gap-3 p-4 bg-surface-container-highest rounded-xl hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined text-primary">policy</span>
                      <div className="text-left">
                        <p className="font-semibold text-on-surface">Access Policies</p>
                        <p className="text-xs text-on-surface-variant">Manage permission policies</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </CollapsibleSidebar>
      <ThemeToggle />
    </div>
  );
}
