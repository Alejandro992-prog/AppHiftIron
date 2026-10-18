import { describe, it, expect } from 'vitest';
import { formatSecondsToTimer, parseWorkoutText } from '../documentParser.js';

describe('Document Parser - documentParser.js', () => {
  describe('formatSecondsToTimer', () => {
    it('debe formatear segundos en formato MM:SS correctamente', () => {
      expect(formatSecondsToTimer(0)).toBe('00:00');
      expect(formatSecondsToTimer(59)).toBe('00:59');
      expect(formatSecondsToTimer(60)).toBe('01:00');
      expect(formatSecondsToTimer(90)).toBe('01:30');
      expect(formatSecondsToTimer(605)).toBe('10:05');
    });
  });

  describe('parseWorkoutText', () => {
    it('debe lanzar un error descriptivo si el texto recibido está vacío', () => {
      expect(() => parseWorkoutText('')).toThrow('El documento está vacío');
      expect(() => parseWorkoutText('   ')).toThrow('El documento está vacío');
    });

    it('debe detectar correctamente el día de la semana a partir de la cabecera', () => {
      const sampleText = `
        LUNES - FUERZA Y METCON
        Duración estimada: 60 min
        A. WARM-UP (10 MIN)
        3 Rondas de:
        - 10 Air Squats
        - 10 Push-ups
      `;

      const result = parseWorkoutText(sampleText);
      expect(result.dayId).toBe('mon');
      expect(result.duration).toBe('60 MIN');
      expect(result.title).toContain('LUNES');
      expect(result.sections.length).toBeGreaterThan(0);
    });

    it('no debe confundir palabras como "dominadas" con el día domingo', () => {
      const sampleText = `
        SESIÓN DE FUERZA TREN SUPERIOR
        A. WARM-UP
        - 3x10 Dominadas estrictas
        - 3x10 Fondos en paralelas
      `;

      // Si no hay un día explícito al principio, debe conservar el defaultDayId ('wed')
      const result = parseWorkoutText(sampleText, 'wed');
      expect(result.dayId).toBe('wed');
    });

    it('debe reconocer secciones de calentamiento, intervalos y metcon en formato HIFT', () => {
      const sampleText = `
        MIÉRCOLES HIFT BOX
        Duración estimada: 50 min
        
        Warm-up - 10'
        3 Rondas de movilidad:
        - 10 Dislocaciones de pica
        - 10 Sentadillas de arranque
        
        A - Every 2'30" x 4 - 10'
        - 1 Hang Power Snatch + 1 Overhead Squat
        
        B - AMRAP 12'
        - 12 Box Jumps
        - 12 Kettlebell Swings
      `;

      const result = parseWorkoutText(sampleText);
      expect(result.dayId).toBe('wed');
      expect(result.duration).toBe('50 MIN');
      expect(result.sections).toBeDefined();
      expect(result.sections.length).toBe(3);
      expect(result.sections[0].blockType).toBe('warmup');
      expect(result.sections[1].blockType).toBe('interval');
      expect(result.sections[2].blockType).toBe('metcon_wod');
    });
  });
});
