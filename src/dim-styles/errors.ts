import { CadError } from '../errors';

/** Ошибка валидации размерного стиля или операции над таблицей размерных стилей. */
export class CadDimStyleError extends CadError {
  constructor(field: string, message: string) {
    super(field, message);
    this.name = 'CadDimStyleError';
  }
}
