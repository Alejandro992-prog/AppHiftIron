import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Share2, Sparkles, Trophy, Flame, CheckCircle, Camera, Palette, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkouts } from '../../context/WorkoutContext';

export default function InstagramStoryModal({ isOpen, onClose, workoutData = {} }) {
  const { currentUser } = useAuth();
  const { customLogoUrl } = useWorkouts();

  // Canvas ref for exporting high-res 1080x1920 story
  const canvasRef = useRef(null);

  // Customization state
  const [athleteScore, setAthleteScore] = useState(workoutData.score || '14:25 RX');
  const [athleteNote, setAthleteNote] = useState(workoutData.note || '¡WOD finalizado con intensidad máxima!');
  const [selectedTheme, setSelectedTheme] = useState('neon_dark'); // 'neon_dark' | 'titanium_carbon' | 'royal_violet'
  const [selectedBadge, setSelectedBadge] = useState('rx_crushed'); // 'rx_crushed' | 'pr_broken' | 'beast_mode'
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Workout details
  const workoutTitle = workoutData.title || 'Snatch Wave & Gymnastic Density';
  const workoutType = workoutData.type || (workoutData.zone === 'traditional' ? 'GIMNASIO TRADICIONAL' : 'COMPETITORS / RX');
  const workoutDuration = workoutData.duration || '60 MIN';
  const athleteName = currentUser?.name || 'Atleta HIFT';

  // Format date
  const todayFormatted = new Intl.DateTimeFormat('es-ES', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  }).format(new Date()).toUpperCase();

  const themes = [
    { id: 'neon_dark', name: 'Iron Neon', primary: '#ff2d78', secondary: '#a855f7', bg: '#0d0d14' },
    { id: 'titanium_carbon', name: 'Carbon Gold', primary: '#eab308', secondary: '#f97316', bg: '#0f172a' },
    { id: 'royal_violet', name: 'Cyber Violet', primary: '#c084fc', secondary: '#38bdf8', bg: '#130d24' }
  ];

  const badges = [
    { id: 'rx_crushed', label: '🔥 WOD CRUSHED (RX)' },
    { id: 'pr_broken', label: '🏆 NUEVO PR ROTO' },
    { id: 'beast_mode', label: '⚡ BEAST MODE ON' }
  ];

  // Draw high-resolution 1080x1920 story on canvas
  const renderStoryCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions: 1080 x 1920 (9:16 Instagram Story)
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    const theme = themes.find(t => t.id === selectedTheme) || themes[0];

    // 1. Deep textured background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);

    // Radial lighting / ambient glow from top and bottom
    const topGlow = ctx.createRadialGradient(W / 2, 200, 50, W / 2, 300, 700);
    topGlow.addColorStop(0, `${theme.primary}44`);
    topGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, W, 800);

    const botGlow = ctx.createRadialGradient(W / 2, H - 250, 50, W / 2, H - 350, 650);
    botGlow.addColorStop(0, `${theme.secondary}33`);
    botGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = botGlow;
    ctx.fillRect(0, H - 800, W, 800);

    // Subtle carbon grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Outer decorative border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    // Corner crosshairs / tech accents
    const corners = [
      [55, 55], [W - 55, 55], [55, H - 55], [W - 55, H - 55]
    ];
    ctx.fillStyle = theme.primary;
    corners.forEach(([cx, cy]) => {
      ctx.fillRect(cx - 15, cy - 3, 30, 6);
      ctx.fillRect(cx - 3, cy - 15, 6, 30);
    });

    // 2. HEADER BRANDING: HIFT IRON BOX
    ctx.textAlign = 'center';
    ctx.font = '900 36px "Montserrat", -apple-system, sans-serif';
    ctx.fillStyle = theme.primary;
    ctx.letterSpacing = '6px';
    ctx.fillText('HIFT IRON BOX', W / 2, 170);

    ctx.font = '700 20px -apple-system, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.letterSpacing = '4px';
    ctx.fillText('ATHLETE PERFORMANCE • OFFICIAL WORKOUT', W / 2, 210);

    // Top dividing line
    const gradLine = ctx.createLinearGradient(160, 240, W - 160, 240);
    gradLine.addColorStop(0, 'transparent');
    gradLine.addColorStop(0.5, theme.primary);
    gradLine.addColorStop(1, 'transparent');
    ctx.strokeStyle = gradLine;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(160, 240);
    ctx.lineTo(W - 160, 240);
    ctx.stroke();

    // 3. BADGE / PILL
    const badgeObj = badges.find(b => b.id === selectedBadge) || badges[0];
    const badgeText = badgeObj.label;
    
    // Draw badge background
    ctx.font = '900 24px -apple-system, sans-serif';
    const textWidth = ctx.measureText(badgeText).width;
    const badgeW = textWidth + 60;
    const badgeH = 54;
    const badgeX = (W - badgeW) / 2;
    const badgeY = 320;

    ctx.fillStyle = 'rgba(255, 45, 120, 0.2)';
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 2;
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 27, true, true);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(badgeText, W / 2, badgeY + 36);

    // 4. WORKOUT TITLE (Multi-line wrapper)
    ctx.font = '900 56px "Montserrat", -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    wrapText(ctx, workoutTitle.toUpperCase(), W / 2, 470, 860, 68);

    // Subtitle / Zone
    ctx.font = '700 26px -apple-system, sans-serif';
    ctx.fillStyle = theme.secondary;
    ctx.fillText(`${workoutType} • ${workoutDuration}`, W / 2, 630);

    // 5. HERO SCORE / RESULT CARD (CENTER PIECE)
    const cardX = 90;
    const cardY = 700;
    const cardW = W - 180;
    const cardH = 460;

    // Card background
    ctx.fillStyle = 'rgba(20, 20, 32, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    roundRect(ctx, cardX, cardY, cardW, cardH, 32, true, true);

    // Inner glowing border
    ctx.strokeStyle = `${theme.primary}88`;
    ctx.lineWidth = 2;
    roundRect(ctx, cardX + 12, cardY + 12, cardW - 24, cardH - 24, 24, false, true);

    // Score Label
    ctx.font = '800 24px -apple-system, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.letterSpacing = '3px';
    ctx.fillText('MARCA REGISTRADA / RESULTADO', W / 2, cardY + 80);

    // Big Score
    ctx.font = '900 96px "Montserrat", monospace';
    const scoreGrad = ctx.createLinearGradient(0, cardY + 140, 0, cardY + 260);
    scoreGrad.addColorStop(0, '#ffffff');
    scoreGrad.addColorStop(1, theme.primary);
    ctx.fillStyle = scoreGrad;
    ctx.fillText(athleteScore.toUpperCase(), W / 2, cardY + 210);

    // Divider inside card
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 60, cardY + 270);
    ctx.lineTo(cardX + cardW - 60, cardY + 270);
    ctx.stroke();

    // Motivational quote / note
    ctx.font = 'italic 500 28px -apple-system, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    wrapText(ctx, `"${athleteNote}"`, W / 2, cardY + 340, cardW - 80, 40);

    // 6. ATHLETE DETAILS & STATS
    // Athlete Avatar Circle
    const avatarY = 1260;
    ctx.beginPath();
    ctx.arc(W / 2, avatarY, 52, 0, Math.PI * 2);
    ctx.fillStyle = theme.primary;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Initials in avatar
    ctx.font = '900 44px -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    const initials = athleteName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    ctx.fillText(initials, W / 2, avatarY + 16);

    // Athlete Name
    ctx.font = '900 36px "Montserrat", -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(athleteName.toUpperCase(), W / 2, avatarY + 100);

    // Date & Location
    ctx.font = '700 24px -apple-system, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`FECHA: ${todayFormatted} • HIFT BOX`, W / 2, avatarY + 145);

    // 7. FOOTER CALL TO ACTION
    // Mini QR / Tag decoration
    ctx.font = '800 22px -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.letterSpacing = '4px';
    ctx.fillText('@HIFT_IRON_BOX • #HIFTCOMMUNITY', W / 2, H - 120);

    ctx.font = '700 18px -apple-system, sans-serif';
    ctx.fillStyle = theme.primary;
    ctx.letterSpacing = '2px';
    ctx.fillText('NO DAYS OFF • STRONGER EVERY DAY', W / 2, H - 85);
  };

  // Helper function to draw rounded rectangles
  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // Helper to wrap long text
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
  }

  // Re-render canvas whenever options change
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        renderStoryCanvas();
      }, 50);
    }
  }, [isOpen, athleteScore, athleteNote, selectedTheme, selectedBadge, workoutData]);

  // Download Story as High-Res PNG (1080x1920)
  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `HIFT_Story_${workoutTitle.replace(/\s+/g, '_')}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct Share via Mobile Web Share API
  const handleShareStory = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          handleDownloadImage();
          return;
        }

        const file = new File([blob], 'HIFT_Iron_Box_Story.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `HIFT Iron Box - ${workoutTitle}`,
            text: `¡Entrenamiento completado en HIFT Iron Box! Marca: ${athleteScore}`,
            files: [file]
          });
        } else {
          // Fallback: download image directly
          handleDownloadImage();
        }
      }, 'image/png', 1.0);
    } catch (err) {
      console.warn('Share not supported, falling back to download', err);
      handleDownloadImage();
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay animate-fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 3, 8, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 110,
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
          maxWidth: '460px',
          maxHeight: '92vh',
          background: 'radial-gradient(circle at 50% 0%, #1e1230 0%, #0d0d14 100%)',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 45, 120, 0.4)',
          overflowY: 'auto',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ff2d78 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 10px rgba(255, 45, 120, 0.4)'
            }}>
              <Camera size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#ffffff', margin: 0 }}>
                Compartir en Instagram Stories
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                Generador de Story Oficial HIFT Iron Box
              </p>
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
            <X size={18} />
          </button>
        </div>

        {/* Live Canvas Preview (Scaled down visually while retaining full 1080x1920 pixels) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '10px 0',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <canvas
            ref={canvasRef}
            style={{
              width: '210px',
              height: '373px', // Exactly 9:16 aspect ratio
              borderRadius: '16px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          />
        </div>

        {/* Customization Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Result / Score Input */}
          <div>
            <label style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>
              Tu Marca / Resultado (Tiempo, kg o reps)
            </label>
            <input
              type="text"
              value={athleteScore}
              onChange={(e) => setAthleteScore(e.target.value)}
              placeholder="ej: 14:25 RX / 95 kg / 240 reps"
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1.5px solid var(--brand-pink)',
                color: '#ffffff',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                fontWeight: '800',
                outline: 'none'
              }}
            />
          </div>

          {/* Badge Selector */}
          <div>
            <label style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>
              Distintivo del WOD
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {badges.map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBadge(b.id)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '10px',
                    fontWeight: '800',
                    background: selectedBadge === b.id ? 'var(--brand-gradient)' : 'var(--bg-surface)',
                    color: selectedBadge === b.id ? '#ffffff' : 'var(--text-secondary)',
                    border: selectedBadge === b.id ? 'none' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Color Selector */}
          <div>
            <label style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>
              Estilo Visual de la Card
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {themes.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTheme(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '7px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '11px',
                    fontWeight: '800',
                    background: selectedTheme === t.id ? 'rgba(255, 255, 255, 0.12)' : 'var(--bg-surface)',
                    border: selectedTheme === t.id ? `1.5px solid ${t.primary}` : '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.primary }} />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons: Download and Share */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
          <button
            onClick={handleDownloadImage}
            disabled={isGenerating}
            style={{
              padding: '13px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              border: '1.5px solid var(--border-highlight)',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Download size={16} color="var(--brand-lilac-light)" />
            <span>Descargar Story HD</span>
          </button>

          <button
            onClick={handleShareStory}
            disabled={isGenerating}
            className="btn-primary"
            style={{
              padding: '13px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12.5px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Share2 size={16} />
            <span>Compartir Directo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
