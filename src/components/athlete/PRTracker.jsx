import React, { useState } from 'react';
import { Trophy, Plus, Trash2, Calendar, Award, Dumbbell } from 'lucide-react';
import { useWorkouts } from '../../context/WorkoutContext';

export default function PRTracker() {
  const { prs, addPr, deletePr } = useWorkouts();
  const [showAddModal, setShowAddModal] = useState(false);
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [category, setCategory] = useState('weightlifting');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!exercise.trim() || !weight.trim()) return;

    addPr({
      exercise: exercise.trim(),
      weight: weight.trim(),
      category: category
    });

    setExercise('');
    setWeight('');
    setShowAddModal(false);
  };

  const categoryLabels = {
    weightlifting: 'Halterofilia',
    strength: 'Fuerza Gimnasio',
    wod: 'WOD / Metcon',
    gymnastic: 'Gimnásticos'
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(255, 45, 120, 0.3)',
        padding: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-pink)' }}>
            <Trophy size={16} />
            <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              PANEL DE RÉCORDS (PRs)
            </span>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', marginTop: '4px' }}>
            Tus Mejores Marcas
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Lleva el registro de tus pesos máximos y tiempos de referencia.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
          style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '12px', flexShrink: 0 }}
        >
          <Plus size={16} />
          <span>Nuevo PR</span>
        </button>
      </div>

      {/* PR Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
        {prs.map((pr) => (
          <div
            key={pr.id}
            className="card-dark"
            style={{
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '10px',
              borderLeft: '3px solid var(--brand-pink)',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  color: 'var(--brand-lilac-light)'
                }}>
                  {categoryLabels[pr.category] || 'Marca'}
                </span>

                <button
                  onClick={() => deletePr(pr.id)}
                  title="Eliminar marca"
                  style={{ color: 'var(--text-muted)', padding: '2px' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>
                {pr.exercise}
              </h4>
            </div>

            <div>
              <div style={{
                fontSize: '20px',
                fontWeight: '900',
                fontFamily: 'var(--font-heading)',
                background: 'var(--brand-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {pr.weight}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                <Calendar size={11} />
                <span>{pr.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add PR Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 100
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            width: '100%',
            maxWidth: '380px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff' }}>
              Registrar Nuevo PR / Marca
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Ejercicio o Benchmark
                </label>
                <input
                  type="text"
                  placeholder="Ej: Snatch, Back Squat, Fran..."
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Peso o Tiempo alcanzado
                </label>
                <input
                  type="text"
                  placeholder="Ej: 102.5 kg o 3:15 min"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px'
                  }}
                >
                  <option value="weightlifting">Halterofilia (Snatch, C&amp;J)</option>
                  <option value="strength">Fuerza / Gimnasio (Sentadilla, Banca, Peso Muerto)</option>
                  <option value="wod">WOD / Benchmark (Fran, Murph, Cindy)</option>
                  <option value="gymnastic">Gimnásticos (Muscle-ups, Pull-ups)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  Guardar PR 💥
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
