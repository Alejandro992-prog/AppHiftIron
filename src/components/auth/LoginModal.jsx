import React, { useState } from 'react';
import { X, ShieldAlert, User, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../common/BrandLogo';

export default function LoginModal({ isOpen, onClose }) {
  const { currentUser, athletes, loginAsAthlete, loginAsCoach, isAdmin } = useAuth();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
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
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          width: '100%',
          maxWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          position: 'relative',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: 'var(--text-muted)',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'var(--bg-surface)'
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
          <BrandLogo size="md" layout="vertical" />
          <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#ffffff', marginTop: '6px' }}>
            Seleccionar Usuario o Coach
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Elige con qué perfil deseas entrar para ver tu plan personalizado.
          </p>
        </div>

        {/* Athletes List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            ALUMNOS / ATLETAS CON PLAN PERSONALIZADO:
          </span>

          {athletes.map((ath) => {
            const isSelected = !isAdmin && currentUser?.id === ath.id;

            return (
              <button
                key={ath.id}
                onClick={() => {
                  loginAsAthlete(ath.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(255, 45, 120, 0.18) 0%, rgba(168, 85, 247, 0.18) 100%)' 
                    : 'var(--bg-surface)',
                  border: isSelected ? '1.5px solid var(--brand-pink)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: isSelected ? 'var(--brand-gradient)' : 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '900',
                    color: '#ffffff'
                  }}>
                    {ath.avatar}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff' }}>
                      {ath.name}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--brand-lilac-light)' }}>
                      {ath.focus}
                    </span>
                  </div>
                </div>

                {isSelected && <Check size={16} color="var(--brand-pink)" />}
              </button>
            );
          })}
        </div>

        {/* Coach / Admin Access Button */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            onClick={() => {
              loginAsCoach();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: isAdmin ? 'var(--brand-gradient)' : 'var(--bg-surface)',
              border: isAdmin ? 'none' : '1px solid rgba(255, 45, 120, 0.35)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            <ShieldAlert size={16} color={isAdmin ? '#ffffff' : '#ff2d78'} />
            <span>{isAdmin ? 'Modo Coach Activo' : 'Entrar como Head Coach (Admin)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
