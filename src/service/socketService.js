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

        this.socket.on("update_devices", (devices) => {
            callbacks.onUpdateDevices && callbacks.onUpdateDevices(devices);
        });

        this.socket.on("camera_frame", (data) => {
            callbacks.onCameraFrame && callbacks.onCameraFrame(data);
        });

        this.socket.on("audio_chunk", (data) => {
            callbacks.onAudioChunk && callbacks.onAudioChunk(data);
        });
    }

    sendCommand(targetId, action, extraData = {}) {
        if (this.socket) {
            this.socket.emit("send_command_to_device", { targetId, action, ...extraData });
        }
    }

    sendAudioChunk(targetId, base64Audio) {
        if (this.socket) {
            this.socket.emit("client_audio_chunk", { targetId, chunk: base64Audio });
        }
    }

    disconnect() {
        if (this.socket) this.socket.disconnect();
    }
}

// Solución al error de ESLint: asignamos a una variable antes de exportar
const socketService = new SocketService();
export default socketService;