import { describe, it, expect } from 'vitest';
import App from './App';

describe('Smoke test frontend', () => {
  it('debería exportar el componente App', () => {
    expect(App).toBeDefined();
  });
});
