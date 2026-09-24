import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, ChevronRight, Check, Award, Timer as TimerIcon, Volume2, VolumeX, Sparkles, Layers } from 'lucide-react';
import { useWorkouts } from '../../context/WorkoutContext';

// Offline beep generator for group timer
function playGroupBeep(freq = 880, duration = 0.15) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    // Audio context may be restricted
  }
}

export default function RoutineDetail({ workout, onBack, onOpenTimerWithPreset }) {
  const { completedExercises, toggleExercise, celebrateCompletion } = useWorkouts();

  // Active section/group index (stepper)
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  // Group Timer State
  const sections = workout?.sections || [];
  const currentSection = sections[activeGroupIndex] || sections[0];
  const initialSeconds = currentSection?.groupTimer?.seconds || 90;

  const [timerSeconds, setTimerSeconds] = useState(initialSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef(null);

  // When active group changes, update the timer with the new group's preconfigured duration
  useEffect(() => {
    const newSeconds = currentSection?.groupTimer?.seconds || 90;
    setTimerSeconds(newSeconds);
    setIsTimerRunning(false);
    clearInterval(intervalRef.current);
  }, [activeGroupIndex, workout]);

  // Group Timer interval logic
  useEffect(() => {
    if (!isTimerRunning) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          if (soundEnabled) playGroupBeep(1200, 0.6); // Finish beep
          return 0;
        }
        if (prev <= 4 && soundEnabled) {
          playGroupBeep(700, 0.1); // 3, 2, 1 beeps
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isTimerRunning, soundEnabled]);

  if (!workout) return null;

  // Format mm:ss
  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleNextGroup = () => {
    if (activeGroupIndex < sections.length - 1) {
      setActiveGroupIndex(prev => prev + 1);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    } else {
      celebrateCompletion();
    }
  };

  const handlePrevGroup = () => {
    if (activeGroupIndex > 0) {
      setActiveGroupIndex(prev => prev - 1);
    }
  };

  const resetCurrentTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(currentSection?.groupTimer?.seconds || 90);
  };

  // Count done
  let totalExercises = 0;
  let doneCount = 0;
  sections.forEach((sec, sIdx) => {
    sec.exercises?.forEach((_, eIdx) => {
      totalExercises++;
      if (completedExercises[`${workout.id}_${sIdx}_${eIdx}`]) {
        doneCount++;
      }
    });
  });

  const allCompleted = totalExercises > 0 && doneCount === totalExercises;
  const isLastGroup = activeGroupIndex === sections.length - 1;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: '700',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <ArrowLeft size={16} />
          <span>Volver al Catálogo</span>
        </button>

        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--brand-lilac-light)' }}>
          {workout.duration}
        </span>
      </div>

      {/* Routine Title Card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-secondary) 100%)',
        borderRadius: 'var(--radius-md)',
        padding: '18px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge-brand" style={{ fontSize: '10px' }}>
            {workout.type || 'GIMNASIO'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
            {sections.length} Grupos de Ejercicios
          </span>
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', lineHeight: 1.25 }}>
          {workout.title}
        </h1>

        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {workout.description}
        </p>
      </div>

      {/* Group Stepper Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        padding: '2px 0',
        scrollbarWidth: 'none'
      }}>
        {sections.map((sec, idx) => {
          const isActive = activeGroupIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => setActiveGroupIndex(idx)}
              style={{
                flexShrink: 0,
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11.5px',
                fontWeight: '800',
                background: isActive ? 'var(--brand-gradient)' : 'var(--bg-secondary)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? '1px solid transparent' : '1px solid var(--border-subtle)',
                boxShadow: isActive ? 'var(--brand-gradient-glow)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              G{idx + 1}: {sec.name.split(':')[0].replace(/GRUPO\s*\d+/i, '').trim() || `Bloque ${idx + 1}`}
            </button>
          );
        })}
      </div>

      {/* Preconfigured Group Timer Widget */}
      <div style={{
        background: 'radial-gradient(circle at 50% 0%, #201735 0%, #12121a 90%)',
        borderRadius: 'var(--radius-md)',
        border: '1.5px solid var(--border-highlight)',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: isTimerRunning ? '0 0 24px rgba(255, 45, 120, 0.25)' : 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TimerIcon size={16} color="var(--brand-pink)" />
            <span style={{ fontSize: '11.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--brand-pink)' }}>
              CRONÓMETRO PRECONFIGURADO DEL GRUPO {activeGroupIndex + 1}
            </span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{ color: soundEnabled ? 'var(--brand-pink)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>
              {currentSection?.groupTimer?.label || 'Descanso entre series'}
            </span>
            <div style={{
              fontSize: '32px',
              fontWeight: '900',
              fontFamily: 'monospace, var(--font-heading)',
              color: timerSeconds === 0 ? 'var(--brand-pink)' : '#ffffff',
              letterSpacing: '0.04em'
            }}>
              {formatTimer(timerSeconds)}
            </div>
          </div>

          {/* Timer Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={resetCurrentTimer}
              title="Reiniciar cronómetro del grupo"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                background: isTimerRunning ? 'var(--bg-surface-elevated)' : 'var(--brand-gradient)',
                border: isTimerRunning ? '1px solid var(--brand-pink)' : 'none',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isTimerRunning ? 'none' : 'var(--brand-gradient-glow)'
              }}
            >
              {isTimerRunning ? (
                <>
                  <Pause size={16} />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" />
                  <span>Iniciar Crono</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Active Section Exercises */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden'
      }}>
        {/* Section Title */}
        <div style={{
          background: 'var(--bg-surface)',
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--brand-lilac-light)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
              GRUPO {activeGroupIndex + 1} DE {sections.length}
            </span>
            <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
              {currentSection?.name}
            </h3>
          </div>

          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
            {currentSection?.duration}
          </span>
        </div>

        {/* Exercises in current group */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {currentSection?.exercises?.map((exercise, eIdx) => {
            const key = `${workout.id}_${activeGroupIndex}_${eIdx}`;
            const isChecked = !!completedExercises[key];

            return (
              <div
                key={eIdx}
                onClick={() => toggleExercise(key)}
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  borderBottom: eIdx < currentSection.exercises.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer',
                  background: isChecked ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                  transition: 'background var(--transition-fast)'
                }}
              >
                {/* Circle Checkbox */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  marginTop: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isChecked ? 'var(--color-success)' : 'var(--bg-surface)',
                  border: isChecked ? 'none' : '2px solid var(--border-medium)',
                  color: '#ffffff',
                  flexShrink: 0,
                  transition: 'all var(--transition-fast)'
                }}>
                  {isChecked && <Check size={14} strokeWidth={3} />}
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: isChecked ? 'var(--text-secondary)' : '#ffffff',
                    textDecoration: isChecked ? 'line-through' : 'none'
                  }}>
                    {exercise.name}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {exercise.sets && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-xs)',
                        background: 'rgba(255, 45, 120, 0.15)',
                        color: 'var(--brand-pink)'
                      }}>
                        {exercise.sets}
                      </span>
                    )}
                    {exercise.reps && (
                      <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--brand-lilac-light)' }}>
                        {exercise.reps}
                      </span>
                    )}
                  </div>

                  {exercise.notes && (
                    <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                      💡 {exercise.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stepper Controls: Siguiente Grupo Button */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {activeGroupIndex > 0 && (
          <button
            onClick={handlePrevGroup}
            className="btn-secondary"
            style={{ padding: '12px 16px', fontSize: '12.5px' }}
          >
            Grupo Anterior
          </button>
        )}

        <button
          onClick={handleNextGroup}
          className="btn-primary"
          style={{ flex: 1, padding: '14px', fontSize: '13.5px', borderRadius: 'var(--radius-sm)' }}
        >
          {isLastGroup ? (
            <>
              <Award size={18} />
              <span>¡Finalizar Rutina Completa! 💥</span>
            </>
          ) : (
            <>
              <span>Siguiente Grupo ({activeGroupIndex + 2}/{sections.length})</span>
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>

      {/* Optional WOD Timer launcher if user wants full screen timer */}
      {workout.targetTimerType && (
        <button
          onClick={() => {
            onOpenTimerWithPreset({ type: workout.targetTimerType, minutes: workout.timerMinutes || 15 });
          }}
          className="btn-secondary"
          style={{ width: '100%', padding: '10px', fontSize: '12px' }}
        >
          <TimerIcon size={15} />
          <span>Abrir Cronómetro WOD Pantalla Completa</span>
        </button>
      )}
    </div>
  );
}
