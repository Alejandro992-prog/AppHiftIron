import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Download, 
  Trash2, 
  Lock, 
  Eye, 
  FileText, 
  AlertTriangle, 
  Check, 
  ChevronRight,
  ExternalLink,
  Activity,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PrivacyAndDataModal({ isOpen, onClose }) {
  const { 
    currentUser, 
    getUserConsents, 
    updateConsent, 
    exportUserData, 
    deleteUserAccount 
  } = useAuth();

  const [activeTab, setActiveTab] = useState('consents'); // 'consents' | 'rights' | 'policy'
  const [exportSuccess, setExportSuccess] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  if (!isOpen || !currentUser) return null;

  const consents = getUserConsents(currentUser.id);

  const handleExport = () => {
    const ok = exportUserData(currentUser.id);
    if (ok) {
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteText.trim().toUpperCase() !== 'ELIMINAR') {
      alert('Por favor, escribe "ELIMINAR" para confirmar la supresión definitiva.');
      return;
    }
    deleteUserAccount(currentUser.id);
    onClose();
  };

  return (
    <div 
      className="modal-overlay animate-fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 5, 10, 0.90)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="modal-content animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '92vh',
          background: 'radial-gradient(circle at 50% 0%, #1e1333 0%, #0d0d14 100%)',
          borderRadius: '24px',
          border: '1.5px solid rgba(168, 85, 247, 0.4)',
          overflowY: 'auto',
          padding: '22px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.9)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(255, 45, 120, 0.3) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-lilac-light)'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '9.5px',
                  fontWeight: '800',
                  color: '#22c55e',
                  background: 'rgba(34, 197, 94, 0.15)',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.5px'
                }}>
                  RGPD & LOPDGDD ESPAÑA
                </span>
              </div>
              <h2 style={{ fontSize: '16.5px', fontWeight: '900', color: '#ffffff', margin: '2px 0 0 0' }}>
                Privacidad y Tus Datos
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveTab('consents')}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '11.5px',
              fontWeight: activeTab === 'consents' ? '800' : '600',
              background: activeTab === 'consents' ? 'var(--brand-gradient)' : 'transparent',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Consentimientos
          </button>
          <button
            onClick={() => setActiveTab('rights')}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '11.5px',
              fontWeight: activeTab === 'rights' ? '800' : '600',
              background: activeTab === 'rights' ? 'var(--brand-gradient)' : 'transparent',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Tus Derechos (ARCO)
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '11.5px',
              fontWeight: activeTab === 'policy' ? '800' : '600',
              background: activeTab === 'policy' ? 'var(--brand-gradient)' : 'transparent',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Aviso Legal
          </button>
        </div>

        {/* TAB 1: GESTIÓN DE CONSENTIMIENTOS */}
        {activeTab === 'consents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.45', margin: 0 }}>
              Controla qué datos permites tratar en la app. Puedes modificar o revocar cada consentimiento en cualquier momento.
            </p>

            {/* Consentimiento 1: Datos de Salud y Readiness */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <Activity size={18} color="var(--brand-pink)" />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', display: 'block' }}>
                      Datos de Salud y Bienestar (Readiness)
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--brand-pink)' }}>
                      Categoría Especial (Art. 9 RGPD)
                    </span>
                  </div>
                </div>

                {/* Switch */}
                <input
                  type="checkbox"
                  checked={!!consents.health_readiness}
                  onChange={(e) => updateConsent('health_readiness', e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: 'var(--brand-pink)',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                Permite registrar sueño, dolor muscular y fatiga para que tu Head Coach adapte tus cargas de entrenamiento y evite lesiones.
              </p>
            </div>

            {/* Consentimiento 2: Pizarra Pública y Leaderboard */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <Users size={18} color="var(--brand-lilac-light)" />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', display: 'block' }}>
                      Visibilidad en Pizarra y Ranking del Box
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      Leaderboard Colectivo
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={consents.leaderboard !== false}
                  onChange={(e) => updateConsent('leaderboard', e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: 'var(--brand-lilac-light)',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                Si está desactivado, tus marcas en WODs solo serán visibles para ti y tus coaches, ocultándote de las pantallas compartidas del gimnasio.
              </p>
            </div>

            <div style={{
              fontSize: '11px',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)'
            }}>
              <Lock size={13} color="#22c55e" />
              <span>Tus elecciones se registran con sello de tiempo para auditoría de cumplimiento.</span>
            </div>
          </div>
        )}

        {/* TAB 2: DERECHOS ARCO-POL (Portabilidad y Supresión) */}
        {activeTab === 'rights' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Portabilidad (Art. 20 RGPD) */}
            <div style={{
              background: 'rgba(56, 189, 248, 0.06)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={18} color="#38bdf8" />
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>
                  Derecho a la Portabilidad (Art. 20 RGPD)
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                Descarga un archivo estructurado en formato <strong>JSON</strong> con todo tu historial deportivo, marcas PR, registros de readiness y consentimientos.
              </p>

              <button
                onClick={handleExport}
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                {exportSuccess ? <Check size={14} color="#22c55e" /> : <Download size={14} />}
                <span>{exportSuccess ? '¡Archivo Descargado!' : 'Exportar Todos Mis Datos (.JSON)'}</span>
              </button>
            </div>

            {/* Derecho al Olvido / Supresión (Art. 17 RGPD) */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={18} color="#ef4444" />
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>
                  Derecho de Supresión / "Al Olvido" (Art. 17 RGPD)
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                Solicita la eliminación y purga completa de tus datos personales, marcas y notas de bienestar en este Box.
              </p>

              {!deleteConfirmOpen ? (
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#ef4444',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                  <span>Solicitar Supresión Definitiva</span>
                </button>
              ) : (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '10px',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '11px', color: '#fca5a5' }}>
                    ⚠️ Esta acción purgará tu perfil deportivo y no podrá deshacerse. Escribe <strong>ELIMINAR</strong> para confirmar:
                  </span>
                  <input
                    type="text"
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    placeholder="Escribe ELIMINAR"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '7px 10px',
                      fontSize: '12px',
                      color: '#ffffff',
                      outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleDeleteAccount}
                      style={{
                        flex: 1,
                        background: '#ef4444',
                        border: 'none',
                        color: '#ffffff',
                        padding: '8px',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      Confirmar Borrado
                    </button>
                    <button
                      onClick={() => {
                        setDeleteConfirmOpen(false);
                        setDeleteText('');
                      }}
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: 'none',
                        color: 'var(--text-muted)',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: POLÍTICA INFORMATIVA DETALLADA (2ª Capa RGPD / AEPD) */}
        {activeTab === 'policy' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '11.5px',
            color: '#cbd5e1',
            lineHeight: '1.5',
            maxHeight: '340px',
            overflowY: 'auto',
            paddingRight: '6px'
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '4px' }}>
                1. Responsable del Tratamiento
              </strong>
              Hift Iron Box S.L. con NIF B-XXXXXXXX y domicilio en España. Correo de contacto del Delegado de Protección de Datos (DPO): <code>privacidad@hiftbox.com</code>.
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '4px' }}>
                2. Finalidad y Bases Jurídicas
              </strong>
              • <strong>Gestión deportiva y de membresías:</strong> Ejecución de contrato deportivo (Art. 6.1.b RGPD).<br/>
              • <strong>Adaptación de cargas y prevención de lesiones (Readiness):</strong> Consentimiento explícito de datos de salud (Art. 9.2.a RGPD).<br/>
              • <strong>Pizarra pública en el Box:</strong> Consentimiento libremente otorgado y revocable en cualquier momento.
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '4px' }}>
                3. Plazos de Conservación
              </strong>
              Tus datos deportivos y de bienestar se conservarán mientras mantengas activa tu cuenta o hasta que revoques tu consentimiento. Los datos fiscales asociados a cuotas se conservarán 4-5 años por cumplimiento tributario español (Ley General Tributaria).
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '4px' }}>
                4. Autoridad de Control
              </strong>
              Tienes derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong> a través de su sede electrónica en <a href="https://www.aepd.es" target="_blank" rel="noreferrer" style={{ color: 'var(--brand-lilac-light)' }}>www.aepd.es</a>.
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Usuario ID: {currentUser.id.substring(0, 14)}...
          </span>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: '12px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
