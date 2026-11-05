import { CadError } from '../errors';

/** Ошибка описания или построения размера / выноски. */
export class CadDimensionError extends CadError {
  constructor(field: string, message: string) {
    super(field, message);
    this.name = 'CadDimensionError';
  }
}
