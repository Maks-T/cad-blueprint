import { CadError } from '../errors';

/** Ошибка валидации слоя, штриховки или операции над реестром слоёв. */
export class CadLayerError extends CadError {
  constructor(field: string, message: string) {
    super(field, message);
    this.name = 'CadLayerError';
  }
}
