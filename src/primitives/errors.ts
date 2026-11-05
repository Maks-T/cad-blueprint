import { CadError } from '../errors';

/** Ошибка описания объекта чертежа (примитива, размера, вставки блока). */
export class CadPrimitiveError extends CadError {
  constructor(field: string, message: string) {
    super(field, message);
    this.name = 'CadPrimitiveError';
  }
}
