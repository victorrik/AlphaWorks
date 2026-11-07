import {buildCurp, checkDigit, CurpInput, isValidCurp, STATE_CODES} from './curp';

const base: CurpInput = {
  nombres: ['Gloria'],
  apellidoPaterno: 'Hernández',
  apellidoMaterno: 'García',
  birth: new Date(1956, 3, 27),
  sexo: 'M',
  estado: 'VZ',
  diferenciador: '0',
};

const curp = (over: Partial<CurpInput>) => buildCurp({...base, ...over});

describe('isValidCurp / buildCurp ejemplos', () => {
  it('valida HEGG560427MVZRRL04 y rechaza ...05', () => {
    expect(isValidCurp('HEGG560427MVZRRL04')).toBe(true);
    expect(isValidCurp('HEGG560427MVZRRL05')).toBe(false);
  });

  it('construye la CURP de Gloria Hernández García', () => {
    expect(buildCurp(base)).toBe('HEGG560427MVZRRL04');
  });

  it('reemplaza palabra inconveniente PEDO → PXDO', () => {
    const c = curp({apellidoPaterno: 'Pérez', apellidoMaterno: 'Domínguez', nombres: ['Óscar']});
    expect(c.slice(0, 4)).toBe('PXDO');
    expect(isValidCurp(c)).toBe(true);
  });

  it('salta JOSÉ/MARÍA cuando hay más de un nombre', () => {
    expect(curp({nombres: ['José', 'Luis']})[3]).toBe('L');
    expect(curp({nombres: ['María', 'Fernanda']})[3]).toBe('F');
    expect(curp({nombres: ['Ma.', 'Fernanda']})[3]).toBe('F');
    expect(curp({nombres: ['José']})[3]).toBe('J');
  });

  it('ignora partículas iniciales del apellido', () => {
    expect(curp({apellidoPaterno: 'de la Cruz'}).slice(0, 2)).toBe('CU');
  });

  it('convierte Ñ en X', () => {
    expect(curp({apellidoPaterno: 'Ñúñez'})[0]).toBe('X');
    expect(curp({apellidoPaterno: 'Muñoz'})[13]).toBe('X');
  });

  it('apellido materno vacío → X en carácter 3 y 15', () => {
    const c = curp({apellidoMaterno: ''});
    expect(c[2]).toBe('X');
    expect(c[14]).toBe('X');
    expect(isValidCurp(c)).toBe(true);
  });
});

const pick = (s: string | readonly string[]) => s[Math.floor(Math.random() * s.length)];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ';
const DIGITS = '0123456789';
const pad2 = (n: number) => String(n).padStart(2, '0');

function randomPrefix(): string {
  return (
    pick(LETTERS) +
    pick('AEIOUX') +
    pick(LETTERS) +
    pick(LETTERS) +
    pick(DIGITS) +
    pick(DIGITS) +
    pad2(1 + Math.floor(Math.random() * 12)) +
    pad2(1 + Math.floor(Math.random() * 31)) +
    pick('HM') +
    pick(STATE_CODES) +
    pick(CONSONANTS) +
    pick(CONSONANTS) +
    pick(CONSONANTS) +
    pick(DIGITS + LETTERS)
  );
}

describe('Feature: curp-generator, Property 4: El dígito verificador detecta alteraciones del carácter 18', () => {
  // **Validates: Requirements 4.10, 4.11**
  it('acepta solo el dígito verificador correcto', () => {
    for (let i = 0; i < 200; i++) {
      const p = randomPrefix();
      const d = checkDigit(p);
      expect(isValidCurp(p + d)).toBe(true);
      for (const other of DIGITS) {
        if (other !== d) expect(isValidCurp(p + other)).toBe(false);
      }
    }
  });
});
