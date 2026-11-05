import { CadError } from '../errors';

/** Ошибка геометрии: неверная точка, матрица, вырожденная фигура. */
export class CadGeometryError extends CadError {
  constructor(field: string, message: string) {
    super(field, message);
    this.name = 'CadGeometryError';
  }
}
