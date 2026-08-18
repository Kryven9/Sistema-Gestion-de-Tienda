import bcrypt from 'bcrypt';
import { PasswordHasher } from '@domain/ports/services/PasswordHasher';

const ROUNDS = 10;

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, ROUNDS);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
