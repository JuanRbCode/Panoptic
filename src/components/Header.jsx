import React from 'react';

export default function Header({ engineStatus, deviceCount }) {
  return (
    <header className="flex items-center justify-between border-b border-cyan-500/20 bg-[#050811]/80 px-6 py-4 backdrop-blur-md">
      <div className="flex items-center space-x-3">
        <div className="h-3 w-3 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_10px_#00E5FF]"></div>
        <h1 className="font-mono text-lg font-bold tracking-widest text-cyan-400">
          Panoptic <span className="text-xs text-cyan-600"> COMMAND CENTER</span>
        </h1>
      </div>

      <div className="flex items-center space-x-6 font-mono text-xs">
        <div className="hidden sm:block text-slate-400">
          NODOS ACTIVOS: <span className="text-cyan-400 font-bold">{deviceCount}</span>
        </div>
        <div className="rounded border border-cyan-500/30 bg-cyan-950/20 px-3 py-1 text-cyan-300 shadow-[inset_0_0_8px_rgba(0,229,255,0.1)]">
          {engineStatus}
        </div>
      </div>
    </header>
  );
}