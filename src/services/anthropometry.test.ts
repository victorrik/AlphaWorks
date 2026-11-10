import { averageFor, randomBody } from './anthropometry';

test('hombres más altos y pesados que mujeres a los 25 años', () => {
  const h = averageFor('H', 25);
  const m = averageFor('M', 25);
  expect(h.height).toBeGreaterThan(m.height);
  expect(h.weight).toBeGreaterThan(m.weight);
});

test('sin salto brusco entre 19 y 20 años', () => {
  for (const sexo of ['H', 'M'] as const) {
    const a = averageFor(sexo, 19);
    const b = averageFor(sexo, 20);
    expect(Math.abs(a.height - b.height)).toBeLessThan(2);
    expect(Math.abs(a.weight - b.weight)).toBeLessThan(3);
  }
});

test('el promedio de 67 años coincide con el dato publicado', () => {
  expect(averageFor('H', 67)).toEqual({ height: 164, weight: 70.7 });
  expect(averageFor('M', 67)).toEqual({ height: 150, weight: 60.8 });
});

test('la talla crece con la edad hasta los 19 años', () => {
  for (const sexo of ['H', 'M'] as const) {
    for (let age = 1; age <= 19; age++) {
      expect(averageFor(sexo, age).height).toBeGreaterThan(
        averageFor(sexo, age - 1).height,
      );
    }
  }
});

test('randomBody queda dentro de ±2 desviaciones del promedio', () => {
  for (let i = 0; i < 2000; i++) {
    const age = Math.floor(Math.random() * 100);
    const sexo = Math.random() < 0.5 ? 'H' : 'M';
    const avg = averageFor(sexo, age);
    const { height, weight } = randomBody(sexo, age);
    expect(Math.abs(height - avg.height)).toBeLessThanOrEqual(
      avg.height * 0.04 * 2 + 1,
    );
    expect(Math.abs(weight - avg.weight)).toBeLessThanOrEqual(
      avg.weight * 0.15 * 2 + 0.1,
    );
  }
});
