import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(callbacks) {
        this.socket = io('https://panoptic-server-production.up.railway.app/', {
            transports: ['websocket', 'polling']
        });

        this.socket.on("connect", () => {
            callbacks.onConnect && callbacks.onConnect(this.socket.id);
        });

        this.socket.on("disconnect", () => {
            callbacks.onDisconnect && callbacks.onDisconnect();
        });

        // Listeners adicionales de autenticación y errores
        this.socket.on("auth_success", (data) => {
            callbacks.onAuthSuccess && callbacks.onAuthSuccess(data);
        });

        this.socket.on("auth_error", (data) => {
            callbacks.onAuthError && callbacks.onAuthError(data);
        });

        this.socket.on("update_devices", (devices) => {
            callbacks.onUpdateDevices && callbacks.onUpdateDevices(devices);
        });

        this.socket.on("camera_frame", (data) => {
            if (typeof data === 'object' && data.status === 'stopped') {
                callbacks.onCameraFrame && callbacks.onCameraFrame({ deviceId: data.deviceId, frame: null });
            } else {
                callbacks.onCameraFrame && callbacks.onCameraFrame(data);
            }
        });

        // Audio que viene del celular hacia la PC
        this.socket.on("audio_chunk", (data) => {
            callbacks.onAudioChunk && callbacks.onAudioChunk(data);
        });

        // Audio que viene del servidor (por si acaso el cliente web también necesita recibir la réplica)
        this.socket.on("play_audio_chunk", (data) => {
            callbacks.onPlayAudioChunk && callbacks.onPlayAudioChunk(data);
        });
    }

    // Métodos para autenticar el panel y unirse a la sala vía Socket.io
    authenticatePanel(token) {
        if (this.socket) {
            this.socket.emit("authenticate_panel", token);
        }
    }

    joinRoomPanel(roomCode) {
        if (this.socket) {
            this.socket.emit("join_room_panel", roomCode);
        }
    }

    sendCommand(targetId, action, extraData = {}) {
        if (this.socket) {
            this.socket.emit("send_command_to_device", { targetId, action, ...extraData });
        }
    }

    // Envía el audio del micrófono de la PC al celular específico usando el ID dinámico
    sendAudioChunk(targetId, base64Audio) {
        if (this.socket) {
            this.socket.emit("client_audio_chunk", { targetId, chunk: base64Audio });
        }
    }

    disconnect() {
        if (this.socket) this.socket.disconnect();
    }
}

const socketService = new SocketService();
export default socketService;