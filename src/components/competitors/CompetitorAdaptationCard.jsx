import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  RotateCcw
} from 'lucide-react';
import { getRecoveryStateInfo } from '../../utils/recoveryScore';

export default function CompetitorAdaptationCard({ 
  todayEntry, 
  onEditTest, 
  onResetTest,
  _variant = 'card' // 'card' | 'compact'
}) {
  const [showGuidelines, setShowGuidelines] = useState(false);

  if (!todayEntry) return null;

  const info = getRecoveryStateInfo(todayEntry);
  if (!info) return null;

  const {
    stateData,
    scoreDisplay,
    statusLabel,
    headline,
    guidelines,
    volumeReduction,
    hasPain,
    painAreas,
    painDescription,
    deloadMode
  } = info;

  const statusColor = stateData.color || '#22c55e';
  const isReduced = volumeReduction !== '0%';

  return (
    <div 
      className="animate-fade-in"
      style={{
        background: `linear-gradient(135deg, ${statusColor}14 0%, rgba(18, 18, 26, 0.95) 100%)`,
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${statusColor}55`,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxShadow: `0 4px 16px ${statusColor}12`
      }}
    >
      {/* Main Status Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{stateData.iconEmoji}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '900',
                color: statusColor,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {statusLabel}
              </span>
              <span style={{
                fontSize: '11.5px',
                fontWeight: '900',
                color: '#ffffff',
                fontFamily: 'monospace'
              }}>
                {scoreDisplay}/10
              </span>
            </div>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', margin: 0, lineHeight: 1.25 }}>
              {headline}
            </h4>
          </div>
        </div>

        {/* Volume badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '10.5px',
            fontWeight: '900',
            background: isReduced ? 'rgba(249, 115, 22, 0.2)' : 'rgba(34, 197, 94, 0.2)',
            color: isReduced ? '#fb923c' : '#22c55e',
            border: `1px solid ${isReduced ? '#f97316' : '#22c55e'}55`,
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            {isReduced ? `Ajuste: ${volumeReduction}` : 'Volumen 100%'}
          </span>

          {deloadMode && (
            <span style={{
              fontSize: '10px',
              fontWeight: '900',
              background: '#ef4444',
              color: '#ffffff',
              padding: '2px 6px',
              borderRadius: 'var(--radius-full)'
            }}>
              Descarga
            </span>
          )}
        </div>
      </div>

      {/* Pain Alert if active */}
      {hasPain && (
        <div style={{
          fontSize: '11px',
          color: '#fca5a5',
          background: 'rgba(239, 68, 68, 0.15)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-xs)',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <AlertTriangle size={12} color="#ef4444" style={{ flexShrink: 0 }} />
          <span>Molestia: <strong>{painAreas.join(', ')}</strong> {painDescription && `(${painDescription})`}</span>
        </div>
      )}

      {/* Expandable Guidelines */}
      {showGuidelines && (
        <div className="animate-fade-in" style={{
          background: 'rgba(0, 0, 0, 0.35)',
          borderRadius: 'var(--radius-xs)',
          padding: '8px 12px',
          borderTop: `1px solid ${statusColor}33`,
          marginTop: '2px'
        }}>
          <span style={{ fontSize: '10px', fontWeight: '800', color: statusColor, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            Pautas oficiales para hoy:
          </span>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11.5px', color: '#f1f5f9', lineHeight: 1.45 }}>
            {guidelines.map((point, idx) => (
              <li key={idx} style={{ marginBottom: '2px' }}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer: Expand toggle & edit test */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '2px',
        fontSize: '11px'
      }}>
        <button
          onClick={() => setShowGuidelines(!showGuidelines)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: 0
          }}
        >
          <span>{showGuidelines ? 'Ocultar pautas' : 'Ver pautas recomendadas'}</span>
          {showGuidelines ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onEditTest}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-lilac-light)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: 0
            }}
          >
            <Edit3 size={11} />
            <span>Editar test</span>
          </button>

          {onResetTest && (
            <button
              onClick={onResetTest}
              title="Resetear respuesta de hoy"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: 0
              }}
            >
              <RotateCcw size={10} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
