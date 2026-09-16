import React, { useState, useEffect } from 'react';
import socketService from './service/socketService'; // Asegúrate de que esté en src/service/socketService.js
import { audioHandler } from './utils/audioPlayer';
import Header from './components/Header';
import LogConsole from './components/LogConsole';
import DeviceCard from './components/DeviceCard';

export default function App() {
  const [engineStatus, setEngineStatus] = useState("CONECTANDO...");
  const [devices, setDevices] = useState([]);
  const [logs, setLogs] = useState(["[System] Inicializando cliente Panoptic..."]);
  const [deviceFrames, setDeviceFrames] = useState({});

  const addLog = (msg) => setLogs(prev => [...prev, `${msg}`]);

  useEffect(() => {
    socketService.connect({
      onConnect: (id) => {
        setEngineStatus("ONLINE [CONECTADO]");
        addLog(`Conectado al servidor de control (ID: ${id})`);
      },
      onDisconnect: () => {
        setEngineStatus("OFFLINE [DESCONECTADO]");
        addLog("Se perdió la conexión con el servidor.");
      },
      onUpdateDevices: (devList) => {
        setDevices(devList);
        addLog(`Nodos actualizados: ${devList.length} dispositivo(s) en línea.`);
      },
      onCameraFrame: (data) => {
        if (data && data.deviceId && data.frame) {
          setDeviceFrames(prev => ({
            ...prev,
            [data.deviceId]: `data:image/jpeg;base64,${data.frame}`
          }));
        }
      },
      onAudioChunk: (data) => {
        audioHandler.playChunk(data.deviceId, data.chunk);
      }
    });

    return () => socketService.disconnect();
  }, []);

  const handleAction = (targetId, action, extra = {}) => {
    addLog(`Enviando acción [${action}] al nodo: ${targetId}`);
    socketService.sendCommand(targetId, action, extra);
  };

  const handleTalkToggle = (targetId, isTalking) => {
    if (isTalking) {
      addLog(`Transmitiendo voz hacia el nodo: ${targetId}`);
      audioHandler.startTalking(targetId, (id, chunk) => {
        socketService.sendAudioChunk(id, chunk);
      });
    } else {
      addLog(`Detenida la transmisión de voz hacia el nodo: ${targetId}`);
      audioHandler.stopTalking();
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-[#c0d0e0] flex flex-col font-mono selection:bg-cyan-500 selection:text-black">
      
      {/* 1. Header Componente Modular */}
      <Header engineStatus={engineStatus} deviceCount={devices.length} />

      {/* Contenido Principal */}
      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full flex flex-col">
        
        {/* Grilla de Dispositivos Conectados */}
        <section className="flex-1">
          <h2 className="text-xs font-bold text-[#00E5FF] mb-4 tracking-widest uppercase">
            // NODOS MÓVILES ACTIVOS ({devices.length})
          </h2>

          {devices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-cyan-500/20 rounded-xl bg-cyan-950/5">
              <div className="text-cyan-500 animate-pulse text-xs mb-2">[ ESCUCHANDO NODOS MÓVILES... ]</div>
              <p className="text-[10px] text-slate-500">Esperando conexiones entrantes de las aplicaciones móviles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.map(dev => (
                <DeviceCard
                  key={dev.id}
                  device={dev}
                  frameSrc={deviceFrames[dev.id] || ""}
                  onAction={handleAction}
                  onTalkToggle={handleTalkToggle}
                />
              ))}
            </div>
          )}
        </section>

        {/* 2. LogConsole Componente Modular */}
        <section className="w-full">
          <LogConsole logs={logs} />
        </section>

      </main>
    </div>
  );
}