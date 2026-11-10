import type { Sexo } from './curp';

type Rng = () => number;

// Mediana [talla cm, peso kg] por edad cumplida 0..19 (punto medio del año).
// Fuente: CDC/OMS. 0-1 años: cdc.gov/growthcharts/data/zscore/{lenageinf,wtageinf}.csv
// (estándar OMS); 2-19 años: .../{statage,wtage}.csv (CDC 2000), columna P50.
const CHILD: Record<Sexo, [number, number][]> = {
  H: [
    [66.1, 7.6],
    [81.4, 11.6],
    [90.6, 13.4],
    [98.4, 15.2],
    [105.3, 17.2],
    [111.9, 19.4],
    [118.3, 21.8],
    [124.6, 24.2],
    [130.5, 26.9],
    [135.9, 30],
    [140.9, 33.7],
    [145.9, 37.9],
    [152.1, 42.8],
    [159.7, 48.1],
    [167, 53.5],
    [171.9, 58.5],
    [174.5, 62.7],
    [175.8, 65.9],
    [176.4, 68.1],
    [176.7, 69.9],
  ],
  M: [
    [64.4, 7],
    [79.8, 10.9],
    [89.6, 12.9],
    [97.1, 14.7],
    [103.9, 16.7],
    [110.9, 19],
    [117.9, 21.4],
    [124.4, 24],
    [130.1, 27.1],
    [135.2, 30.7],
    [140.5, 34.8],
    [147.2, 39.2],
    [154.3, 43.6],
    [158.9, 47.5],
    [161.2, 50.7],
    [162.2, 53],
    [162.7, 54.5],
    [163, 55.6],
    [163.2, 56.7],
    [163.3, 57.8],
  ],
};

// Promedios de adultos mexicanos (talla cm, peso kg), interpolados entre puntos.
// Solo el punto de 67 años es dato publicado (adultos mayores de CDMX, PubMed 9054016:
// H 164 cm / 70.7 kg, M 150 cm / 60.8 kg). Los demás son ESTIMACIONES a ajustar
// con ENSANUT cuando haya una tabla por edad.
const ADULT: Record<Sexo, { age: number; height: number; weight: number }[]> = {
  H: [
    { age: 20, height: 167, weight: 72 },
    { age: 40, height: 167, weight: 79 },
    { age: 55, height: 166, weight: 77 },
    { age: 67, height: 164, weight: 70.7 },
    { age: 80, height: 161, weight: 65 },
    { age: 95, height: 158, weight: 60 },
  ],
  M: [
    { age: 20, height: 155, weight: 62 },
    { age: 40, height: 155, weight: 68 },
    { age: 55, height: 153, weight: 67 },
    { age: 67, height: 150, weight: 60.8 },
    { age: 80, height: 147, weight: 56 },
    { age: 95, height: 144, weight: 52 },
  ],
};

// Coeficientes de variación y correlación talla-peso (constantes de aproximación).
const HEIGHT_CV = 0.04;
const WEIGHT_CV = 0.15;
const HEIGHT_WEIGHT_CORR = 0.5;
const MAX_Z = 2; // trunca a ±2 desviaciones para evitar valores absurdos

function interpolate(
  points: { age: number; height: number; weight: number }[],
  age: number,
) {
  if (age <= points[0].age) {
    return points[0];
  }
  for (let i = 1; i < points.length; i++) {
    if (age <= points[i].age) {
      const a = points[i - 1];
      const b = points[i];
      const t = (age - a.age) / (b.age - a.age);
      return {
        height: a.height + (b.height - a.height) * t,
        weight: a.weight + (b.weight - a.weight) * t,
      };
    }
  }
  return points[points.length - 1];
}

// Promedio de talla (cm) y peso (kg) para el sexo y la edad dados.
// De 2 a 19 años las medianas del CDC se escalan de forma gradual (hasta los 12) al
// promedio adulto mexicano, para no tener un salto brusco a los 20 años.
export function averageFor(
  sexo: Sexo,
  age: number,
): { height: number; weight: number } {
  const adult = interpolate(ADULT[sexo], Math.max(age, 20));
  if (age >= 20) {
    return adult;
  }
  const [h, w] = CHILD[sexo][age];
  if (age < 2) {
    return { height: h, weight: w };
  }
  const [h19, w19] = CHILD[sexo][19];
  // Factor completo a partir de los 12 años: con una rampa más larga el escalado
  // supera el crecimiento del CDC y un joven de 18 saldría más alto que uno de 19.
  const t = Math.min(1, (age - 2) / 10);
  return {
    height: h * (1 + (adult.height / h19 - 1) * t),
    weight: w * (1 + (adult.weight / w19 - 1) * t),
  };
}

// Normal estándar (Box-Muller) con la fuente aleatoria inyectable.
function gaussian(rng: Rng): number {
  const u = 1 - rng(); // (0, 1]
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

const clampZ = (z: number) => Math.max(-MAX_Z, Math.min(MAX_Z, z));

// Talla en cm (entera) y peso en kg (un decimal) alrededor del promedio.
export function randomBody(sexo: Sexo, age: number, rng: Rng = Math.random) {
  const { height, weight } = averageFor(sexo, age);
  const zh = clampZ(gaussian(rng));
  const zw = clampZ(
    HEIGHT_WEIGHT_CORR * zh +
      Math.sqrt(1 - HEIGHT_WEIGHT_CORR ** 2) * gaussian(rng),
  );
  return {
    height: Math.round(height * (1 + HEIGHT_CV * zh)),
    weight: Math.round(weight * (1 + WEIGHT_CV * zw) * 10) / 10,
  };
}
