import React from 'react';
import { CATEGORIES } from '../../data/initialWorkouts';
import { useWorkouts } from '../../context/WorkoutContext';
import { Flame, Dumbbell, Zap, HeartPulse, Layers } from 'lucide-react';

const icons = {
  all: Layers,
  crossfit: Flame,
  gym: Dumbbell,
  hyrox: Zap,
  mobility: HeartPulse
};

export default function CategoryFilter() {
  const { selectedCategory, setSelectedCategory } = useWorkouts();

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      padding: '2px 0 6px 0',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      {CATEGORIES.map(cat => {
        const isSelected = selectedCategory === cat.id;
        const Icon = icons[cat.id] || Layers;

        return (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: isSelected 
                ? 'var(--brand-gradient)' 
                : 'var(--bg-secondary)',
              border: isSelected 
                ? '1px solid transparent' 
                : '1px solid var(--border-subtle)',
              color: isSelected ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '600',
              boxShadow: isSelected ? 'var(--brand-gradient-glow)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Icon size={14} color={isSelected ? '#ffffff' : 'currentColor'} />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
