import React from 'react';
import { MUSCLE_GROUPS } from '../../data/initialWorkouts';
import { Dumbbell } from 'lucide-react';

export default function MuscleGroupSelector({ selectedGroup, onSelectGroup }) {
  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      overflowX: 'auto',
      padding: '2px 0 4px 0',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      {MUSCLE_GROUPS.map((group) => {
        const isSelected = selectedGroup === group.id;

        return (
          <button
            key={group.id}
            onClick={() => onSelectGroup(group.id)}
            style={{
              flexShrink: 0,
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: isSelected ? 'var(--brand-gradient)' : 'var(--bg-secondary)',
              border: isSelected ? '1px solid transparent' : '1px solid var(--border-subtle)',
              color: isSelected ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '11.5px',
              fontWeight: '700',
              transition: 'all var(--transition-fast)'
            }}
          >
            {group.label}
          </button>
        );
      })}
    </div>
  );
}
