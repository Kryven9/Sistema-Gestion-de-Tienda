import { v4 as uuid } from 'uuid';
import { IdGenerator } from '@domain/ports/services/IdGenerator';

export class UuidIdGenerator implements IdGenerator {
  generar(): string {
    return uuid();
  }
}
