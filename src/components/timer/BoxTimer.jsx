import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Plus, 
  Minus, 
  Timer as TimerIcon, 
  CheckCircle, 
  Mic, 
  MicOff, 
  Sparkles,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { boxAudio } from '../../utils/boxAudio';

export default function BoxTimer({ initialPreset = null }) {
  const [mode, setMode] = useState(initialPreset?.type || 'fortime'); // 'fortime' | 'amrap' | 'emom' | 'tabata'
  const [isRunning, setIsRunning] = useState(false);
  const [isPrep, setIsPrep] = useState(false);
  const [prepDuration, setPrepDuration] = useState(10); // 10s, 5s o 3s
  const [prepSeconds, setPrepSeconds] = useState(10);
  
  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Time tracking
  const [seconds, setSeconds] = useState(0); // For Time & EMOM
  const [targetMinutes, setTargetMinutes] = useState(initialPreset?.minutes || 15); // AMRAP & EMOM total
  const [remainingSeconds, setRemainingSeconds] = useState((initialPreset?.minutes || 15) * 60);

  // Tabata state
  const [tabataRound, setTabataRound] = useState(1);
  const [isTabataWork, setIsTabataWork] = useState(true);
  const [tabataIntervalSeconds, setTabataIntervalSeconds] = useState(20);

  // AMRAP Round counter
  const [completedRounds, setCompletedRounds] = useState(0);

  const timerRef = useRef(null);

  // Sincronizar configuración con el motor de audio
  useEffect(() => {
    boxAudio.isMuted = !soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    boxAudio.voiceEnabled = voiceEnabled;
  }, [voiceEnabled]);

  // Update if initialPreset changes
  useEffect(() => {
    if (initialPreset) {
      setMode(initialPreset.type || 'fortime');
      if (initialPreset.minutes) {
        setTargetMinutes(initialPreset.minutes);
        setRemainingSeconds(initialPreset.minutes * 60);
      }
      resetTimer();
    }
  }, [initialPreset]);

  // Main Timer Interval
  useEffect(() => {
    if (!isRunning) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      // Cuenta atrás de preparación (10s, 5s, etc.)
      if (isPrep) {
        setPrepSeconds(prev => {
          if (prev <= 1) {
            setIsPrep(false);
            // ¡BOCINAZO DE SALIDA!
            boxAudio.playBoxBuzzer(0.7);
            boxAudio.speak('¡Vamos!');
            return prepDuration;
          }

          const nextSec = prev - 1;

          // Avisos sonoros y por voz en 3, 2, 1
          if (nextSec === 3) {
            boxAudio.playCountdownBeep(750);
            boxAudio.speak('Tres');
          } else if (nextSec === 2) {
            boxAudio.playCountdownBeep(750);
            boxAudio.speak('Dos');
          } else if (nextSec === 1) {
            boxAudio.playCountdownBeep(850);
            boxAudio.speak('Uno');
          }

          return nextSec;
        });
        return;
      }

      // 1. FOR TIME (Cronómetro ascendente)
      if (mode === 'fortime') {
        setSeconds(prev => prev + 1);
      } 
      // 2. AMRAP (Cuenta regresiva)
      else if (mode === 'amrap') {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            boxAudio.playTimeCap();
            confetti({ particleCount: 90, spread: 70, colors: ['#ff2d78', '#a855f7'] });
            return 0;
          }

          const nextSec = prev - 1;

          // Aviso de último minuto
          if (nextSec === 60) {
            boxAudio.playMinuteTick();
            boxAudio.speak('Último minuto');
          }
          // Últimos 10 segundos
          else if (nextSec === 10) {
            boxAudio.playCountdownBeep(700);
            boxAudio.speak('Diez segundos');
          }
          // 3, 2, 1 final
          else if (nextSec === 3) {
            boxAudio.playCountdownBeep(750);
            boxAudio.speak('Tres');
          } else if (nextSec === 2) {
            boxAudio.playCountdownBeep(750);
            boxAudio.speak('Dos');
          } else if (nextSec === 1) {
            boxAudio.playCountdownBeep(850);
            boxAudio.speak('Uno');
          }

          return nextSec;
        });
      } 
      // 3. EMOM (Every Minute on the Minute)
      else if (mode === 'emom') {
        setSeconds(prev => {
          const next = prev + 1;
          const currentMinuteSec = next % 60;
          const currentMinuteNum = Math.floor(next / 60) + 1;

          // Final de todo el bloque EMOM
          if (next >= targetMinutes * 60) {
            setIsRunning(false);
            boxAudio.playTimeCap();
            confetti({ particleCount: 90, spread: 70 });
            return targetMinutes * 60;
          }

          // Bips a los segundos :57, :58, :59
          if (currentMinuteSec === 57) {
            boxAudio.playCountdownBeep(750);
          } else if (currentMinuteSec === 58) {
            boxAudio.playCountdownBeep(750);
          } else if (currentMinuteSec === 59) {
            boxAudio.playCountdownBeep(850);
          } 
          // Segundo :00 -> ¡Nuevo minuto!
          else if (currentMinuteSec === 0) {
            boxAudio.playBoxBuzzer(0.45);
            boxAudio.speak(`Minuto ${currentMinuteNum}`);
          }

          return next;
        });
      } 
      // 4. TABATA (20s Trabajo / 10s Descanso x 8 rondas)
      else if (mode === 'tabata') {
        setTabataIntervalSeconds(prev => {
          if (prev <= 1) {
            if (isTabataWork) {
              // Fin de trabajo -> Pasar a DESCANSO (10s)
              boxAudio.playRestSignal();
              boxAudio.speak('Descanso');
              setIsTabataWork(false);
              return 10;
            } else {
              // Fin de descanso -> Pasar a TRABAJO (20s)
              if (tabataRound >= 8) {
                // Completadas las 8 rondas
                setIsRunning(false);
                boxAudio.playTimeCap();
                confetti({ particleCount: 100, spread: 80, colors: ['#ff2d78', '#a855f7', '#10b981'] });
                return 0;
              }
              const nextRound = tabataRound + 1;
              boxAudio.playWorkSignal();
              boxAudio.speak(`Ronda ${nextRound}`);
              setTabataRound(nextRound);
              setIsTabataWork(true);
              return 20;
            }
          }

          const nextSec = prev - 1;
          // Cuenta atrás de 3, 2, 1 antes del cambio
          if (nextSec === 3) {
            boxAudio.playCountdownBeep(750);
          } else if (nextSec === 2) {
            boxAudio.playCountdownBeep(750);
          } else if (nextSec === 1) {
            boxAudio.playCountdownBeep(850);
          }

          return nextSec;
        });
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning, isPrep, mode, prepDuration, targetMinutes, isTabataWork, tabataRound]);

  const handleStart = () => {
    // Desbloquear AudioContext en móvil en el evento táctil
    boxAudio.getAudioContext();
    setIsPrep(true);
    setPrepSeconds(prepDuration);
    setIsRunning(true);
    boxAudio.playCountdownBeep(880);
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPrep(false);
    boxAudio.playCountdownBeep(550);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPrep(false);
    setPrepSeconds(prepDuration);
    setSeconds(0);
    setRemainingSeconds(targetMinutes * 60);
    setTabataRound(1);
    setIsTabataWork(true);
    setTabataIntervalSeconds(20);
    setCompletedRounds(0);
  };

  const handleFinishForTime = () => {
    setIsRunning(false);
    boxAudio.playTimeCap();
    confetti({ particleCount: 100, spread: 75, colors: ['#ff2d78', '#38bdf8', '#fbbf24'] });
  };

  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Barra de Configuración de Audio & Sonido */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-secondary)',
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Toggle Sonido Bocina / Beeps */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: '700',
              background: soundEnabled ? 'rgba(255, 45, 120, 0.15)' : 'var(--bg-surface)',
              color: soundEnabled ? 'var(--brand-pink)' : 'var(--text-muted)',
              border: soundEnabled ? '1px solid var(--brand-pink)' : '1px solid var(--border-subtle)'
            }}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            {soundEnabled ? 'Bocina Box ON' : 'Silencio'}
          </button>

          {/* Toggle Voz en Español */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: '700',
              background: voiceEnabled ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-surface)',
              color: voiceEnabled ? 'var(--brand-lilac-light)' : 'var(--text-muted)',
              border: voiceEnabled ? '1px solid var(--brand-lilac)' : '1px solid var(--border-subtle)'
            }}
          >
            {voiceEnabled ? <Mic size={15} /> : <MicOff size={15} />}
            {voiceEnabled ? 'Voz Coach ON' : 'Voz OFF'}
          </button>
        </div>

        {/* Botón de Test Rápido de Bocina */}
        <button
          onClick={() => boxAudio.testSound()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            fontWeight: '700',
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            transition: 'all var(--transition-fast)'
          }}
          title="Probar sonido y volumen del reloj"
        >
          <Radio size={14} style={{ color: 'var(--brand-pink)' }} />
          <span>Probar Bocina 🔊</span>
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '6px',
        background: 'var(--bg-secondary)',
        padding: '4px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        {[
          { id: 'fortime', label: 'FOR TIME' },
          { id: 'amrap', label: 'AMRAP' },
          { id: 'emom', label: 'EMOM' },
          { id: 'tabata', label: 'TABATA' }
        ].map(m => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id);
                resetTimer();
              }}
              style={{
                padding: '8px 4px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing: '0.04em',
                background: active ? 'var(--brand-gradient)' : 'transparent',
                color: active ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: active ? 'var(--brand-gradient-glow)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Main Timer Display Board */}
      <div style={{
        background: 'radial-gradient(circle at 50% 30%, #1a1428 0%, #0d0d14 80%)',
        borderRadius: 'var(--radius-lg)',
        border: isPrep 
          ? '2px solid var(--brand-pink)' 
          : mode === 'tabata' && !isTabataWork 
            ? '2px solid var(--brand-lilac)' 
            : '1px solid var(--border-subtle)',
        padding: '28px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        position: 'relative',
        boxShadow: isRunning ? 'var(--shadow-glow-pink)' : 'var(--shadow-md)',
        transition: 'all 0.3s ease'
      }}>

        {/* Status Badge */}
        <div style={{
          fontSize: '13px',
          fontWeight: '800',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          padding: '4px 14px',
          borderRadius: 'var(--radius-full)',
          background: isPrep 
            ? 'rgba(255, 45, 120, 0.25)' 
            : mode === 'tabata' 
              ? (isTabataWork ? 'rgba(255, 45, 120, 0.25)' : 'rgba(168, 85, 247, 0.25)')
              : 'rgba(255, 255, 255, 0.08)',
          color: isPrep 
            ? 'var(--brand-pink)' 
            : mode === 'tabata' 
              ? (isTabataWork ? 'var(--brand-pink-hover)' : 'var(--brand-lilac-light)') 
              : 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {isPrep && <Sparkles size={14} className="animate-pulse" />}
          {isPrep 
            ? `PREPARADOS: ${prepSeconds}s` 
            : mode === 'tabata' 
              ? (isTabataWork ? `TRABAJO • RONDA ${tabataRound}/8` : `DESCANSO • RONDA ${tabataRound}/8`)
              : mode === 'emom' 
                ? `MINUTO ${Math.floor(seconds / 60) + 1} DE ${targetMinutes}`
                : mode === 'amrap' 
                  ? `AMRAP ${targetMinutes} MIN` 
                  : 'FOR TIME'}
        </div>

        {/* Digital Time Numbers */}
        <div style={{
          fontFamily: 'monospace, var(--font-heading)',
          fontSize: isPrep ? '86px' : '72px',
          fontWeight: '900',
          letterSpacing: '0.04em',
          lineHeight: 1,
          color: isPrep 
            ? 'var(--brand-pink)' 
            : mode === 'tabata' && !isTabataWork 
              ? 'var(--brand-lilac-light)' 
              : '#ffffff',
          textShadow: isPrep 
            ? '0 0 25px rgba(255, 45, 120, 0.6)' 
            : '0 0 20px rgba(255, 45, 120, 0.35)',
          transition: 'all 0.15s ease'
        }}>
          {isPrep ? (
            prepSeconds
          ) : mode === 'fortime' ? (
            formatTime(seconds)
          ) : mode === 'amrap' ? (
            formatTime(remainingSeconds)
          ) : mode === 'emom' ? (
            `${(60 - (seconds % 60) === 60 ? '00' : (60 - (seconds % 60)).toString().padStart(2, '0'))}s`
          ) : (
            `${tabataIntervalSeconds.toString().padStart(2, '0')}s`
          )}
        </div>

        {/* Sub-info details (EMOM tiempo acumulado) */}
        {mode === 'emom' && !isPrep && (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
            Tiempo Total Transcurrido: <span style={{ color: '#ffffff' }}>{formatTime(seconds)}</span>
          </div>
        )}

        {/* AMRAP Round Counter */}
        {mode === 'amrap' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginTop: '4px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Rondas Completadas:
            </span>
            <button
              onClick={() => setCompletedRounds(r => Math.max(0, r - 1))}
              style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-secondary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Minus size={14} />
            </button>
            <span style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--brand-pink)' }}>
              {completedRounds}
            </span>
            <button
              onClick={() => {
                setCompletedRounds(r => r + 1);
                boxAudio.playCountdownBeep(950);
              }}
              style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--brand-gradient)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Plus size={14} />
            </button>
          </div>
        )}

        {/* Botón para finalizar For Time de forma triunfal */}
        {mode === 'fortime' && isRunning && !isPrep && (
          <button
            onClick={handleFinishForTime}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '800',
              letterSpacing: '0.04em',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              marginTop: '4px'
            }}
          >
            <CheckCircle size={18} />
            ¡PARAR CRONO Y REGISTRAR TIEMPO!
          </button>
        )}

        {/* Main Controls: Start/Pause/Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
          <button
            onClick={resetTimer}
            title="Reiniciar reloj"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)'
            }}
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={isRunning ? handlePause : handleStart}
            title={isRunning ? 'Pausar' : 'Iniciar cuenta atrás'}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: isRunning ? 'var(--bg-surface-elevated)' : 'var(--brand-gradient)',
              border: isRunning ? '2px solid var(--brand-pink)' : 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isRunning ? 'none' : 'var(--brand-gradient-glow)',
              transition: 'all var(--transition-fast)',
              transform: 'scale(1.05)'
            }}
          >
            {isRunning ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: '3px' }} />}
          </button>
        </div>
      </div>

      {/* Ajustes de Preparación y Minutos */}
      {!isRunning && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Selector de segundos de preparación previa */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
              CUENTA ATRÁS PREVIA:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { sec: 10, label: '10s' },
                { sec: 5, label: '5s' },
                { sec: 3, label: '3s' }
              ].map(opt => (
                <button
                  key={opt.sec}
                  onClick={() => {
                    setPrepDuration(opt.sec);
                    setPrepSeconds(opt.sec);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: prepDuration === opt.sec ? 'var(--brand-pink)' : 'var(--bg-surface)',
                    color: '#ffffff',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Minutes for AMRAP / EMOM */}
          {(mode === 'amrap' || mode === 'emom') && (
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                DURACIÓN TOTAL (MINUTOS):
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[10, 12, 15, 18, 20, 24, 30].map(mins => (
                  <button
                    key={mins}
                    onClick={() => {
                      setTargetMinutes(mins);
                      setRemainingSeconds(mins * 60);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 2px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      fontWeight: '700',
                      background: targetMinutes === mins ? 'var(--brand-gradient)' : 'var(--bg-surface)',
                      color: '#ffffff',
                      border: targetMinutes === mins ? 'none' : '1px solid var(--border-subtle)'
                    }}
                  >
                    {mins}'
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
