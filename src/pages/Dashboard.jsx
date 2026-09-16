import React, { useState, useEffect } from "react";
import socketService from "../service/socketService";
import { audioHandler } from "../utils/audioPlayer";
import Header from "../components/Header";
import LogConsole from "../components/LogConsole";
import DeviceCard from "../components/DeviceCard";

export default function Dashboard({ user, onLogout }) {
  const [engineStatus, setEngineStatus] = useState("CONECTANDO...");
  const [devices, setDevices] = useState([]);
  const [logs, setLogs] = useState([
    "[System] Inicializando cliente Panoptic...",
  ]);
  const [deviceFrames, setDeviceFrames] = useState({});

  // Estados para Salas
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    nombre: "",
    codigo: "",
    contrasena: "",
  });

  const addLog = (msg) => setLogs((prev) => [...prev, `${msg}`]);

  // Cargar salas del usuario (puedes crear una ruta GET /api/rooms en tu server si gustas, o simularlas por ahora)
  // Cargar salas desde la base de datos al montar el componente / recargar
  useEffect(() => {
    const token = localStorage.getItem("token");

    // 1. Obtener las salas guardadas en MySQL mediante HTTP
    const fetchRooms = async () => {
      try {
        const res = await fetch(
          "https://panoptic-server-production.up.railway.app/api/rooms",
        );
        const data = await res.json();
        if (data.success) {
          setRooms(data.rooms);
        }
      } catch (err) {
        addLog(`[Error] No se pudieron cargar las salas de la base de datos.`);
      }
    };

    fetchRooms();

    // 2. Conexión de WebSockets
    socketService.connect({
      onConnect: (id) => {
        setEngineStatus("ONLINE [CONECTADO]");
        addLog(`Conectado al servidor de control (ID: ${id})`);
        socketService.socket.emit("authenticate_panel", token);
      },
      onDisconnect: () => {
        setEngineStatus("OFFLINE [DESCONECTADO]");
        addLog("Se perdió la conexión con el servidor.");
      },
      onUpdateDevices: (devList) => {
        setDevices(devList);
        addLog(`Nodos actualizados globalmente.`);
      },
      onCameraFrame: (data) => {
        if (data && data.deviceId && data.frame) {
          setDeviceFrames((prev) => ({
            ...prev,
            [data.deviceId]: `data:image/jpeg;base64,${data.frame}`,
          }));
        }
      },
      onAudioChunk: (data) => {
        audioHandler.playChunk(data.deviceId, data.chunk);
      },
    });

    return () => socketService.disconnect();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "https://panoptic-server-production.up.railway.app/api/rooms/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newRoom, owner_id: user.id }),
        },
      );
      const data = await res.json();
      if (data.success) {
        addLog(`Sala [${newRoom.codigo}] creada exitosamente.`);
        setRooms([...rooms, { ...newRoom }]);
        setShowCreateModal(false);
        setNewRoom({ nombre: "", codigo: "", contrasena: "" });
      }
    } catch (err) {
      addLog(`[Error] No se pudo crear la sala.`);
    }
  };

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

  // Filtrar dispositivos que pertenecen únicamente a la sala seleccionada
  const filteredDevices = selectedRoom
    ? devices.filter((dev) => dev.roomCode === selectedRoom.codigo)
    : [];

  return (
    <div className="min-h-screen bg-[#050811] text-[#c0d0e0] flex flex-col font-mono selection:bg-cyan-500 selection:text-black">
      <Header
        engineStatus={engineStatus}
        deviceCount={filteredDevices.length}
      />

      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full flex flex-col">
        {/* Barra de Gestión de Salas */}
        <div className="bg-[#0A0F1D] border border-cyan-500/30 p-4 rounded-lg flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-cyan-400 font-bold">
              // SALA ACTIVA:
            </span>
            <select
              className="bg-black border border-cyan-500/40 text-xs text-white p-2 rounded outline-none"
              onChange={(e) => {
                const roomCode = e.target.value;
                const found = rooms.find((r) => r.codigo === roomCode);
                setSelectedRoom(found || null);

                // NUEVO: Le avisamos al servidor que este panel web se une a la sala
                if (roomCode) {
                  socketService.socket.emit("join_room_panel", roomCode);
                }
              }}
              value={selectedRoom ? selectedRoom.codigo : ""}
            >
              <option value="">-- Selecciona una Sala --</option>
              {rooms.map((r) => (
                <option key={r.codigo} value={r.codigo}>
                  {r.nombre} (Código: {r.codigo})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#00E5FF] text-black font-bold px-4 py-2 rounded text-xs hover:bg-cyan-400 transition shadow-[0_0_10px_#00e5ff]"
            >
              + CREAR NUEVA SALA
            </button>
            <button
              onClick={onLogout}
              className="bg-red-950/40 border border-red-500/40 text-red-400 px-3 py-2 rounded text-xs hover:bg-red-900/40 transition"
            >
              CERRAR SESIÓN
            </button>
          </div>
        </div>

        {/* Grilla de Dispositivos Conectados a la Sala Seleccionada */}
        <section className="flex-1">
          <h2 className="text-xs font-bold text-[#00E5FF] mb-4 tracking-widest uppercase">
            // NODOS MÓVILES EN SALA:{" "}
            {selectedRoom ? selectedRoom.nombre : "NINGUNA SELECCIONADA"} (
            {filteredDevices.length})
          </h2>

          {!selectedRoom ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-cyan-500/20 rounded-xl bg-cyan-950/5">
              <div className="text-cyan-500 text-xs mb-2">
                [ SELECCIONA UNA SALA PARA VER SUS DISPOSITIVOS ]
              </div>
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-cyan-500/20 rounded-xl bg-cyan-950/5">
              <div className="text-cyan-500 animate-pulse text-xs mb-2">
                [ ESPERANDO CONEXIONES EN ESTA SALA... ]
              </div>
              <p className="text-[10px] text-slate-500">
                Usa el código{" "}
                <span className="text-cyan-400 font-bold">
                  {selectedRoom.codigo}
                </span>{" "}
                en tu app móvil.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevices.map((dev) => (
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

        <section className="w-full">
          <LogConsole logs={logs} />
        </section>
      </main>

      {/* Modal para Crear Sala */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0A0F1D] border border-cyan-500/40 p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-[#00E5FF] tracking-wider">
              // CREAR NUEVA SALA
            </h3>
            <form onSubmit={handleCreateRoom} className="space-y-3 text-xs">
              <div>
                <label className="text-cyan-400 block mb-1">
                  NOMBRE DE SALA
                </label>
                <input
                  type="text"
                  placeholder="Ej: Operaciones Norte"
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, nombre: e.target.value })
                  }
                  className="w-full bg-black border border-cyan-500/30 p-2 rounded text-white outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-cyan-400 block mb-1">
                  CÓDIGO ÚNICO (Ej: DHW31K)
                </label>
                <input
                  type="text"
                  placeholder="DHW31K"
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, codigo: e.target.value })
                  }
                  className="w-full bg-black border border-cyan-500/30 p-2 rounded text-white outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-cyan-400 block mb-1">
                  CONTRASEÑA DE SALA
                </label>
                <input
                  type="password"
                  placeholder="********"
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, contrasena: e.target.value })
                  }
                  className="w-full bg-black border border-cyan-500/30 p-2 rounded text-white outline-none"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#00E5FF] text-black font-bold rounded hover:bg-cyan-400"
                >
                  GUARDAR SALA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
