import { CadError } from '../errors';

/** Ошибка валидации шрифта, текстового стиля или операции над их реестрами. */
export class CadTypographyError extends CadError {
  constructor(field: string, message: string) {
    super(field, message);
    this.name = 'CadTypographyError';
  }
}
