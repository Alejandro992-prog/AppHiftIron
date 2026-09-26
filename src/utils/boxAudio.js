/**
 * HIFT IRON BOX - AUDIO SYNTHESIZER & SOUND ENGINE
 * 
 * Genera sonidos auténticos de reloj de Box de CrossFit / HIFT usando Web Audio API puro.
 * - 100% Offline (no requiere archivos externos ni internet).
 * - Compatible con navegadores móviles (iOS Safari, Android Chrome) gestionando el AudioContext suspendido.
 * - Incluye bocina de salida (Box Horn / Buzzer), bips de cuenta atrás, avisos de minuto, descanso y voz en español opcional.
 */

class BoxSoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.voiceEnabled = true;
    this.volume = 0.8; // 0.0 a 1.0
  }

  // Garantiza que el AudioContext esté activo tras la primera interacción del usuario
  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Haptic feedback (Vibración en móvil si está disponible)
  vibrate(pattern = [120]) {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignorar si no está soportado
    }
  }

  // Voz sintetizada (Web Speech API en español)
  speak(text) {
    if (!this.voiceEnabled || this.isMuted) return;
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Detener frases anteriores
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.15; // Ligeramente más rápido y enérgico
        utterance.pitch = 1.0;
        utterance.volume = Math.min(1, this.volume * 1.2);
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Ignorar errores de SpeechSynthesis
    }
  }

  // 1. BIP CORTO DE CUENTA ATRÁS (3, 2, 1)
  playCountdownBeep(freq = 780) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.vibrate([70]);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Envolvente rápida y percusiva (ataque inmediato, caída seca)
    const effectiveVol = this.volume * 0.4;
    gain.gain.setValueAtTime(effectiveVol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);
  }

  // 2. BOCINA DE SALIDA ESTILO BOX DE CROSSFIT ("¡GO! / BUZZER")
  // Combina dos frecuencias con dientes de sierra y filtro para sonar como una bocina industrial real
  playBoxBuzzer(duration = 0.6) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.vibrate([300, 80, 200]);

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.5, now);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    masterGain.connect(ctx.destination);

    // Oscilador 1: Tono fundamental (340Hz aprox. Fa4 industrial)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(340, now);

    // Oscilador 2: Armónico en quinta (510Hz) para grosor de bocina de estadio
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(510, now);

    // Filtro paso bajo para quitar estridencia digital y darle cuerpo acústico
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  // 3. AVISO DE CAMBIO DE MINUTO (EMOM)
  // Doble bip agudo y limpio
  playMinuteTick() {
    if (this.isMuted) return;
    this.playCountdownBeep(980);
    setTimeout(() => {
      this.playCountdownBeep(1200);
    }, 120);
    this.vibrate([100, 60, 100]);
  }

  // 4. CAMBIO A DESCANSO (REST - Tabata)
  // Tono melódico descendente (indica bajar pulsaciones)
  playRestSignal() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.vibrate([150]);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.35);

    gain.gain.setValueAtTime(this.volume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // 5. CAMBIO A TRABAJO (WORK - Tabata)
  // Tono ascendente potente
  playWorkSignal() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.vibrate([180]);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);

    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // 6. FIN DE WOD / TIME CAP (Triple bocinazo triunfal)
  playTimeCap() {
    if (this.isMuted) return;
    this.playBoxBuzzer(0.4);
    setTimeout(() => this.playBoxBuzzer(0.4), 450);
    setTimeout(() => {
      this.playBoxBuzzer(0.9);
      this.speak('¡Tiempo finalizado! Buen entreno');
    }, 900);
  }

  // Prueba de sonido para comprobar el volumen
  testSound() {
    this.getAudioContext();
    this.playCountdownBeep(780);
    setTimeout(() => this.playCountdownBeep(880), 200);
    setTimeout(() => this.playBoxBuzzer(0.4), 450);
    if (this.voiceEnabled) {
      setTimeout(() => this.speak('Audio del box listo'), 1000);
    }
  }
}

// Instancia singleton compartida en toda la aplicación
export const boxAudio = new BoxSoundEngine();
