import i18n, { resources } from './index';

// Claves en notación de punto, p. ej. errors.integers.
const keys = (o: object, prefix = ''): string[] =>
  Object.entries(o).flatMap(([k, v]) =>
    typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );

test('es y en tienen las mismas claves en cada namespace', () => {
  for (const ns of Object.keys(resources.es) as (keyof typeof resources.es)[]) {
    expect(keys(resources.en[ns]).sort()).toEqual(keys(resources.es[ns]).sort());
  }
});

test('cambia entre español e inglés', async () => {
  await i18n.changeLanguage('en');
  expect(i18n.t('common:generate')).toBe('Generate');
  await i18n.changeLanguage('es');
  expect(i18n.t('common:generate')).toBe('Generar');
});

test('un idioma no soportado cae a español', async () => {
  await i18n.changeLanguage('fr');
  expect(i18n.t('common:generate')).toBe('Generar');
});
