import { validateSync } from 'class-validator';
import { IsPasswordCompliant } from './is-password-compliant.validator';

class Dto {
  @IsPasswordCompliant()
  password!: string;
}

class StrictDto {
  @IsPasswordCompliant({
    minLength: 12,
    maxLength: 72,
    requireUppercase: false,
    requireLowercase: false,
    requireDigit: false,
    requireSymbol: false,
  })
  password!: string;
}

const build = <T extends object>(cls: new () => T, password: unknown): T =>
  Object.assign(new cls(), { password });

describe('IsPasswordCompliant', () => {
  it('acepta una contraseña válida con la política por defecto', () => {
    expect(validateSync(build(Dto, 'Abcdef12'))).toHaveLength(0);
  });

  it('rechaza con mensaje de violaciones', () => {
    const errors = validateSync(build(Dto, 'abc'));
    expect(errors).toHaveLength(1);
    expect(Object.values(errors[0].constraints ?? {})[0]).toContain(
      'al menos 8 caracteres',
    );
  });

  it('permite una política explícita y rechaza no-strings', () => {
    expect(validateSync(build(StrictDto, 'aaaaaaaaaaaa'))).toHaveLength(0);
    expect(validateSync(build(StrictDto, 'short'))).toHaveLength(1);
    expect(validateSync(build(Dto, 123))).toHaveLength(1);
  });
});
