import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../common/BrandLogo';

export default function LoginScreen() {
  const { loginWithCredentials } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [showDemoHints, setShowDemoHints] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    const result = loginWithCredentials(identifier, password);
    if (!result.success) {
      setErrorMsg(result.error);
    } else {
      setErrorMsg(null);
    }
  };

  const handleFillDemo = (demoId, demoPass = '1234') => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div className="app-viewport-wrapper">
      <div className="mobile-app-container" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 20px',
        minHeight: '100vh',
        minHeight: '100dvh'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
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
                Acceso a la App
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Introduce tu correo o usuario y tu contraseña para acceder a tus entrenamientos.
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form 
            onSubmit={handleSubmit}
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

            {/* Email or Username */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                CORREO ELECTRÓNICO O USUARIO
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
                  type="text"
                  placeholder="Ej: tu usuario o correo"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
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
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                CONTRASEÑA
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
                  type="password"
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
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '13.5px',
                borderRadius: 'var(--radius-sm)',
                marginTop: '4px'
              }}
            >
              <span>Iniciar Sesión</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Discreet Demo Helper (for easy testing without public names) */}
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <button
              type="button"
              onClick={() => setShowDemoHints(!showDemoHints)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '11.5px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Key size={12} />
              <span>{showDemoHints ? 'Ocultar cuentas de prueba' : 'Ver cuentas demo para pruebas'}</span>
            </button>

            {showDemoHints && (
              <div style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--brand-lilac-light)', textTransform: 'uppercase' }}>
                  Pulsa para autorrellenar una cuenta de prueba (Clave: 1234):
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('carlos@hiftbox.com', '1234')}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '11px',
                      color: 'var(--text-primary)',
                      textAlign: 'left'
                    }}
                  >
                    👤 Alumno 1 (Carlos)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFillDemo('laura@hiftbox.com', '1234')}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '11px',
                      color: 'var(--text-primary)',
                      textAlign: 'left'
                    }}
                  >
                    👤 Alumno 2 (Laura)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFillDemo('mateo@hiftbox.com', '1234')}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '11px',
                      color: 'var(--text-primary)',
                      textAlign: 'left'
                    }}
                  >
                    👤 Alumno 3 (Mateo)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFillDemo('admin@hiftbox.com', '1234')}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'rgba(255, 45, 120, 0.12)',
                      border: '1px solid rgba(255, 45, 120, 0.3)',
                      fontSize: '11px',
                      color: 'var(--brand-pink)',
                      fontWeight: '700',
                      textAlign: 'left'
                    }}
                  >
                    🛡️ Coach Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
