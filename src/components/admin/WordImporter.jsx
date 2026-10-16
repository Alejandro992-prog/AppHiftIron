import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Timer
} from 'lucide-react';
import { extractTextFromFile, parseWorkoutText, formatSecondsToTimer } from '../../utils/documentParser';
import { DAYS_OF_WEEK, SAMPLE_WORD_TEXT } from '../../data/initialWorkouts';
import { useWorkouts } from '../../context/WorkoutContext';
import { safeLogger } from '../../utils/validators';

const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function WordImporter({ onWorkoutPublished }) {
  const { addWorkout, celebrateCompletion } = useWorkouts();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);

  // Parsed workout ready for review & publishing
  const [parsedWorkout, setParsedWorkout] = useState(null);

  // Handle PDF or Word file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      setErrorMsg('El archivo seleccionado supera el límite máximo permitido de 10 MB.');
      return;
    }

    const fileName = file.name.toLowerCase();
    const isPdf = fileName.endsWith('.pdf');
    const isDocx = fileName.endsWith('.docx');
    const isDoc = fileName.endsWith('.doc');
    const isTxt = fileName.endsWith('.txt');

    if (isDoc) {
      setErrorMsg('El formato Word binario antiguo (.doc) no es compatible. Por favor guárdalo como .docx (Word moderno) o expórtalo a PDF.');
      return;
    }

    if (!isPdf && !isDocx && !isTxt) {
      setErrorMsg('Por favor selecciona un archivo PDF (.pdf) o Microsoft Word (.docx).');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { text, fileType } = await extractTextFromFile(file);
      const workout = parseWorkoutText(text, 'mon');
      workout.sourceFileName = file.name;
      workout.fileType = fileType;
      workout.muscleGroup = workout.muscleGroup || 'full_body';

      setUploadedFileInfo({
        name: file.name,
        type: fileType,
        sizeKb: Math.round(file.size / 1024)
      });
      setParsedWorkout(workout);
      setSuccessMsg(`¡Documento ${fileType.toUpperCase()} "${file.name}" leído y procesado exitosamente!`);
    } catch (err) {
      safeLogger.error('Error procesando documento en WordImporter:', err);
      setErrorMsg('No se pudo procesar el documento. Comprueba que el formato (.docx o .pdf) sea válido y el contenido sea legible.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Process text pasted directly
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      setErrorMsg('Por favor escribe o pega el texto de tu rutina.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const workout = parseWorkoutText(pastedText, 'mon');
      workout.sourceFileName = 'Texto pegado (Word / PDF)';
      workout.fileType = 'text';
      workout.muscleGroup = workout.muscleGroup || 'back_shoulders';
      setUploadedFileInfo({
        name: 'Texto manual',
        type: 'text',
        sizeKb: Math.round(pastedText.length / 1024)
      });
      setParsedWorkout(workout);
      setSuccessMsg('¡Texto estructurado correctamente en secciones, ejercicios y cronómetros!');
    } catch (err) {
      safeLogger.error('Error procesando texto pegado:', err);
      setErrorMsg('El formato del texto no pudo ser interpretado. Revisa la estructura de bloques y ejercicios.');
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
    const prevTimer = nextSections[sIdx].groupTimer || {};
    const parsedSec = parseInt(seconds) || 60;
    nextSections[sIdx] = {
      ...nextSections[sIdx],
      groupTimer: {
        ...prevTimer,
        seconds: parsedSec,
        intervalSeconds: parsedSec,
        label: label || `${formatSecondsToTimer(parsedSec)} (${prevTimer.rounds ? `${prevTimer.rounds} rondas` : 'Grupo'})`
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
    setUploadedFileInfo(null);
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
          Importador Inteligente de Rutinas (PDF &amp; Word .docx)
        </h3>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          Arrastra cualquier documento en <strong>PDF (.pdf)</strong> o <strong>Word (.docx)</strong> con tus entrenamientos, o pega el texto directamente. El sistema detectará automáticamente los bloques, ejercicios, series, repeticiones y preconfigurará cronómetros por grupos.
        </p>

        {/* Supported Format Pills */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(239, 68, 68, 0.18)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            📄 Documentos PDF (.pdf)
          </span>

          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(56, 189, 248, 0.18)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            📑 Microsoft Word (.docx, .doc)
          </span>

          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(168, 85, 247, 0.18)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            color: 'var(--brand-lilac-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            ⏱️ Cronómetros por Grupos automáticos
          </span>
        </div>
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
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-pink)'
            }}>
              <UploadCloud size={30} />
            </div>

            <div>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', display: 'block' }}>
                Seleccionar o soltar archivo PDF (.pdf) o Word (.docx)
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                Extracción segura 100% en tu navegador (compatible con programaciones PDF y Word).
              </span>
            </div>

            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={isProcessing}
            />

            <span className="btn-secondary" style={{ padding: '8px 18px', fontSize: '12px', pointerEvents: 'none' }}>
              {isProcessing ? 'Procesando documento...' : 'Examinar archivo PDF o Word'}
            </span>
          </label>

          {/* Alternative: Paste from Word or PDF */}
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
                  ¿Prefieres copiar y pegar el texto de tu PDF o Word?
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
                  placeholder="Pega aquí el contenido de tu documento PDF o Word..."
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
                    Cargar plantilla de ejemplo
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
              <div>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', display: 'block' }}>
                  Vista Previa de la Rutina y Cronómetros
                </span>
                {uploadedFileInfo && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Fuente: {uploadedFileInfo.name} ({uploadedFileInfo.type.toUpperCase()})
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setParsedWorkout(null);
                setUploadedFileInfo(null);
              }}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '6px 10px' }}
            >
              Cancelar / Cambiar
            </button>
          </div>

          {/* Configurable Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
            {/* Zone Selector */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                ZONA DE LA APP:
              </label>
              <select
                value={parsedWorkout.zone || 'traditional'}
                onChange={(e) => setParsedWorkout({ ...parsedWorkout, zone: e.target.value })}
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
                <option value="traditional">🏋️ Gimnasio Tradicional (Hipertrofia)</option>
                <option value="competitors">🔥 Competidores (CrossFit / WODs)</option>
              </select>
            </div>

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
                <option value="legs_glutes">Pierna y Glúteo (Lower Body)</option>
                <option value="chest_triceps">Pecho y Tríceps (Upper Body)</option>
                <option value="back_shoulders">Espalda y Hombros (Upper Body)</option>
                <option value="full_body">Full Body (Cuerpo Entero)</option>
                <option value="biceps_triceps">Bíceps y Tríceps</option>
                <option value="core_mobility">Core y Movilidad</option>
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

            {/* Duration */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                DURACIÓN ESTIMADA:
              </label>
              <input
                type="text"
                value={parsedWorkout.duration || '42 MIN'}
                onChange={(e) => setParsedWorkout({ ...parsedWorkout, duration: e.target.value })}
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

          {/* Title & Subtitle */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
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
                  fontSize: '13px',
                  fontWeight: '800'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                CÓDIGO / SUBTÍTULO:
              </label>
              <input
                type="text"
                value={parsedWorkout.subtitle || ''}
                onChange={(e) => setParsedWorkout({ ...parsedWorkout, subtitle: e.target.value })}
                placeholder="Ej: LB-2 - Bloques de 3"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '13px',
                  fontWeight: '700'
                }}
              />
            </div>
          </div>

          {/* Sections detected with Timer Config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)' }}>
              BLOQUES DE LA SESIÓN ({parsedWorkout.sections?.length || 0}) Y CRONÓMETROS:
            </span>

            {parsedWorkout.sections?.map((section, sIdx) => {
              const currentTimerSec = section.groupTimer?.seconds || 90;
              const standardOptions = [45, 60, 90, 120, 150, 180, 240, 300, 480, 600];
              const isCustomTimer = !standardOptions.includes(currentTimerSec);

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--brand-pink)' }}>
                        {section.name}
                      </span>
                      {section.rounds && (
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: '800',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(168, 85, 247, 0.15)',
                          color: 'var(--brand-lilac-light)',
                          border: '1px solid rgba(168, 85, 247, 0.3)'
                        }}>
                          {section.rounds} rondas
                        </span>
                      )}
                    </div>

                    {/* Preconfigured Timer Dropdown for Coach */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Timer size={14} color="var(--brand-lilac-light)" />
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        Crono:
                      </span>
                      <select
                        value={currentTimerSec}
                        onChange={(e) => handleUpdateSectionTimer(sIdx, e.target.value)}
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
                        {isCustomTimer && (
                          <option value={currentTimerSec}>
                            {currentTimerSec}s ({formatSecondsToTimer(currentTimerSec)}) - Detectado
                          </option>
                        )}
                        <option value="45">45 seg (Aislamiento)</option>
                        <option value="60">60 seg (01:00)</option>
                        <option value="90">90 seg (01:30 - Every 90")</option>
                        <option value="120">120 seg (02:00 - E2MOM)</option>
                        <option value="150">150 seg (02:30 - Every 2'30")</option>
                        <option value="180">180 seg (03:00)</option>
                        <option value="240">240 seg (04:00)</option>
                        <option value="300">5 min (05:00)</option>
                        <option value="480">8 min (08:00 - Warmup)</option>
                        <option value="600">10 min (10:00)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
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
                          padding: '6px 10px',
                          borderRadius: '4px',
                          gap: '8px'
                        }}
                      >
                        <span style={{ fontWeight: '600', color: '#ffffff' }}>• {ex.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--brand-lilac-light)', fontSize: '11px', fontWeight: '700' }}>
                            {ex.reps || ex.sets}
                          </span>
                          {(ex.rir || ex.notes) && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: '800',
                              padding: '2px 5px',
                              borderRadius: '3px',
                              background: 'rgba(255, 45, 120, 0.15)',
                              color: 'var(--brand-pink)',
                              border: '1px solid rgba(255, 45, 120, 0.3)'
                            }}>
                              {ex.rir || ex.notes}
                            </span>
                          )}
                        </div>
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
