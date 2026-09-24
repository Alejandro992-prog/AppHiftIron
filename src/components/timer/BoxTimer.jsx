import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Plus, Minus, Flame, Timer as TimerIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

// Web Audio API beep synthesizer (no external audio files required, works 100% offline)
function playBeep(frequency = 880, duration = 0.15, type = 'sine') {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    // Audio context might be restricted before user gesture
  }
}

export default function BoxTimer({ initialPreset = null }) {
  const [mode, setMode] = useState(initialPreset?.type || 'fortime'); // 'fortime' | 'amrap' | 'emom' | 'tabata'
  const [isRunning, setIsRunning] = useState(false);
  const [isPrep, setIsPrep] = useState(false);
  const [prepSeconds, setPrepSeconds] = useState(10);
  const [soundEnabled, setSoundEnabled] = useState(true);

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
      // 10-second preparation countdown
      if (isPrep) {
        setPrepSeconds(prev => {
          if (prev <= 1) {
            setIsPrep(false);
            if (soundEnabled) playBeep(1200, 0.5, 'square'); // High pitch GO beep
            return 10;
          }
          if (prev <= 4 && soundEnabled) {
            playBeep(700, 0.15, 'sine'); // 3, 2, 1 prep beeps
          }
          return prev - 1;
        });
        return;
      }

      // Active Workout Modes
      if (mode === 'fortime') {
        setSeconds(prev => prev + 1);
      } else if (mode === 'amrap') {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (soundEnabled) playBeep(1300, 0.7, 'square');
            confetti({ particleCount: 70, spread: 60, colors: ['#ff2d78', '#a855f7'] });
            return 0;
          }
          if (prev <= 4 && soundEnabled) playBeep(700, 0.15);
          return prev - 1;
        });
      } else if (mode === 'emom') {
        setSeconds(prev => {
          const next = prev + 1;
          const currentMinuteSec = next % 60;
          if (currentMinuteSec === 57 || currentMinuteSec === 58 || currentMinuteSec === 59) {
            if (soundEnabled) playBeep(700, 0.15);
          } else if (currentMinuteSec === 0) {
            if (soundEnabled) playBeep(1200, 0.4, 'triangle');
          }
          if (next >= targetMinutes * 60) {
            setIsRunning(false);
            if (soundEnabled) playBeep(1400, 0.8);
            return targetMinutes * 60;
          }
          return next;
        });
      } else if (mode === 'tabata') {
        setTabataIntervalSeconds(prev => {
          if (prev <= 1) {
            if (isTabataWork) {
              // Switch to REST
              if (soundEnabled) playBeep(600, 0.3);
              setIsTabataWork(false);
              return 10;
            } else {
              // Switch to WORK (Next round)
              if (tabataRound >= 8) {
                // Done all 8 rounds
                setIsRunning(false);
                if (soundEnabled) playBeep(1400, 0.8, 'square');
                confetti({ particleCount: 80, spread: 70 });
                return 0;
              }
              if (soundEnabled) playBeep(1200, 0.4, 'square');
              setTabataRound(r => r + 1);
              setIsTabataWork(true);
              return 20;
            }
          }
          if (prev <= 4 && soundEnabled) playBeep(750, 0.1);
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning, isPrep, mode, soundEnabled, targetMinutes, isTabataWork, tabataRound]);

  const handleStart = () => {
    setIsPrep(true);
    setPrepSeconds(10);
    setIsRunning(true);
    if (soundEnabled) playBeep(880, 0.1);
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPrep(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPrep(false);
    setPrepSeconds(10);
    setSeconds(0);
    setRemainingSeconds(targetMinutes * 60);
    setTabataRound(1);
    setIsTabataWork(true);
    setTabataIntervalSeconds(20);
    setCompletedRounds(0);
  };

  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
        {/* Sound toggle button */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          style={{
            position: 'absolute',
            top: '14px',
            right: '16px',
            color: soundEnabled ? 'var(--brand-pink)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: '600'
          }}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Status Badge */}
        <div style={{
          fontSize: '13px',
          fontWeight: '800',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          padding: '4px 14px',
          borderRadius: 'var(--radius-full)',
          background: isPrep 
            ? 'rgba(255, 45, 120, 0.2)' 
            : mode === 'tabata' 
              ? (isTabataWork ? 'rgba(255, 45, 120, 0.2)' : 'rgba(168, 85, 247, 0.2)')
              : 'rgba(255, 255, 255, 0.08)',
          color: isPrep 
            ? 'var(--brand-pink)' 
            : mode === 'tabata' 
              ? (isTabataWork ? 'var(--brand-pink-hover)' : 'var(--brand-lilac-light)') 
              : 'var(--text-secondary)'
        }}>
          {isPrep 
            ? 'PREP COUNTDOWN' 
            : mode === 'tabata' 
              ? (isTabataWork ? `WORK • RONDA ${tabataRound}/8` : `REST • RONDA ${tabataRound}/8`)
              : mode === 'emom' 
                ? `MINUTO ${Math.floor(seconds / 60) + 1} DE ${targetMinutes}`
                : mode === 'amrap' 
                  ? `AMRAP ${targetMinutes} MIN` 
                  : 'FOR TIME'}
        </div>

        {/* Digital Time Numbers */}
        <div style={{
          fontFamily: 'monospace, var(--font-heading)',
          fontSize: isPrep ? '76px' : '68px',
          fontWeight: '900',
          letterSpacing: '0.04em',
          lineHeight: 1,
          color: isPrep 
            ? 'var(--brand-pink)' 
            : mode === 'tabata' && !isTabataWork 
              ? 'var(--brand-lilac-light)' 
              : '#ffffff',
          textShadow: '0 0 20px rgba(255, 45, 120, 0.4)'
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

        {/* Sub-info details (e.g. EMOM total time or Tabata bar) */}
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
            marginTop: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-surface)'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Rondas:
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
                if (soundEnabled) playBeep(950, 0.1);
              }}
              style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--brand-gradient)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Plus size={14} />
            </button>
          </div>
        )}

        {/* Main Controls: Start/Pause/Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '10px' }}>
          <button
            onClick={resetTimer}
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

      {/* Preset Minutes for AMRAP / EMOM */}
      {(mode === 'amrap' || mode === 'emom') && !isRunning && (
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
            DURACIÓN DEL BLOQUE (MINUTOS):
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
  );
}
