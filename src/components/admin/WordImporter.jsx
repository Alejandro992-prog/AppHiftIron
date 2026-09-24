import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Sparkles, RefreshCw, Plus, Trash2, Timer } from 'lucide-react';
import { extractTextFromDocx, parseWorkoutText } from '../../utils/wordParser';
import { DAYS_OF_WEEK, MUSCLE_GROUPS, SAMPLE_WORD_TEXT } from '../../data/initialWorkouts';
import { useWorkouts } from '../../context/WorkoutContext';

export default function WordImporter({ onWorkoutPublished }) {
  const { addWorkout, celebrateCompletion } = useWorkouts();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [showPasteArea, setShowPasteArea] = useState(false);

  // Parsed workout ready for review & publishing
  const [parsedWorkout, setParsedWorkout] = useState(null);

  // Handle .docx file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      setErrorMsg('Por favor selecciona un archivo con extensión .docx de Microsoft Word.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const text = await extractTextFromDocx(file);
      const workout = parseWorkoutText(text, 'mon');
      workout.sourceFileName = file.name;
      // Default muscle group
      workout.muscleGroup = workout.muscleGroup || 'full_body';
      setParsedWorkout(workout);
      setSuccessMsg(`¡Archivo "${file.name}" leído y procesado exitosamente!`);
    } catch (err) {
      console.error(err);
      setErrorMsg(`Error al procesar el archivo Word: ${err.message || 'Formato no soportado'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process text pasted from Word
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      setErrorMsg('Por favor escribe o pega el texto de tu rutina.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const workout = parseWorkoutText(pastedText, 'mon');
      workout.sourceFileName = 'Texto pegado de Word';
      workout.muscleGroup = workout.muscleGroup || 'back_shoulders';
      setParsedWorkout(workout);
      setSuccessMsg('¡Texto estructurado correctamente en secciones y ejercicios!');
    } catch (err) {
      setErrorMsg(err.message || 'Error al procesar el texto.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Load sample text
  const handleLoadSample = () => {
    setPastedText(SAMPLE_WORD_TEXT.trim());
    setShowPasteArea(true);
  };

  // Update timer for a specific section
  const handleUpdateSectionTimer = (sIdx, seconds, label) => {
    if (!parsedWorkout) return;
    const nextSections = [...parsedWorkout.sections];
    nextSections[sIdx] = {
      ...nextSections[sIdx],
      groupTimer: {
        seconds: parseInt(seconds) || 60,
        label: label || `Descanso Grupo ${sIdx + 1}`,
        type: 'rest'
      }
    };
    setParsedWorkout({ ...parsedWorkout, sections: nextSections });
  };

  // Publish to athletes
  const handlePublish = () => {
    if (!parsedWorkout) return;

    // Ensure all sections have a group timer
    const completeWorkout = {
      ...parsedWorkout,
      sections: parsedWorkout.sections.map((s, idx) => ({
        ...s,
        groupTimer: s.groupTimer || { seconds: 90, label: `Descanso Grupo ${idx + 1} (90s)`, type: 'rest' }
      }))
    };

    addWorkout(completeWorkout);
    celebrateCompletion();
    setSuccessMsg(`¡Rutina "${completeWorkout.title}" publicada en el Box con éxito para los atletas!`);
    if (onWorkoutPublished) {
      onWorkoutPublished(completeWorkout);
    }
    setParsedWorkout(null);
    setPastedText('');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Informative Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(255, 45, 120, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-pink)' }}>
          <Sparkles size={16} />
          <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            HERRAMIENTA EXCLUSIVA DE ENTRENADORES
          </span>
        </div>
        <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#ffffff' }}>
          Importador de Rutinas Word (.docx) &amp; Cronómetros por Grupos
        </h3>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          Arrastra tu documento de Word donde tienes redactadas las rutinas de gimnasio o pega el texto. Podrás asignar el grupo muscular, el día semanal y preconfigurar el cronómetro de cada grupo de ejercicios.
        </p>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          fontSize: '13px'
        }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-success-bg)',
          color: 'var(--color-success)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          fontSize: '13px'
        }}>
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Drop Zone */}
      {!parsedWorkout && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '36px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed rgba(255, 45, 120, 0.4)',
            background: 'var(--bg-secondary)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all var(--transition-fast)'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-pink)'
            }}>
              <UploadCloud size={28} />
            </div>

            <div>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', display: 'block' }}>
                Seleccionar o soltar archivo Word (.docx)
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                Se procesará de forma segura en tu navegador sin salir de tu dispositivo.
              </span>
            </div>

            <input
              type="file"
              accept=".docx,.doc"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={isProcessing}
            />

            <span className="btn-secondary" style={{ padding: '8px 18px', fontSize: '12px', pointerEvents: 'none' }}>
              {isProcessing ? 'Analizando archivo Word...' : 'Examinar archivo'}
            </span>
          </label>

          {/* Alternative: Paste from Word */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="var(--brand-lilac-light)" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>
                  ¿Prefieres copiar y pegar desde tu Word?
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPasteArea(!showPasteArea)}
                style={{ fontSize: '12px', fontWeight: '700', color: 'var(--brand-pink)' }}
              >
                {showPasteArea ? 'Ocultar' : 'Pegar texto'}
              </button>
            </div>

            {showPasteArea && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea
                  rows={8}
                  placeholder="Pega aquí el contenido de tu documento de Word..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12.5px',
                    lineHeight: 1.5,
                    fontFamily: 'monospace'
                  }}
                />

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 12px' }}
                  >
                    Cargar plantilla de gimnasio
                  </button>

                  <button
                    type="button"
                    onClick={handleProcessPastedText}
                    className="btn-primary"
                    style={{ fontSize: '12px', padding: '8px 16px' }}
                    disabled={isProcessing}
                  >
                    Analizar Texto ⚡
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Parsed Workout Preview & Publishing Editor */}
      {parsedWorkout && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-highlight)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} color="var(--brand-pink)" />
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                Vista Previa de la Rutina y Cronómetros
              </span>
            </div>

            <button
              onClick={() => setParsedWorkout(null)}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '6px 10px' }}
            >
              Cancelar / Cambiar
            </button>
          </div>

          {/* Configurable Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
            {/* Muscle Group */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                GRUPO MUSCULAR:
              </label>
              <select
                value={parsedWorkout.muscleGroup || 'full_body'}
                onChange={(e) => setParsedWorkout({ ...parsedWorkout, muscleGroup: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  fontWeight: '700'
                }}
              >
                <option value="full_body">Full Body (Cuerpo Entero)</option>
                <option value="biceps_triceps">Bíceps y Tríceps</option>
                <option value="back_shoulders">Espalda y Hombros</option>
                <option value="chest_triceps">Pecho y Tríceps</option>
                <option value="legs_glutes">Pierna y Glúteo</option>
                <option value="crossfit_wod">CrossFit WOD Box</option>
              </select>
            </div>

            {/* Day of week for coach plan */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                DÍA ASIGNADO EN EL PLAN:
              </label>
              <select
                value={parsedWorkout.dayId}
                onChange={(e) => setParsedWorkout({ ...parsedWorkout, dayId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  fontWeight: '700'
                }}
              >
                {DAYS_OF_WEEK.map(d => (
                  <option key={d.id} value={d.id}>{d.fullLabel}</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                TIPO / ETIQUETA:
              </label>
              <input
                type="text"
                value={parsedWorkout.type}
                onChange={(e) => setParsedWorkout({ ...parsedWorkout, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  fontWeight: '700'
                }}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              TÍTULO DE LA RUTINA:
            </label>
            <input
              type="text"
              value={parsedWorkout.title}
              onChange={(e) => setParsedWorkout({ ...parsedWorkout, title: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                fontSize: '14px',
                fontWeight: '800'
              }}
            />
          </div>

          {/* Sections detected with Timer Config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)' }}>
              GRUPOS DE EJERCICIOS Y CRONÓMETROS PRECONFIGURADOS:
            </span>

            {parsedWorkout.sections?.map((section, sIdx) => {
              const currentTimerSec = section.groupTimer?.seconds || 90;
              return (
                <div 
                  key={sIdx}
                  style={{
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--brand-pink)' }}>
                      {section.name}
                    </span>

                    {/* Preconfigured Timer Dropdown for Coach */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Timer size={14} color="var(--brand-lilac-light)" />
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        Cronómetro:
                      </span>
                      <select
                        value={currentTimerSec}
                        onChange={(e) => handleUpdateSectionTimer(sIdx, e.target.value, `Descanso ${e.target.value}s`)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-xs)',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: 'var(--brand-lilac-light)'
                        }}
                      >
                        <option value="45">45 seg (Aislamiento)</option>
                        <option value="60">60 seg (1 min)</option>
                        <option value="75">75 seg</option>
                        <option value="90">90 seg (Fuerza moderada)</option>
                        <option value="120">120 seg (2 min - Básico pesado)</option>
                        <option value="180">180 seg (3 min)</option>
                        <option value="300">5 min (Bloque / Circuito)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {section.exercises?.map((ex, eIdx) => (
                      <div 
                        key={eIdx}
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(255, 255, 255, 0.03)',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        <span style={{ fontWeight: '600', color: '#ffffff' }}>• {ex.name}</span>
                        <span style={{ color: 'var(--brand-lilac-light)', fontSize: '11px' }}>{ex.reps || ex.sets}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Publish CTA */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              onClick={handlePublish}
              className="btn-primary"
              style={{ flex: 1, padding: '14px 20px', fontSize: '14px' }}
            >
              Publicar Rutina en el Gimnasio para Atletas 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
