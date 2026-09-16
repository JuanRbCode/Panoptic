import React, { useRef, useEffect } from 'react';

export default function LogConsole({ logs }) {
  const consoleEndRef = useRef(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-40 w-full rounded-lg border border-cyan-500/20 bg-[#03050a]/90 p-3 font-mono text-xs shadow-lg backdrop-blur">
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-2 text-cyan-600">
        <span>SYS_LOGS // TELEMETRÍA EN VIVO</span>
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-ping"></span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 pr-2 text-slate-400">
        {logs.map((log, index) => (
          <div key={index} className="flex space-x-2">
            <span className="text-cyan-500/60">{'>'}</span>
            <span className="text-cyan-200/90">{log}</span>
          </div>
        ))}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
}