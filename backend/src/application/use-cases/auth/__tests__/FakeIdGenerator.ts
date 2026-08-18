import { IdGenerator } from '@domain/ports/services/IdGenerator';

export class FakeIdGenerator implements IdGenerator {
  private contador = 0;

  generar(): string {
    this.contador++;
    return `id-${this.contador}`;
  }
}
