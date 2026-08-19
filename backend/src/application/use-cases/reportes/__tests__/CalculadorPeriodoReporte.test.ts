import { describe, it, expect } from 'vitest';
import { CalculadorPeriodoReporte } from '../CalculadorPeriodoReporte';

describe('CalculadorPeriodoReporte', () => {
  const referencia = new Date('2026-08-19T10:00:00.000Z');

  it('debería calcular el día completo para tipo DIA', () => {
    const periodo = CalculadorPeriodoReporte.para('DIA', referencia);
    expect(periodo.desde.getHours()).toBe(0);
    expect(periodo.hasta.getHours()).toBe(23);
    expect(periodo.desde.toDateString()).toBe(periodo.hasta.toDateString());
  });

  it('debería devolver una semana que inicia en lunes', () => {
    const periodo = CalculadorPeriodoReporte.para('SEMANA', referencia);
    expect(periodo.desde.getDay()).toBe(1);
    expect(periodo.desde.getHours()).toBe(0);
  });

  it('debería devolver el mes en curso completo', () => {
    const periodo = CalculadorPeriodoReporte.para('MES', referencia);
    expect(periodo.desde.getDate()).toBe(1);
    expect(periodo.hasta.getMonth()).toBe(periodo.desde.getMonth());
  });
});
