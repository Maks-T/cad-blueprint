import { CadError } from '../errors';

/** Ошибка блоков: имя, определение, вставка, циклическая вложенность. */
export class CadBlockError extends CadError {
  constructor(field: string, message: string) {
    super(field, message);
    this.name = 'CadBlockError';
  }
}
