import React, { useState } from 'react';
import { ShieldCheck, UploadCloud, Users, Image as ImageIcon, Eye } from 'lucide-react';
import { useWorkouts } from '../../context/WorkoutContext';
import { useAuth } from '../../context/AuthContext';
import AthletePlanManager from './AthletePlanManager';
import WordImporter from './WordImporter';
import BrandLogo from '../common/BrandLogo';

export default function AdminPanel({ onNavigateToRoutine }) {
  const { workouts, customLogoUrl, updateCustomLogo } = useWorkouts();
  const { athletes, switchRole, loginAsCoach } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState('athletes'); // 'athletes' | 'importer' | 'branding'

  const totalWorkouts = workouts.length;
  const totalAthletes = athletes.length;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      updateCustomLogo(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Admin Title Card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
        border: '1px solid rgba(255, 45, 120, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--brand-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
              Panel de Entrenador
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--brand-lilac-light)', fontWeight: '600' }}>
              Programación Personalizada de Alumnos
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            color: 'var(--brand-pink)',
            background: 'var(--bg-surface)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)'
          }}>
            {totalAthletes} Alumnos
          </span>
        </div>
      </div>

      {/* Admin Subtabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        background: 'var(--bg-secondary)',
        padding: '4px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)'
      }}>
        {[
          { id: 'athletes', label: 'Asignar por Alumno', icon: Users },
          { id: 'importer', label: 'Importar Word (.docx)', icon: UploadCloud },
          { id: 'branding', label: 'Logo', icon: ImageIcon }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 4px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '11px',
                fontWeight: '800',
                background: active ? 'var(--brand-gradient)' : 'transparent',
                color: active ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: active ? 'var(--brand-gradient-glow)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeAdminTab === 'athletes' && (
        <AthletePlanManager onNavigateToRoutine={onNavigateToRoutine} />
      )}

      {activeAdminTab === 'importer' && (
        <WordImporter
          onWorkoutPublished={() => {
            setActiveAdminTab('athletes');
          }}
        />
      )}

      {activeAdminTab === 'branding' && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
              Logotipo del Gimnasio &amp; Box
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Sube el archivo de imagen corporativa (.png, .jpg o .svg).
            </p>
          </div>

          <div style={{
            padding: '18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <BrandLogo size="lg" customLogoUrl={customLogoUrl} layout="vertical" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="btn-primary" style={{ padding: '12px', fontSize: '13px', cursor: 'pointer' }}>
              <UploadCloud size={16} />
              <span>Subir Imagen de Logotipo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>

            {customLogoUrl && (
              <button
                onClick={() => updateCustomLogo(null)}
                className="btn-secondary"
                style={{ fontSize: '12px' }}
              >
                Restablecer al Logotipo Oficial HIFT
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
