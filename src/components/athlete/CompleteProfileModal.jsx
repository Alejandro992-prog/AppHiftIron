import React, { useState } from 'react';
import { X, Check, UserCheck, Phone, Target, Dumbbell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export default function CompleteProfileModal({ isOpen, onClose }) {
  const { currentUser, completeProfile } = useAuth();

  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [goal, setGoal] = useState(currentUser?.focus || 'Hipertrofia y Acondicionamiento');
  const [experience, setExperience] = useState('Intermedio (1-3 años)');
  const [injuries, setInjuries] = useState('Ninguna');

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    completeProfile(currentUser.id, {
      phone,
      focus: goal,
      experience,
      injuries
    });
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
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
          maxWidth: '400px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
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
              <UserCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                Completa tu Perfil
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Información para tu entrenador
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              TELÉFONO DE CONTACTO
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '9px 12px'
            }}>
              <Phone size={15} color="var(--brand-lilac-light)" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 600 000 000"
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '13px',
                  color: '#ffffff'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              OBJETIVO PRINCIPAL
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '9px 12px'
            }}>
              <Target size={15} color="var(--brand-lilac-light)" />
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ej: Ganar masa muscular, rendir en WODs..."
                required
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '13px',
                  color: '#ffffff'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              NIVEL DE EXPERIENCIA PREVIA
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
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
              <option value="Principiante (< 1 año)">Principiante (menos de 1 año)</option>
              <option value="Intermedio (1-3 años)">Intermedio (1 a 3 años)</option>
              <option value="Avanzado (> 3 años)">Avanzado (más de 3 años)</option>
              <option value="Competidor Rx">Competidor / Atleta de competición</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              LESIONES O MOLESTIAS A TENER EN CUENTA
            </label>
            <input
              type="text"
              value={injuries}
              onChange={(e) => setInjuries(e.target.value)}
              placeholder="Ninguna o ej: molestia lumbar leve..."
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

          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '12px',
              fontSize: '13px',
              borderRadius: 'var(--radius-sm)',
              marginTop: '4px'
            }}
          >
            <Check size={16} />
            <span>Guardar Mi Perfil</span>
          </button>
        </form>
      </div>
    </div>
  );
}
