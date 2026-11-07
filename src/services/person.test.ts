import { ageOf } from './age';
import { isValidCurp, STATE_CODES } from './curp';
import { generatePeople } from './person';

// now fijo para determinismo.
const NOW = new Date(2024, 5, 15); // 15-06-2024 (mes 0-indexado: 5 = junio)

function parseFormatted(s: string): Date {
  const [dd, mm, yyyy] = s.split('-').map(Number);
  return new Date(yyyy, mm - 1, dd);
}

const randInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

describe('Property 1: Personas dentro del rango y fecha coherente', () => {
  // **Validates: Requirements 1.1, 1.2, 1.3**
  it('count Personas, edad en [min, max], ageOf(fecha) === age y fecha < now', () => {
    for (let i = 0; i < 100; i++) {
      const min = randInt(0, 100);
      const max = randInt(min, 120);
      const count = randInt(1, 20);
      const people = generatePeople(min, max, count, NOW);
      expect(people).toHaveLength(count);
      for (const p of people) {
        const birth = parseFormatted(p.birthDate);
        expect(p.age).toBeGreaterThanOrEqual(min);
        expect(p.age).toBeLessThanOrEqual(max);
        expect(ageOf(birth, NOW)).toBe(p.age);
        expect(birth.getTime()).toBeLessThan(NOW.getTime());
      }
    }
  });
});

describe('Property 2: Toda CURP generada es válida y consistente con la Persona', () => {
  // **Validates: Requirements 2.3, 3.3, 4.3, 4.6, 4.7, 4.10, 4.11**
  it('isValidCurp, AAMMDD = fecha, [10] = sexo, [11..13] = stateCode ∈ STATE_CODES', () => {
    for (let i = 0; i < 100; i++) {
      const min = randInt(0, 100);
      const max = randInt(min, 120);
      for (const p of generatePeople(min, max, randInt(1, 20), NOW)) {
        const [dd, mm, yyyy] = p.birthDate.split('-');
        expect(isValidCurp(p.curp)).toBe(true);
        expect(p.curp.slice(4, 10)).toBe(yyyy.slice(2) + mm + dd);
        expect(['H', 'M']).toContain(p.sexo);
        expect(p.curp[10]).toBe(p.sexo);
        expect(p.curp.slice(11, 13)).toBe(p.stateCode);
        expect(STATE_CODES).toContain(p.stateCode);
        expect(p.stateCode).not.toBe('NE');
      }
    }
  });
});

describe('Property 3: Diferenciador según siglo', () => {
  // **Validates: Requirements 4.8, 4.9**
  it('[16] es dígito si nacimiento < 2000, letra A-Z si ≥ 2000', () => {
    let digits = 0;
    let letters = 0;
    for (let i = 0; i < 100; i++) {
      // Edades 15..35 con now = 2024 cruzan el año 2000.
      for (const p of generatePeople(15, 35, randInt(1, 20), NOW)) {
        const year = parseFormatted(p.birthDate).getFullYear();
        if (year < 2000) {
          expect(p.curp[16]).toMatch(/^[0-9]$/);
          digits++;
        } else {
          expect(p.curp[16]).toMatch(/^[A-Z]$/);
          letters++;
        }
      }
    }
    expect(digits).toBeGreaterThan(0);
    expect(letters).toBeGreaterThan(0);
  });
});
describe('Property 5: Distribuciones de estado y número de nombres', () => {
  // **Validates: Requirements 2.2, 3.1, 3.2**
  it('5000 muestras: GR ≈ 0.80; 1/2/3 nombres ≈ 0.80/0.15/0.05; resto ∈ otras 31 claves', () => {
    const N = 5000;
    const people = generatePeople(18, 60, N, NOW);
    expect(people).toHaveLength(N);
    const others = STATE_CODES.filter(c => c !== 'GR');
    const share = (pred: (p: (typeof people)[number]) => boolean) =>
      people.filter(pred).length / N;

    for (const p of people) {
      if (p.stateCode !== 'GR') expect(others).toContain(p.stateCode);
    }
    const gr = share(p => p.stateCode === 'GR');
    expect(gr).toBeGreaterThanOrEqual(0.77);
    expect(gr).toBeLessThanOrEqual(0.83);

    const bounds: Array<[number, number, number]> = [
      [1, 0.77, 0.83],
      [2, 0.12, 0.18],
      [3, 0.03, 0.07],
    ];
    for (const [n, lo, hi] of bounds) {
      const s = share(p => p.nombres.split(' ').length === n);
      expect(s).toBeGreaterThanOrEqual(lo);
      expect(s).toBeLessThanOrEqual(hi);
    }
  });
});

describe('Property 6: Entradas inválidas lanzan', () => {
  // **Validates: Requirements 1.4, 1.5, 1.6, 1.7**
  it('no enteros, min < 0, max < min o count < 1 lanzan con el mensaje de validateRange', () => {
    const frac = () => randInt(0, 100) + 0.1 + Math.random() * 0.8; // nunca entero
    const cases: Array<() => [number, number, number, string]> = [
      () => {
        // Un solo campo no entero; los demás válidos.
        const args = [randInt(0, 50), randInt(50, 120), randInt(1, 20)];
        args[randInt(0, 2)] = frac();
        return [args[0], args[1], args[2], 'Mínimo, máximo y cantidad deben ser enteros.'];
      },
      () => {
        const min = -randInt(1, 100);
        return [min, randInt(min, 120), randInt(1, 20), 'La edad mínima debe ser mayor o igual a 0.'];
      },
      () => {
        const min = randInt(1, 120);
        return [min, randInt(0, min - 1), randInt(1, 20), 'La edad máxima debe ser mayor o igual a la mínima.'];
      },
      () => {
        const min = randInt(0, 100);
        return [min, randInt(min, 120), -randInt(0, 100), 'La cantidad debe ser un entero mayor o igual a 1.'];
      },
    ];
    for (let i = 0; i < 100; i++) {
      const [min, max, count, msg] = cases[i % cases.length]();
      expect(() => generatePeople(min, max, count, NOW)).toThrow(msg);
    }
  });
});
