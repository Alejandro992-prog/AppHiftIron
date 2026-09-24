import React, { useState } from 'react';

export default function BrandLogo({ 
  size = 'md', 
  layout = 'horizontal', 
  showTagline = true, 
  customLogoUrl = null,
  variant = 'badge' // 'badge' (image) | 'vector'
}) {
  const [imageError, setImageError] = useState(false);

  // Dimension definitions
  const dimensions = {
    sm: { icon: 34, title: '17px', subtitle: '8.5px' },
    md: { icon: 44, title: '20px', subtitle: '9.5px' },
    lg: { icon: 70, title: '28px', subtitle: '11px' },
  };

  const currentDim = dimensions[size] || dimensions.md;
  const logoSrc = customLogoUrl || '/logo.png';

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: layout === 'vertical' ? '10px' : '12px',
      flexDirection: layout === 'vertical' ? 'column' : 'row',
      userSelect: 'none'
    }}>
      {/* Official Company Logo Badge */}
      <div style={{
        width: currentDim.icon,
        height: currentDim.icon,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: size === 'lg' ? '14px' : '10px',
        background: '#ffffff',
        padding: '3px',
        border: '1.5px solid rgba(255, 45, 120, 0.45)',
        boxShadow: '0 4px 16px -2px rgba(255, 45, 120, 0.3), 0 2px 8px rgba(168, 85, 247, 0.25)',
        flexShrink: 0,
        overflow: 'hidden'
      }}>
        {!imageError ? (
          <img 
            src={logoSrc} 
            alt="HIFT Iron Box" 
            onError={() => setImageError(true)}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain'
            }} 
          />
        ) : (
          /* SVG Hexagon Fallback Matching Official Logo */
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <polygon points="50,6 92,28 92,72 50,94 8,72 8,28" fill="#ffffff" stroke="#121216" strokeWidth="6" />
            <circle cx="50" cy="22" r="6" fill="#121216" />
            <text x="50" y="44" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#121216" letterSpacing="0.05em">HIFT</text>
            <text x="50" y="60" textAnchor="middle" fontSize="13" fontWeight="900" fill="#121216">IRON BOX</text>
            <rect x="35" y="74" width="30" height="3" fill="#121216" rx="1.5" />
          </svg>
        )}
      </div>

      {/* Typography */}
      {layout !== 'icon-only' && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: layout === 'vertical' ? 'center' : 'flex-start' 
        }}>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: currentDim.title,
            fontWeight: '900',
            lineHeight: 1.1,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'baseline',
            gap: '5px'
          }}>
            <span>HIFT</span>
            <span style={{
              background: 'linear-gradient(135deg, #ff2d78, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '900'
            }}>IRON</span>
            <span style={{ fontSize: '0.9em', opacity: 0.95 }}>BOX</span>
          </div>
          {showTagline && (
            <div style={{
              fontSize: currentDim.subtitle,
              fontWeight: '700',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--brand-lilac-light)',
              marginTop: '2px',
              opacity: 0.95
            }}>
              High Intensity Functional Training
            </div>
          )}
        </div>
      )}
    </div>
  );
}
