import React, { useState } from 'react';
import { X, Plus, Trash2, Dumbbell, Flame, Check } from 'lucide-react';
import { useWorkouts } from '../../context/WorkoutContext';
import { DAYS_OF_WEEK, MUSCLE_GROUPS } from '../../data/initialWorkouts';

export default function CreateRoutineModal({ isOpen, onClose, defaultZone = 'traditional' }) {
  const { addWorkout, celebrateCompletion } = useWorkouts();

  const [title, setTitle] = useState('');
  const [zone, setZone] = useState(defaultZone); // 'competitors' | 'traditional'
  const [dayId, setDayId] = useState('mon');
  const [muscleGroup, setMuscleGroup] = useState('full_body');
  const [duration, setDuration] = useState('50 MIN');
  const [level, setLevel] = useState('Intermedio / Avanzado');
  const [description, setDescription] = useState('');

  // Structured blocks
  const [sections, setSections] = useState([
    {
      name: 'BLOQUE 1: CALENTAMIENTO Y ACTIVACIÓN',
      duration: '10 min',
      groupTimer: { seconds: 60, label: 'Descanso 60s', type: 'rest' },
      exercises: [
        { name: 'Remo suave o trote suave', sets: '1 set', reps: '500m', notes: 'Pulsaciones en zona 2' },
        { name: 'Movilidad articular con pica o gomas', sets: '2 sets', reps: '10 reps', notes: 'Rango de movimiento completo' }
      ]
    },
    {
      name: 'BLOQUE 2: TRABAJO PRINCIPAL DE FUERZA',
      duration: '25 min',
      groupTimer: { seconds: 90, label: 'Descanso entre series (90s)', type: 'rest' },
      exercises: [
        { name: 'Ejercicio multiarticular principal', sets: '4 series', reps: '8-10 reps', notes: 'RIR 1-2. Buen control de la fase excéntrica.' }
      ]
    }
  ]);

  if (!isOpen) return null;

  // Add exercise to section
  const handleAddExercise = (sectionIndex) => {
    setSections(prev => {
      const updated = [...prev];
      updated[sectionIndex].exercises.push({
        name: '',
        sets: '3 series',
        reps: '10-12 reps',
        notes: ''
      });
      return updated;
    });
  };

  // Remove exercise from section
  const handleRemoveExercise = (sectionIndex, exerciseIndex) => {
    setSections(prev => {
      const updated = [...prev];
      updated[sectionIndex].exercises.splice(exerciseIndex, 1);
      return updated;
    });
  };

  // Update exercise field
  const handleExerciseChange = (sectionIndex, exerciseIndex, field, value) => {
    setSections(prev => {
      const updated = [...prev];
      updated[sectionIndex].exercises[exerciseIndex][field] = value;
      return updated;
    });
  };

  // Add a new section block
  const handleAddSection = () => {
    setSections(prev => [
      ...prev,
      {
        name: `BLOQUE ${prev.length + 1}: NUEVO BLOQUE`,
        duration: '15 min',
        groupTimer: { seconds: 60, label: 'Descanso 60s', type: 'rest' },
        exercises: [{ name: '', sets: '3 series', reps: '10 reps', notes: '' }]
      }
    ]);
  };

  // Remove section
  const handleRemoveSection = (sectionIndex) => {
    if (sections.length <= 1) return;
    setSections(prev => prev.filter((_, idx) => idx !== sectionIndex));
  };

  // Update section name
  const handleSectionNameChange = (sectionIndex, newName) => {
    setSections(prev => {
      const updated = [...prev];
      updated[sectionIndex].name = newName;
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newWorkout = {
      id: `manual-workout-${Date.now()}`,
      zone,
      dayId,
      muscleGroup: zone === 'traditional' ? muscleGroup : 'crossfit_wod',
      title: title.trim(),
      category: zone === 'competitors' ? 'crossfit_competitor' : 'gym',
      type: zone === 'competitors' ? 'CROSSFIT COMPETITORS' : 'GIMNASIO / MUSCULACIÓN',
      duration: duration.trim() || '50 MIN',
      level: level.trim() || 'Todos los niveles',
      description: description.trim() || `Sesión diseñada por el Head Coach para ${DAYS_OF_WEEK.find(d => d.id === dayId)?.fullLabel}.`,
      sections: sections.map(s => ({
        ...s,
        exercises: s.exercises.filter(ex => ex.name.trim().length > 0)
      }))
    };

    addWorkout(newWorkout);
    celebrateCompletion();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 100
    }}>
      <div 
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Plus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                Añadir Rutina Manualmente
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Crea una sesión personalizada para Competidores o Gimnasio
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Target Zone Selector */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              ZONA DE ENTRENAMIENTO
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setZone('competitors')}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: zone === 'competitors' ? '1.5px solid var(--brand-pink)' : '1px solid var(--border-subtle)',
                  background: zone === 'competitors' ? 'rgba(255, 45, 120, 0.15)' : 'var(--bg-surface)',
                  color: zone === 'competitors' ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Flame size={15} color="var(--brand-pink)" />
                <span>Zona Competidores</span>
              </button>

              <button
                type="button"
                onClick={() => setZone('traditional')}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: zone === 'traditional' ? '1.5px solid var(--brand-lilac-light)' : '1px solid var(--border-subtle)',
                  background: zone === 'traditional' ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-surface)',
                  color: zone === 'traditional' ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Dumbbell size={15} color="var(--brand-lilac-light)" />
                <span>Gimnasio Tradicional</span>
              </button>
            </div>
          </div>

          {/* Routine Title */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              TÍTULO DE LA RUTINA *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Pecho y Tríceps - Hipertrofia o Snatch Wave & WOD"
              required
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#ffffff',
                outline: 'none'
              }}
            />
          </div>

          {/* Day & Muscle Group / Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                DÍA PROGRAMADO
              </label>
              <select
                value={dayId}
                onChange={(e) => setDayId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 10px',
                  fontSize: '12px',
                  color: '#ffffff',
                  outline: 'none'
                }}
              >
                {DAYS_OF_WEEK.map(d => (
                  <option key={d.id} value={d.id} style={{ background: '#1c1b26' }}>{d.fullLabel}</option>
                ))}
              </select>
            </div>

            {zone === 'traditional' ? (
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  GRUPO MUSCULAR
                </label>
                <select
                  value={muscleGroup}
                  onChange={(e) => setMuscleGroup(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '9px 10px',
                    fontSize: '12px',
                    color: '#ffffff',
                    outline: 'none'
                  }}
                >
                  {MUSCLE_GROUPS.filter(m => m.id !== 'all').map(m => (
                    <option key={m.id} value={m.id} style={{ background: '#1c1b26' }}>{m.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  DURACIÓN ESTIMADA
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Ej: 75 MIN"
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '9px 10px',
                    fontSize: '12px',
                    color: '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              DESCRIPCIÓN / OBJETIVO DE LA SESIÓN
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalla los puntos clave, RIR objetivo o estándares de la sesión..."
              rows={2}
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                fontSize: '12px',
                color: '#ffffff',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          {/* Section Blocks Builder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                BLOQUES DE LA SESIÓN ({sections.length})
              </span>
              <button
                type="button"
                onClick={handleAddSection}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-lilac-light)',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <Plus size={13} />
                <span>Añadir Bloque</span>
              </button>
            </div>

            {sections.map((section, sIdx) => (
              <div
                key={sIdx}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <input
                    type="text"
                    value={section.name}
                    onChange={(e) => handleSectionNameChange(sIdx, e.target.value)}
                    placeholder="Nombre del bloque..."
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '6px 8px',
                      fontSize: '12px',
                      fontWeight: '800',
                      color: '#ffffff',
                      outline: 'none'
                    }}
                  />

                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(sIdx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-danger)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Exercises in section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {section.exercises.map((ex, exIdx) => (
                    <div 
                      key={exIdx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 75px 85px 24px',
                        gap: '6px',
                        alignItems: 'center'
                      }}
                    >
                      <input
                        type="text"
                        value={ex.name}
                        onChange={(e) => handleExerciseChange(sIdx, exIdx, 'name', e.target.value)}
                        placeholder="Nombre ejercicio"
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '6px 8px',
                          fontSize: '11.5px',
                          color: '#ffffff',
                          outline: 'none'
                        }}
                      />
                      <input
                        type="text"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(sIdx, exIdx, 'sets', e.target.value)}
                        placeholder="Series"
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '6px 8px',
                          fontSize: '11px',
                          color: '#ffffff',
                          outline: 'none'
                        }}
                      />
                      <input
                        type="text"
                        value={ex.reps}
                        onChange={(e) => handleExerciseChange(sIdx, exIdx, 'reps', e.target.value)}
                        placeholder="Reps / Peso"
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '6px 8px',
                          fontSize: '11px',
                          color: '#ffffff',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(sIdx, exIdx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px'
                        }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddExercise(sIdx)}
                    style={{
                      background: 'none',
                      border: '1px dashed var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '5px',
                      fontSize: '10.5px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      marginTop: '2px'
                    }}
                  >
                    <Plus size={12} />
                    <span>Añadir Ejercicio al Bloque</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '13px',
              fontSize: '13px',
              borderRadius: 'var(--radius-sm)',
              marginTop: '6px'
            }}
          >
            <Check size={16} />
            <span>Guardar y Publicar Rutina</span>
          </button>
        </form>
      </div>
    </div>
  );
}
