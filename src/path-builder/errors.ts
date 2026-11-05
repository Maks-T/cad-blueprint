import { CadError } from '../errors';

/** Ошибка построения контура (`CadPath`): неверные аргументы, невозможное сопряжение, пустой путь. */
export class CadPathError extends CadError {
  constructor(field: string, message: string) {
    super(field, message);
    this.name = 'CadPathError';
  }
}
