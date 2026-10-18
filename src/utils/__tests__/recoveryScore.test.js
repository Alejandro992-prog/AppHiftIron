import { describe, it, expect } from 'vitest';
import { 
  scale1to5to10, 
  calculateIronRecoveryScore, 
  DEFAULT_SCORE_THRESHOLDS,
  RECOVERY_STATES 
} from '../recoveryScore.js';

describe('Iron Program - recoveryScore.js', () => {
  describe('scale1to5to10', () => {
    it('debe mapear correctamente la escala de 1-5 a 0-10', () => {
      expect(scale1to5to10(1)).toBe(2);
      expect(scale1to5to10(2)).toBe(4);
      expect(scale1to5to10(3)).toBe(6);
      expect(scale1to5to10(4)).toBe(8);
      expect(scale1to5to10(5)).toBe(10);
    });

    it('debe manejar valores por defecto o no numéricos', () => {
      expect(scale1to5to10(null)).toBe(6);
      expect(scale1to5to10(undefined)).toBe(6);
    });
  });

  describe('calculateIronRecoveryScore', () => {
    it('debe clasificar como ÓPTIMO cuando los valores son máximos', () => {
      const result = calculateIronRecoveryScore({
        sleep: 5,
        fatigue: 5,
        energy: 5,
        stress: 5,
        prs: 10,
        hasPain: false
      });

      expect(result.score).toBe(10.0);
      expect(result.finalState).toBe('optimal');
      expect(result.downgraded).toBe(false);
      expect(result.hasPain).toBe(false);
      expect(result.painAlert).toBeNull();
      expect(result.stateData.volumeReduction).toBe('0%');
    });

    it('debe clasificar como ADECUADO en un rango intermedio-alto (6.5 - 7.9)', () => {
      const result = calculateIronRecoveryScore({
        sleep: 4,   // 8 * 0.20 = 1.6
        fatigue: 4, // 8 * 0.20 = 1.6
        energy: 3,  // 6 * 0.10 = 0.6
        stress: 3,  // 6 * 0.10 = 0.6
        prs: 7,     // 7 * 0.40 = 2.8 -> Total = 7.2
        hasPain: false
      });

      expect(result.score).toBe(7.2);
      expect(result.finalState).toBe('adequate');
      expect(result.downgraded).toBe(false);
    });

    it('debe clasificar como RECUPERACIÓN LIMITADA en rango 5.0 - 6.4', () => {
      const result = calculateIronRecoveryScore({
        sleep: 3,   // 6 * 0.20 = 1.2
        fatigue: 3, // 6 * 0.20 = 1.2
        energy: 3,  // 6 * 0.10 = 0.6
        stress: 2,  // 4 * 0.10 = 0.4
        prs: 5,     // 5 * 0.40 = 2.0 -> Total = 5.4
        hasPain: false
      });

      expect(result.score).toBe(5.4);
      expect(result.finalState).toBe('limited');
      expect(result.stateData.volumeReduction).toBe('10-20%');
    });

    it('debe aplicar la regla Iron Program de descenso automático cuando 2 o más variables están en 1/5', () => {
      // Puntuación aritmética calculada:
      // sleep=1 (2*0.2 = 0.4), fatigue=1 (2*0.2 = 0.4), energy=4 (8*0.1 = 0.8), stress=4 (8*0.1 = 0.8), prs=10 (4.0) -> Total = 6.4 (sería limited)
      // Con 2 variables en 1/5 (Sueño y Fatiga), debe descender de 'limited' a 'low'
      const result = calculateIronRecoveryScore({
        sleep: 1,
        fatigue: 1,
        energy: 4,
        stress: 4,
        prs: 10,
        hasPain: false
      });

      expect(result.score).toBe(6.4);
      expect(result.baseState).toBe('limited');
      expect(result.finalState).toBe('low');
      expect(result.downgraded).toBe(true);
      expect(result.downgradeReason).toContain('Regla Iron Program');
    });

    it('debe activar la alerta de dolor cuando hasPain es true sin alterar la media', () => {
      const result = calculateIronRecoveryScore({
        sleep: 5,
        fatigue: 5,
        energy: 5,
        stress: 5,
        prs: 10,
        hasPain: true,
        painDescription: 'Molestia en hombro derecho',
        painAreas: ['Hombro']
      });

      expect(result.score).toBe(10.0);
      expect(result.hasPain).toBe(true);
      expect(result.painAlert).not.toBeNull();
      expect(result.painDescription).toBe('Molestia en hombro derecho');
      expect(result.painAreas).toContain('Hombro');
    });
  });
});
