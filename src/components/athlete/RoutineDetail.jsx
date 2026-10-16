import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Check,
  Award,
  Timer as TimerIcon,
  Volume2,
  VolumeX,
  Percent,
  Camera,
  Dumbbell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';
import CompetitorReadinessGate from '../competitors/CompetitorReadinessGate';
import CompetitorAdaptationCard from '../competitors/CompetitorAdaptationCard';
import { getExerciseAdaptation } from '../../utils/recoveryScore';

import { boxAudio } from '../../utils/boxAudio';

// Pitido optimizado usando el motor singleton de Web Audio (sin fugas de AudioContext)
function playGroupBeep(freq = 880, duration = 0.15) {
  try {
    if (freq >= 1100) {
      boxAudio.playBoxBuzzer(duration);
    } else {
      boxAudio.playCountdownBeep(freq);
    }
  } catch {
    // Manejo de restricciones de audio del navegador
  }
}

export default function RoutineDetail({ workout, onBack, onOpenTimerWithPreset }) {
  const { currentUser, isAdmin } = useAuth();
  const {
    completedExercises,
    toggleExercise,
    celebrateCompletion,
    prs,
    openPercentageCalc,
    openStoryModal,
    isDeloadMode,
    getTodayReadiness,
    openReadinessModal
  } = useWorkouts();

  const isCompetitorWorkout = workout?.zone === 'competitors' || workout?.type?.toLowerCase().includes('competitor');
  const todayEntry = getTodayReadiness(currentUser?.id);
  const isCoachOrAdmin = Boolean(isAdmin || currentUser?.role === 'admin');


  // Active section/group index (stepper)
  const [hasCompletedWorkout, setHasCompletedWorkout] = useState(false);
  const [prevInitialIndex, setPrevInitialIndex] = useState(workout?.initialSectionIndex);
  const [activeGroupIndex, setActiveGroupIndex] = useState(workout?.initialSectionIndex || 0);

  if (workout?.initialSectionIndex !== prevInitialIndex) {
    setPrevInitialIndex(workout?.initialSectionIndex);
    if (typeof workout?.initialSectionIndex === 'number') {
      setActiveGroupIndex(workout.initialSectionIndex);
    }
  }

  // Group Timer State
  const sections = workout?.sections || [];
  const currentSection = sections[activeGroupIndex] || sections[0];
  const initialSeconds = currentSection?.groupTimer?.seconds || 90;
  const totalRounds = currentSection?.groupTimer?.rounds || currentSection?.rounds || 1;

  const [currentRound, setCurrentRound] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(initialSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef(null);

  const resetCurrentTimer = () => {
    setIsTimerRunning(false);
    clearInterval(intervalRef.current);
    const newSeconds = currentSection?.groupTimer?.seconds || 90;
    setTimerSeconds(newSeconds);
    setCurrentRound(1);
  };

  const handleNextRoundManually = () => {
    const newSeconds = currentSection?.groupTimer?.seconds || 90;
    setTimerSeconds(newSeconds);
    if (currentRound < totalRounds) {
      setCurrentRound(r => r + 1);
    }
  };

  // When active group changes, update the timer with the new group's preconfigured duration
  const groupTimerDuration = currentSection?.groupTimer?.seconds || 90;
  const prevGroupRef = useRef(activeGroupIndex);
  useEffect(() => {
    if (prevGroupRef.current !== activeGroupIndex) {
      prevGroupRef.current = activeGroupIndex;
      setTimerSeconds(groupTimerDuration);
      setCurrentRound(1);
      setIsTimerRunning(false);
      clearInterval(intervalRef.current);
    }
  }, [activeGroupIndex, groupTimerDuration]);

  // Group Timer interval logic
  useEffect(() => {
    if (!isTimerRunning) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          const newSeconds = currentSection?.groupTimer?.seconds || 90;
          if (currentRound < totalRounds) {
            // Siguiente ronda automática del intervalo (Every X'X")
            setCurrentRound(r => r + 1);
            if (soundEnabled) playGroupBeep(1000, 0.4);
            return newSeconds;
          } else {
            // Fin de todas las rondas del bloque
            setIsTimerRunning(false);
            if (soundEnabled) playGroupBeep(1200, 0.7); // Finish beep
            return 0;
          }
        }
        if (prev <= 4 && soundEnabled) {
          playGroupBeep(700, 0.1); // 3, 2, 1 beeps
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isTimerRunning, soundEnabled, currentRound, totalRounds, currentSection]);

  if (!workout) return null;

  // Block competitor workout if mandatory fatigue test has not been completed
  if (isCompetitorWorkout && !todayEntry && !isCoachOrAdmin) {
    return (
      <CompetitorReadinessGate
        onOpenTest={openReadinessModal}
        onReturnToDashboard={onBack}
        isCoachOrAdmin={isCoachOrAdmin}
        onCoachBypass={() => {}}
      />
    );
  }

  // Format mm:ss
  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Look up relevant PR for exercise
  const getExercisePR = (name = '') => {
    const clean = name.toLowerCase();
    const match = prs.find(p =>
      clean.includes(p.exercise.toLowerCase()) ||
      p.exercise.toLowerCase().includes(clean)
    );
    if (match) {
      const val = parseFloat(match.weight);
      return !isNaN(val) ? { weight: val, name: match.exercise } : null;
    }
    if (clean.includes('snatch')) return { weight: 82.5, name: 'Snatch' };
    if (clean.includes('clean') || clean.includes('jerk')) return { weight: 95, name: 'Clean & Jerk' };
    if (clean.includes('squat') || clean.includes('sentadilla')) return { weight: 140, name: 'Back Squat' };
    if (clean.includes('deadlift') || clean.includes('muerto')) return { weight: 175, name: 'Deadlift' };
    if (clean.includes('banca') || clean.includes('bench')) return { weight: 105, name: 'Bench Press' };
    return null;
  };

  // Extract percentage values like 75%, 80%, etc.
  const extractPercentages = (text = '') => {
    if (!text) return [];
    const matches = [...text.matchAll(/(\d{2}(?:\.\d)?)\s*%/g)];
    const unique = [...new Set(matches.map(m => parseFloat(m[1])))];
    return unique.slice(0, 3); // Top 3 percentages
  };

  const handleNextGroup = () => {
    if (activeGroupIndex < sections.length - 1) {
      setActiveGroupIndex(prev => prev + 1);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    } else {
      setHasCompletedWorkout(true);
      celebrateCompletion();
      openStoryModal({
        title: workout.title,
        type: workout.type,
        duration: workout.duration,
        zone: workout.zone,
        score: '100% Completado'
      });
    }
  };

  const handlePrevGroup = () => {
    if (activeGroupIndex > 0) {
      setActiveGroupIndex(prev => prev - 1);
    }
  };

  // User scoped exercise keys
  const userScope = currentUser?.id || 'anon';
  const getExerciseKey = (sIdx, eIdx) => `${userScope}_${workout.id}_${sIdx}_${eIdx}`;

  const isLastGroup = activeGroupIndex === sections.length - 1;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '12.5px',
            fontWeight: '700',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={15} />
          <span>Volver</span>
        </button>

        {/* Quick Tools: Percentage Calculator & Story Share */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => openPercentageCalc({ exercise: workout.title })}
            title="Calculadora de % 1RM y discos de barra"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 45, 120, 0.12)',
              border: '1px solid rgba(255, 45, 120, 0.3)',
              color: 'var(--brand-pink)',
              fontSize: '11px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            <Percent size={13} />
            <span>% 1RM & Discos</span>
          </button>

          <button
            onClick={() => openStoryModal({
              title: workout.title,
              type: workout.type,
              duration: workout.duration,
              zone: workout.zone
            })}
            title="Generar Story para Instagram"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            <Camera size={13} color="var(--brand-pink)" />
            <span>Story</span>
          </button>
        </div>
      </div>

      {/* Celebration Banner if finished */}
      {hasCompletedWorkout && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.2) 0%, rgba(168, 85, 247, 0.25) 100%)',
          border: '1.5px solid var(--brand-pink)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '10px',
          boxShadow: '0 8px 30px rgba(255, 45, 120, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-pink)' }}>
            <Award size={20} />
            <span style={{ fontSize: '13px', fontWeight: '900', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              ¡ENTRENAMIENTO COMPLETADO CON ÉXITO! 🎉
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#e2e8f0', margin: 0 }}>
            Has finalizado todos los bloques de <strong>{workout.title}</strong>. ¡Comparte tu logro en redes con el diseño oficial de HIFT Iron Box!
          </p>
          <button
            onClick={() => openStoryModal({
              title: workout.title,
              type: workout.type,
              duration: workout.duration,
              zone: workout.zone,
              score: 'WOD COMPLETADO'
            })}
            className="btn-primary"
            style={{
              padding: '10px 18px',
              fontSize: '12.5px',
              fontWeight: '900',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Camera size={15} />
            <span>📸 Compartir en Instagram Stories</span>
          </button>
        </div>
      )}

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

      {/* Adaptation Banner for Competitor workouts */}
      {isCompetitorWorkout && todayEntry && (
        <CompetitorAdaptationCard
          todayEntry={todayEntry}
          onEditTest={openReadinessModal}
          variant="compact"
        />
      )}

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TimerIcon size={16} color="var(--brand-pink)" />
            <span style={{ fontSize: '11.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--brand-pink)' }}>
              {currentSection?.name || `GRUPO ${activeGroupIndex + 1}`}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {totalRounds > 1 && (
              <span style={{
                fontSize: '11px',
                fontWeight: '900',
                background: 'rgba(255, 45, 120, 0.18)',
                color: 'var(--brand-pink)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(255, 45, 120, 0.35)',
                letterSpacing: '0.04em'
              }}>
                RONDA {currentRound} / {totalRounds}
              </span>
            )}

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{ color: soundEnabled ? 'var(--brand-pink)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
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
              {currentSection?.groupTimer?.label || 'Intervalo / Descanso'}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {totalRounds > 1 && (
              <button
                onClick={handleNextRoundManually}
                title="Pasar a la siguiente ronda"
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  color: 'var(--brand-lilac-light)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '11px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                +1 Ronda
              </button>
            )}

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
                  <span>Iniciar</span>
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
            const key = getExerciseKey(activeGroupIndex, eIdx);
            const isChecked = !!completedExercises[key] || !!completedExercises[`${workout.id}_${activeGroupIndex}_${eIdx}`];

            const adaptation = isCompetitorWorkout && todayEntry
              ? getExerciseAdaptation(exercise, todayEntry.finalState || todayEntry.level, todayEntry.volumeReduction)
              : null;

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

                  {/* Sets, Reps & Side-by-side Adaptation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
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

                      {/* Clean Side-by-side Suggestion */}
                      {adaptation && adaptation.adaptedSetsText && (
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-xs)',
                          background: 'rgba(249, 115, 22, 0.2)',
                          color: '#fb923c',
                          border: '1px solid rgba(249, 115, 22, 0.4)'
                        }}>
                          Sugerido: {adaptation.adaptedSetsText}
                        </span>
                      )}
                    </div>

                    {/* Intensity or avoidance note */}
                    {adaptation && adaptation.intensityNote && (
                      <span style={{
                        fontSize: '10.5px',
                        color: '#fdba74',
                        fontWeight: '600'
                      }}>
                        {adaptation.intensityNote}
                      </span>
                    )}
                  </div>

                  {exercise.notes && (
                    <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                      💡 {exercise.notes}
                    </p>
                  )}

                  {/* Automatic 1RM & Percentage Detector */}
                  {(() => {
                    const fullText = `${exercise.name} ${exercise.notes || ''} ${exercise.prescribed_load || ''} ${exercise.rx || ''}`;
                    const pcts = extractPercentages(fullText);
                    if (pcts.length === 0) return null;

                    const relevantPr = getExercisePR(exercise.name);
                    const base1RM = relevantPr ? relevantPr.weight : 80;

                    return (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          openPercentageCalc({
                            exercise: relevantPr?.name || exercise.name,
                            percentage: pcts[0],
                            oneRepMax: base1RM
                          });
                        }}
                        style={{
                          marginTop: '6px',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
                          border: '1px solid rgba(255, 45, 120, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Percent size={12} color="var(--brand-pink)" />
                            <span style={{ fontSize: '10.5px', fontWeight: '900', color: 'var(--brand-pink)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                              Cálculo de Cargas (% de {base1RM}kg {relevantPr ? relevantPr.name : ''})
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            {pcts.map((pct) => {
                              const rawOrig = (base1RM * (pct / 100));
                              const roundedOrig = Math.round(rawOrig / 2.5) * 2.5;

                              const discountPct = isDeloadMode 
                                ? 15 
                                : (adaptation?.pctDiscount || 0);

                              const hasDiscount = discountPct > 0;
                              const rawAdapted = rawOrig * (1 - discountPct / 100);
                              const roundedAdapted = Math.round(rawAdapted / 2.5) * 2.5;
                              const adaptedPctNum = Math.round(pct * (1 - discountPct / 100));

                              return (
                                <div key={pct} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', flexWrap: 'wrap' }}>
                                  <span style={{ fontWeight: '800', color: '#ffffff' }}>
                                    <strong style={{ color: 'var(--brand-lilac-light)' }}>{pct}%:</strong> {roundedOrig} kg
                                  </span>

                                  {hasDiscount && (
                                    <span style={{
                                      fontSize: '10px',
                                      fontWeight: '800',
                                      color: todayEntry?.finalState === 'low' ? '#fca5a5' : '#fdba74',
                                      background: 'rgba(0, 0, 0, 0.4)',
                                      padding: '1px 6px',
                                      borderRadius: 'var(--radius-xs)',
                                      border: `1px solid ${todayEntry?.finalState === 'low' ? '#ef4444' : '#f97316'}55`
                                    }}>
                                      👉 Sugerido (-{discountPct}%): {roundedAdapted} kg (~{adaptedPctNum}%)
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10.5px',
                          fontWeight: '800',
                          color: '#ffffff',
                          background: 'var(--brand-gradient)',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-xs)',
                          flexShrink: 0
                        }}>
                          <Dumbbell size={11} />
                          <span>Ver Discos</span>
                        </div>
                      </div>
                    );
                  })()}
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
