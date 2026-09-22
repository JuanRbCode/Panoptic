import React, { useState } from 'react';

export default function DeviceCard({ device, frameSrc, onAction, onTalkToggle }) {
  const [activeLens, setActiveLens] = useState('back'); // 'back' o 'front'
  const [isCamActive, setIsCamActive] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false); // Micrófono del celular (escuchar audio remoto)
  const [isTalkingToPhone, setIsTalkingToPhone] = useState(false); // Micrófono de tu PC (hablar hacia el celular)

  // Identificador completo del socket para que los comandos lleguen correctamente
  const deviceTargetId = device.socketId || device.id;

  // Control de Cámara (Independiente por lente)
  const handleToggleCamera = (lensType) => {
    setActiveLens(lensType);
    setIsCamActive(true);
    onAction(deviceTargetId, 'start_camera', { lens: lensType });
  };

  const handleStopCamera = () => {
    setIsCamActive(false);
    onAction(deviceTargetId, 'stop_camera', { lens: activeLens });
  };

  // Control de Micrófono del Celular (Escuchar el entorno del móvil)
  const handleToggleMicListening = () => {
    const newState = !isMicListening;
    setIsMicListening(newState);
    onAction(deviceTargetId, newState ? 'start_mic' : 'stop_mic');
  };

  // Control de Voz Bidireccional de la PC (Hablar al celular)
  const handleToggleTalking = () => {
    const newState = !isTalkingToPhone;
    setIsTalkingToPhone(newState);
    onTalkToggle(deviceTargetId, newState);
  };

  return (
    <div className="border border-[#00e5ff]/40 bg-[#0A0F1D] p-4 rounded-lg flex flex-col space-y-4 shadow-[0_0_15px_rgba(0,229,255,0.05)]">
      
      {/* Cabecera del Nodo */}
      <div className="flex justify-between items-center border-b border-[#00e5ff]/20 pb-2">
        <div>
          <h3 className="text-xs font-bold text-[#00E5FF] tracking-wider">{device.name}</h3>
          <span className="text-[9px] text-gray-500">IP: {device.ip || 'Local'}</span>
        </div>
        {/* Mostramos solo un pedazo visualmente en pantalla, pero guardamos el ID completo para los eventos */}
        <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-[#00e5ff]/30" title={deviceTargetId}>
          ID: {deviceTargetId ? `${deviceTargetId.substring(0, 6)}...` : 'N/A'}
        </span>
      </div>

      {/* Visor de Cámara del Dispositivo */}
      <div className="relative aspect-video bg-black border border-gray-800 rounded flex items-center justify-center overflow-hidden">
        {frameSrc ? (
          <img src={frameSrc} alt="Stream en vivo" className="w-full h-full object-cover" />
        ) : (
          <div className="text-[10px] text-gray-600 animate-pulse">
            [ {isCamActive ? 'CARGANDO STREAM...' : 'CÁMARA APAGADA'} ]
          </div>
        )}
        <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[9px] text-[#00E5FF] border border-[#00e5ff]/20">
          LENS: {activeLens.toUpperCase()}
        </div>
      </div>

      {/* Panel de Botones Independientes */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        
        {/* Controles de Cámara (Trasera / Frontal) */}
        <button
          onClick={() => handleToggleCamera('back')}
          className={`p-2 rounded border transition font-bold ${
            isCamActive && activeLens === 'back'
              ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_10px_#00e5ff]'
              : 'bg-black text-[#00E5FF] border-[#00e5ff]/30 hover:bg-[#00e5ff]/10'
          }`}
        >
          📷 CÁ<MARA></MARA> TRASERA
        </button>

        <button
          onClick={() => handleToggleCamera('front')}
          className={`p-2 rounded border transition font-bold ${
            isCamActive && activeLens === 'front'
              ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_10px_#00e5ff]'
              : 'bg-black text-[#00E5FF] border-[#00e5ff]/30 hover:bg-[#00e5ff]/10'
          }`}
        >
          🤳 CÁM FRONTAL
        </button>

        {isCamActive && (
          <button
            onClick={handleStopCamera}
            className="col-span-2 p-1.5 rounded bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-900/40 transition"
          >
            ⏹ APAGAR CÁMARA ACTUAL
          </button>
        )}

        {/* Control de Micrófono del Celular (Escuchar) */}
        <button
          onClick={handleToggleMicListening}
          className={`p-2 rounded border transition font-bold ${
            isMicListening 
              ? 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_10px_#eab308]' 
              : 'bg-black text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10'
          }`}
        >
          {isMicListening ? '🔊 ESCUCHANDO MIC' : '🔇 MIC CELULAR OFF'}
        </button>

        {/* Control de la PC hacia el Celular (Hablar) */}
        <button
          onClick={handleToggleTalking}
          className={`p-2 rounded border transition font-bold ${
            isTalkingToPhone 
              ? 'bg-green-500 text-black border-green-400 shadow-[0_0_10px_#22c55e]' 
              : 'bg-black text-green-400 border-green-500/30 hover:bg-green-500/10'
          }`}
        >
          {isTalkingToPhone ? '🗣️ TRANSMITIENDO VOZ...' : '🎙️ HABLAR AL CELULAR'}
        </button>

      </div>
    </div>
  );
}