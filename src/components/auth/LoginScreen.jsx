import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../common/BrandLogo';

export default function LoginScreen() {
  const { loginWithCredentials } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
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
                Introduce tu correo electrónico y tu contraseña para acceder a tus entrenamientos.
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
