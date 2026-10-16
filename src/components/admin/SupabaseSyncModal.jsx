import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  X, 
  UploadCloud 
} from 'lucide-react';
import { useWorkouts } from '../../context/WorkoutContext';
import { useAuth } from '../../context/AuthContext';

export default function SupabaseSyncModal({ isOpen, onClose }) {
  const { 
    isSupabaseConfigured, 
    testSupabaseConnection, 
    syncSeedDataToSupabase,
    workouts,
    prs
  } = useWorkouts();
  const { athletes } = useAuth();

  const [testingStatus, setTestingStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [testResult, setTestResult] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestingStatus('testing');
    setTestResult('');
    const res = await testSupabaseConnection();
    if (res.success) {
      setTestingStatus('success');
      setTestResult(`Conexión exitosa. Atletas en base de datos: ${res.count}`);
    } else {
      setTestingStatus('error');
      setTestResult(res.error || 'No se pudo conectar a la base de datos.');
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncSeedDataToSupabase({
        athletes,
        workouts,
        prs
      });
      if (res.success) {
        setSyncStatus({
          type: 'success',
          msg: `¡Datos subidos a la nube! ${res.syncedAthletes} atletas, ${res.syncedWorkouts} rutinas y ${res.syncedPrs} PRs sincronizados.`
        });
      } else {
        setSyncStatus({
          type: 'error',
          msg: res.error || 'Error al sincronizar datos a la nube.'
        });
      }
    } catch {
      setSyncStatus({
        type: 'error',
        msg: 'Error inesperado al conectar con Supabase. Revisa las credenciales en .env.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const envTemplate = `VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-public-key-aqui`;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px'
    }}>
      <div 
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(62, 207, 142, 0.1) 0%, rgba(13, 13, 20, 0.8) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#3ECF8E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0d0d14'
            }}>
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#ffffff' }}>
                Conexión con Supabase
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                Base de datos en la nube para HIFT Iron Box
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Connection Status Card */}
          <div style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-lg)',
            background: isSupabaseConfigured 
              ? 'rgba(62, 207, 142, 0.08)' 
              : 'rgba(249, 115, 22, 0.08)',
            border: isSupabaseConfigured 
              ? '1px solid rgba(62, 207, 142, 0.3)' 
              : '1px solid rgba(249, 115, 22, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isSupabaseConfigured ? (
                <CheckCircle2 size={22} color="#3ECF8E" style={{ flexShrink: 0 }} />
              ) : (
                <AlertCircle size={22} color="#f97316" style={{ flexShrink: 0 }} />
              )}
              <div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '800',
                  color: isSupabaseConfigured ? '#3ECF8E' : '#f97316',
                  display: 'block'
                }}>
                  {isSupabaseConfigured ? '🟢 Supabase Configurado en .env' : '🟠 Modo Local (Sin Credenciales en .env)'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {isSupabaseConfigured 
                    ? 'La app tiene las credenciales configuradas y sincroniza en la nube.'
                    : 'Modo seguro: por privacidad, ningún dato se guarda en el navegador; agrega tus claves a .env para conectar a la nube.'}
                </span>
              </div>
            </div>

            {isSupabaseConfigured && (
              <button
                onClick={handleTestConnection}
                disabled={testingStatus === 'testing'}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <RefreshCw size={12} className={testingStatus === 'testing' ? 'spin' : ''} />
                <span>Probar</span>
              </button>
            )}
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              fontWeight: '600',
              background: testingStatus === 'success' ? 'rgba(62, 207, 142, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: testingStatus === 'success' ? '#3ECF8E' : '#ef4444',
              border: testingStatus === 'success' ? '1px solid #3ECF8E' : '1px solid #ef4444'
            }}>
              {testResult}
            </div>
          )}

          {/* Pasos de Configuración */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--bg-surface)',
            padding: '14px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--brand-pink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Instrucciones de Puesta en Marcha
            </span>

            {/* Paso 1 */}
            <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'var(--brand-lilac)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                1
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ color: '#ffffff' }}>Ejecuta el Script SQL en Supabase:</strong>
                <p style={{ margin: '3px 0 0', color: 'var(--text-secondary)', fontSize: '11px', lineHeight: '1.4' }}>
                  Abre tu proyecto en <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: '#3ECF8E', textDecoration: 'underline' }}>supabase.com</a>, ve a la sección <strong>SQL Editor</strong> y pega el contenido del archivo <code>supabase_schema.sql</code> generado en la raíz del proyecto.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'var(--brand-lilac)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                2
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ color: '#ffffff' }}>Pega las credenciales en tu archivo .env:</strong>
                <p style={{ margin: '3px 0 6px', color: 'var(--text-secondary)', fontSize: '11px', lineHeight: '1.4' }}>
                  En Supabase ve a <strong>Project Settings -&gt; API</strong> y copia el <em>Project URL</em> y el <em>anon public key</em>:
                </p>
                <div style={{
                  background: '#0a0a0f',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: '#3ECF8E'
                }}>
                  <span>{envTemplate}</span>
                  <button
                    onClick={() => handleCopyText(envTemplate, 'env')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    title="Copiar plantilla"
                  >
                    {copiedKey === 'env' ? <Check size={14} color="#3ECF8E" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Paso 3 */}
            <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'var(--brand-lilac)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                3
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ color: '#ffffff' }}>Sincronización en la Nube:</strong>
                <p style={{ margin: '3px 0 0', color: 'var(--text-secondary)', fontSize: '11px', lineHeight: '1.4' }}>
                  Una vez guardado el archivo <code>.env</code>, pulsa el botón de abajo para subir todas las rutinas actuales, atletas y PRs de la app a tu base de datos de Supabase.
                </p>
              </div>
            </div>
          </div>

          {/* Sync Seed Data Button */}
          {isSupabaseConfigured && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleSyncData}
                disabled={isSyncing}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, #3ECF8E 0%, #059669 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(62, 207, 142, 0.25)'
                }}
              >
                <UploadCloud size={16} />
                <span>{isSyncing ? 'Subiendo catálogo a Supabase...' : 'Sincronizar Catálogo Actual a Supabase'}</span>
              </button>

              {syncStatus && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: syncStatus.type === 'success' ? 'rgba(62, 207, 142, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: syncStatus.type === 'success' ? '#3ECF8E' : '#ef4444',
                  border: syncStatus.type === 'success' ? '1px solid #3ECF8E' : '1px solid #ef4444'
                }}>
                  {syncStatus.msg}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'var(--bg-surface)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
