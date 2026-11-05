import { CadError } from '../errors';

/** Ошибка валидации настроек чертежа. `field` указывает на проблемное поле. */
export class CadSettingsError extends CadError {
  constructor(field: string, message: string) {
    super(field, message);
    this.name = 'CadSettingsError';
  }
}
