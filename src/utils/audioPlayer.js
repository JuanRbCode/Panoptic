export class AudioHandler {
    constructor() {
        this.audioCtx = null;
        this.activeStreams = {};
        this.mediaStream = null;
        this.processor = null;
        this.sourceNode = null;
    }

    // Reproducir audio entrante del celular en la PC
    playChunk(socketId, base64Data) {
        try {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            }
            if (this.audioCtx.state === "suspended") {
                this.audioCtx.resume();
            }

            const binaryString = atob(base64Data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

            const int16 = new Int16Array(bytes.buffer);
            const float32 = new Float32Array(int16.length);
            for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;

            const buffer = this.audioCtx.createBuffer(1, float32.length, 16000);
            buffer.copyToChannel(float32, 0);

            const source = this.audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioCtx.destination);

            const currentTime = this.audioCtx.currentTime;
            if (!this.activeStreams[socketId] || this.activeStreams[socketId] < currentTime) {
                this.activeStreams[socketId] = currentTime;
            }

            source.start(this.activeStreams[socketId]);
            this.activeStreams[socketId] += buffer.duration;
        } catch (e) {
            console.error("Error reproduciendo audio:", e);
        }
    }

    // ojala ps // 

    stopListening(socketId) {
        delete this.activeStreams[socketId];
    }

    // Capturar tu voz desde el micrófono de la PC para enviarla al celular
    async startTalking(socketId, onAudioCaptured) {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            }

            // IMPORTANTE: Asegurar que el contexto de audio esté activo
            if (this.audioCtx.state === "suspended") {
                await this.audioCtx.resume();
            }

            this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
            this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1);

            this.processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                
                // Convertir Float32 a Int16 PCM
                const int16Data = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    int16Data[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
                }

                // Convertir a base64 para enviarlo por socket
                const base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(int16Data.buffer)));
                onAudioCaptured(socketId, base64String);
            };

            this.sourceNode.connect(this.processor);
            
            // Creamos un nodo de ganancia en 0 para evitar que te escuches con eco feo en los parlantes de la PC,
            // pero manteniendo el flujo activo para que el navegador no apague el procesador.
            const silenceNode = this.audioCtx.createGain();
            silenceNode.gain.value = 0;
            
            this.processor.connect(silenceNode);
            silenceNode.connect(this.audioCtx.destination);

            console.log("[Audio] Micrófono de la PC iniciado y transmitiendo...");
        } catch (err) {
            console.error("No se pudo acceder al micrófono de la PC:", err);
            alert("Error al acceder a tu micrófono. Revisa los permisos del navegador.");
        }
    }

    stopTalking() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }
        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode = null;
        }
    }
}

export const audioHandler = new AudioHandler();