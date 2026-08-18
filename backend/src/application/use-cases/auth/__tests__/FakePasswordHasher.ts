import { PasswordHasher } from '@domain/ports/services/PasswordHasher';

export class FakePasswordHasher implements PasswordHasher {
  private contador = 0;

  async hash(password: string): Promise<string> {
    this.contador++;
    return `hash-${this.contador}-${password}`;
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return hash.includes(password);
  }
}
