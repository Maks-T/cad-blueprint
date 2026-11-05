/** Базовая ошибка библиотеки. `field` указывает на проблемное поле / объект. */
export class CadError extends Error {
  public readonly field: string;

  constructor(field: string, message: string) {
    super(`[cad-blueprint] ${field}: ${message}`);
    this.name = 'CadError';
    this.field = field;
  }
}
