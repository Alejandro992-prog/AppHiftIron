import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Send,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../common/BrandLogo';
import confetti from 'canvas-confetti';

export default function LoginScreen({ initialView = 'login' }) {
  const { 
    loginWithCredentials, 
    requestPasswordReset, 
    updateUserPassword, 
    setIsRecoveryMode 
  } = useAuth();

  // 'login' | 'forgot_password' | 'reset_password'
  const [view, setView] = useState(initialView);

  // Estados de Login
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados de "Olvidé mi contraseña"
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Estados de "Nueva Contraseña" (enlace de recuperación)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordResetCompleted, setPasswordResetCompleted] = useState(false);

  // Feedback UI
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Submit de Inicio de Sesión
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await loginWithCredentials(identifier, password);
      if (!result.success) {
        setErrorMsg(result.error);
      }
    } catch {
      setErrorMsg('Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit de Solicitud de Recuperación por Correo
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Introduce una dirección de correo válida.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await requestPasswordReset(cleanEmail);
      if (result.success) {
        setResetEmailSent(true);
        setErrorMsg(null);
      } else {
        setErrorMsg(result.error || 'No se pudo enviar el correo de recuperación.');
      }
    } catch {
      setErrorMsg('Error al conectar con el servicio de autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Submit de Nueva Contraseña (tras pulsar el enlace del email)
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Verifícalas.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await updateUserPassword(newPassword);
      if (result.success) {
        setPasswordResetCompleted(true);
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
        // Limpiar hash de recuperación de la URL
        try {
          window.history.replaceState({}, '', window.location.pathname);
        } catch {}
      } else {
        setErrorMsg(result.error || 'No se pudo actualizar la contraseña.');
      }
    } catch {
      setErrorMsg('Error al conectar con el servidor para actualizar la contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-viewport-wrapper">
      <div className="mobile-app-container" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 20px',
        minHeight: '100dvh'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '22px'
        }}>
          {/* Logo & Header */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '10px'
          }}>
            <BrandLogo size="lg" layout="vertical" />
            <div style={{ marginTop: '4px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.01em' }}>
                {view === 'login' && 'Acceso a la App'}
                {view === 'forgot_password' && 'Recuperar Contraseña'}
                {view === 'reset_password' && 'Crea tu Nueva Contraseña'}
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
                {view === 'login' && 'Introduce tus credenciales para acceder a tus entrenamientos.'}
                {view === 'forgot_password' && 'Te enviaremos un enlace oficial a tu correo para restablecer tu clave.'}
                {view === 'reset_password' && 'Establece una contraseña segura para tu cuenta de atleta o coach.'}
              </p>
            </div>
          </div>

          {/* =====================================================================
              VISTA 1: FORMULARIO DE LOGIN ESTÁNDAR
             ===================================================================== */}
          {view === 'login' && (
            <form 
              onSubmit={handleLoginSubmit}
              className="animate-fade-in"
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '22px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {/* Error Message */}
              {errorMsg && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-danger-bg)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'var(--color-danger)',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Email */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  CORREO ELECTRÓNICO
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '11px 14px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <Mail size={16} color="var(--brand-lilac-light)" />
                  <input
                    type="email"
                    placeholder="ej: atleta@ejemplo.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="email"
                    required
                    style={{
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '13.5px',
                      color: '#ffffff'
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    CONTRASEÑA
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setResetEmail(identifier || '');
                      setView('forgot_password');
                    }}
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: 'var(--brand-pink)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '11px 14px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <Lock size={16} color="var(--brand-lilac-light)" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    style={{
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '13.5px',
                      color: '#ffffff'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: '13.5px',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '4px',
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                <span>{isLoading ? 'Verificando credenciales...' : 'Iniciar Sesión'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* =====================================================================
              VISTA 2: FORMULARIO "¿OLVIDASTE TU CONTRASEÑA?"
             ===================================================================== */}
          {view === 'forgot_password' && (
            <div 
              className="animate-fade-in"
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '22px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {resetEmailSent ? (
                /* Estado enviado con éxito */
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '12px',
                  padding: '8px 0'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-success)'
                  }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                      ¡Correo de recuperación enviado!
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.45 }}>
                      Hemos enviado un enlace a <strong style={{ color: '#ffffff' }}>{resetEmail}</strong>. 
                      Pulsa en el enlace que has recibido para crear tu nueva contraseña.
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      (Si no lo ves en unos instantes, revisa tu carpeta de Spam o Correo no deseado).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setResetEmailSent(false);
                      setErrorMsg(null);
                      setView('login');
                    }}
                    className="btn-secondary"
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '11px',
                      fontSize: '13px'
                    }}
                  >
                    <ArrowLeft size={15} />
                    <span>Volver al inicio de sesión</span>
                  </button>
                </div>
              ) : (
                /* Formulario para ingresar email */
                <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {errorMsg && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-danger-bg)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: 'var(--color-danger)',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      <AlertCircle size={15} style={{ flexShrink: 0 }} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                      TU CORREO ELECTRÓNICO
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '11px 14px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <Mail size={16} color="var(--brand-lilac-light)" />
                      <input
                        type="email"
                        placeholder="atleta@ejemplo.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        autoComplete="email"
                        required
                        autoFocus
                        style={{
                          background: 'none',
                          border: 'none',
                          outline: 'none',
                          width: '100%',
                          fontSize: '13.5px',
                          color: '#ffffff'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '13px',
                      fontSize: '13.5px',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '4px',
                      opacity: isLoading ? 0.7 : 1,
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span>{isLoading ? 'Enviando enlace...' : 'Enviar Enlace de Recuperación'}</span>
                    <Send size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setView('login');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'var(--text-secondary)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '6px'
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>Volver a Iniciar Sesión</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* =====================================================================
              VISTA 3: CREAR NUEVA CONTRASEÑA (Vía Enlace de Supabase)
             ===================================================================== */}
          {view === 'reset_password' && (
            <div 
              className="animate-fade-in"
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '22px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {passwordResetCompleted ? (
                /* Éxito: contraseña actualizada */
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '14px',
                  padding: '10px 0'
                }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-success)'
                  }}>
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                      ¡Contraseña actualizada con éxito!
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.45 }}>
                      Tu nueva clave ya está activa y protegida con cifrado Bcrypt en Supabase.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsRecoveryMode(false);
                      setView('login');
                      window.location.reload();
                    }}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '13.5px',
                      marginTop: '4px'
                    }}
                  >
                    <span>Entrar a la Aplicación</span>
                    <Sparkles size={16} />
                  </button>
                </div>
              ) : (
                /* Formulario de nueva contraseña */
                <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {errorMsg && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-danger-bg)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: 'var(--color-danger)',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      <AlertCircle size={15} style={{ flexShrink: 0 }} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Input Nueva Contraseña */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                      NUEVA CONTRASEÑA
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '11px 14px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <KeyRound size={16} color="var(--brand-lilac-light)" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        minLength={6}
                        autoFocus
                        style={{
                          background: 'none',
                          border: 'none',
                          outline: 'none',
                          width: '100%',
                          fontSize: '13.5px',
                          color: '#ffffff'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Input Confirmar Contraseña */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                      CONFIRMAR NUEVA CONTRASEÑA
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '11px 14px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <Lock size={16} color="var(--brand-lilac-light)" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Repite la contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        minLength={6}
                        style={{
                          background: 'none',
                          border: 'none',
                          outline: 'none',
                          width: '100%',
                          fontSize: '13.5px',
                          color: '#ffffff'
                        }}
                      />
                    </div>
                  </div>

                  {/* Indicadores en tiempo real */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '11px',
                    padding: '2px 4px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: newPassword.length >= 6 ? 'var(--color-success)' : 'var(--text-muted)'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: newPassword.length >= 6 ? 'var(--color-success)' : 'var(--text-muted)'
                      }} />
                      <span>Al menos 6 caracteres</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: (newPassword && newPassword === confirmPassword) ? 'var(--color-success)' : 'var(--text-muted)'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: (newPassword && newPassword === confirmPassword) ? 'var(--color-success)' : 'var(--text-muted)'
                      }} />
                      <span>Las contraseñas coinciden</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '13px',
                      fontSize: '13.5px',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '4px',
                      opacity: (isLoading || newPassword.length < 6 || newPassword !== confirmPassword) ? 0.6 : 1,
                      cursor: (isLoading || newPassword.length < 6 || newPassword !== confirmPassword) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span>{isLoading ? 'Guardando...' : 'Actualizar y Guardar Contraseña'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Security & RGPD Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontSize: '11px',
            textAlign: 'center',
            padding: '4px'
          }}>
            <ShieldCheck size={14} color="var(--brand-lilac-light)" />
            <span>Autenticación oficial con cifrado Bcrypt y tokens JWT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
