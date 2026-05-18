"use client";

import { useRouter } from "next/navigation";

export default function UpgradeCard({ isCollapsed }: { isCollapsed: boolean }) {
  const router = useRouter();

  if (isCollapsed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3 p-4 
      bg-gradient-to-br from-indigo-700 to-[#2d1e8a] text-white">
      <div className="absolute -right-8 -top-8 w-32 h-32 
        bg-white/15 rounded-full blur-xl" />
      
      <div className="text-[10.5px] font-semibold tracking-wider uppercase opacity-70 mb-1">
        LinkHub Pro
      </div>
      <div className="font-['Instrument_Serif'] text-[19px] italic mb-2.5">
        Unlock deeper insights
      </div>
      <button 
        onClick={() => router.push('/pricing')}
        className="relative z-10 bg-white text-indigo-700 px-3 py-1.5 
          rounded-lg text-[12.5px] font-semibold hover:bg-indigo-50 
          transition-all cursor-pointer"
      >
        Upgrade →
      </button>
    </div>
  );
}