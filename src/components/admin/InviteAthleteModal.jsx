import React, { useState } from 'react';
import { X, Mail, UserPlus, Check, Copy, Send, Sparkles, Flame, Dumbbell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export default function InviteAthleteModal({ isOpen, onClose }) {
  const { addAthlete } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [zone, setZone] = useState('traditional'); // 'competitors' | 'traditional'
  const [focus, setFocus] = useState('Hipertrofia & Fuerza');

  // Success state when created
  const [createdAthlete, setCreatedAthlete] = useState(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newAthlete = addAthlete(name.trim(), email.trim(), zone, focus);
    setCreatedAthlete(newAthlete);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleCopyLink = () => {
    if (!createdAthlete) return;
    const link = createdAthlete.inviteLink || `${window.location.origin}/?invite=${createdAthlete.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendEmailSimulation = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const handleResetAndClose = () => {
    setName('');
    setEmail('');
    setCreatedAthlete(null);
    setCopied(false);
    setEmailSent(false);
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
          maxWidth: '420px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '22px 20px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <UserPlus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                Dar de Alta Nuevo Cliente
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Envío de invitación por correo electrónico
              </span>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
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

        {!createdAthlete ? (
          /* Form to Invite */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Full Name */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                NOMBRE COMPLETO DEL CLIENTE/A *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Daniel Sánchez, Elena Ramos..."
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

            {/* Email Address */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                CORREO ELECTRÓNICO (RECIBIRÁ EL ENLACE) *
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px'
              }}>
                <Mail size={16} color="var(--brand-lilac-light)" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  required
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    fontSize: '13px',
                    color: '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Membership Zone */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                ZONA / MEMBRESÍA ASIGNADA
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setZone('competitors');
                    setFocus('Halterofilia & WODs');
                  }}
                  style={{
                    padding: '9px',
                    borderRadius: 'var(--radius-sm)',
                    border: zone === 'competitors' ? '1.5px solid var(--brand-pink)' : '1px solid var(--border-subtle)',
                    background: zone === 'competitors' ? 'rgba(255, 45, 120, 0.15)' : 'var(--bg-surface)',
                    color: zone === 'competitors' ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Flame size={14} color="var(--brand-pink)" />
                  <span>Competidor</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZone('traditional');
                    setFocus('Hipertrofia & Fuerza');
                  }}
                  style={{
                    padding: '9px',
                    borderRadius: 'var(--radius-sm)',
                    border: zone === 'traditional' ? '1.5px solid var(--brand-lilac-light)' : '1px solid var(--border-subtle)',
                    background: zone === 'traditional' ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-surface)',
                    color: zone === 'traditional' ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Dumbbell size={14} color="var(--brand-lilac-light)" />
                  <span>Gimnasio</span>
                </button>
              </div>
            </div>

            {/* Objective / Focus */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                ENFOQUE O NOTA INICIAL
              </label>
              <input
                type="text"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="Ej: Aumento de masa muscular, WODs, salud..."
                style={{
                  width: '100%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 12px',
                  fontSize: '12.5px',
                  color: '#ffffff',
                  outline: 'none'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: '12px',
                fontSize: '13px',
                borderRadius: 'var(--radius-sm)',
                marginTop: '6px'
              }}
            >
              <Send size={15} />
              <span>Dar de Alta y Generar Enlace</span>
            </button>
          </form>
        ) : (
          /* Confirmation and Invite Link Screen */
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Check size={20} color="#22c55e" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>
                  ¡Alta de cliente generada con éxito!
                </strong>
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  Se ha registrado a <strong>{createdAthlete.name}</strong> ({createdAthlete.email}).
                </span>
              </div>
            </div>

            {/* Invite Link Card */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                ENLACE PERSONALIZADO DE ACCESO PARA EL ALUMNO:
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px'
              }}>
                <input
                  type="text"
                  readOnly
                  value={createdAthlete.inviteLink || `${window.location.origin}/?invite=${createdAthlete.id}`}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    fontSize: '12px',
                    color: 'var(--brand-lilac-light)',
                    outline: 'none',
                    fontWeight: '700'
                  }}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    background: copied ? '#22c55e' : 'var(--brand-gradient)',
                    border: 'none',
                    borderRadius: 'var(--radius-xs)',
                    padding: '6px 10px',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Email simulation alert */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={handleSendEmailSimulation}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  background: emailSent ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-surface)',
                  border: emailSent ? '1px solid #22c55e' : '1px solid var(--border-subtle)',
                  color: emailSent ? '#22c55e' : '#ffffff',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Mail size={14} />
                <span>{emailSent ? '✓ Correo simulado enviado a ' + createdAthlete.email : 'Simular envío de email automático'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '11px',
                  fontSize: '12.5px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                Listo / Finalizar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
