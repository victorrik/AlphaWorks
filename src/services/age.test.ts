import {
  ageOf,
  formatDate,
  generateByAges,
  generateByRange,
  randomBirthDate,
} from './age';

// now fijo para determinismo.
const NOW = new Date(2024, 5, 15); // 15-06-2024 (mes 0-indexado: 5 = junio)

function parseFormatted(s: string): Date {
  const [dd, mm, yyyy] = s.split('-').map(Number);
  return new Date(yyyy, mm - 1, dd);
}

describe('formatDate', () => {
  it('formatea como dd-mm-aaaa con ceros a la izquierda', () => {
    expect(formatDate(new Date(2024, 0, 5))).toBe('05-01-2024');
  });
});

describe('ageOf / randomBirthDate', () => {
  it('la edad calculada de una fecha generada coincide con la objetivo', () => {
    for (let age = 0; age <= 60; age++) {
      const birth = randomBirthDate(age, NOW);
      expect(ageOf(birth, NOW)).toBe(age);
    }
  });

  it('la fecha de nacimiento es estrictamente anterior a now', () => {
    for (let age = 0; age <= 60; age++) {
      const birth = randomBirthDate(age, NOW);
      expect(birth.getTime()).toBeLessThan(NOW.getTime());
    }
  });
});

describe('generateByRange', () => {
  it('produce la cantidad pedida, con edad en rango, edad calculada correcta y fecha < now', () => {
    const records = generateByRange(10, 20, 50, NOW);
    expect(records).toHaveLength(50);
    for (const r of records) {
      expect(r.age).toBeGreaterThanOrEqual(10);
      expect(r.age).toBeLessThanOrEqual(20);
      const birth = parseFormatted(r.birthDate);
      expect(ageOf(birth, NOW)).toBe(r.age);
      expect(birth.getTime()).toBeLessThan(NOW.getTime());
    }
  });

  it('rechaza entradas inválidas', () => {
    expect(() => generateByRange(1.5, 20, 5, NOW)).toThrow();
    expect(() => generateByRange(-1, 20, 5, NOW)).toThrow();
    expect(() => generateByRange(30, 20, 5, NOW)).toThrow();
    expect(() => generateByRange(10, 20, 0, NOW)).toThrow();
  });
});

describe('generateByAges', () => {
  it('produce una fila por edad, con edad calculada correcta', () => {
    const ages = [0, 5, 18, 42];
    const records = generateByAges(ages, NOW);
    expect(records).toHaveLength(ages.length);
    records.forEach((r, i) => {
      expect(r.age).toBe(ages[i]);
      expect(ageOf(parseFormatted(r.birthDate), NOW)).toBe(ages[i]);
    });
  });

  it('rechaza lista vacía y edades inválidas', () => {
    expect(() => generateByAges([], NOW)).toThrow();
    expect(() => generateByAges([3, -1], NOW)).toThrow();
    expect(() => generateByAges([3, 2.5], NOW)).toThrow();
  });
});
