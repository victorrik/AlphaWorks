import { faker } from '@faker-js/faker/locale/es_MX'; // solo el locale es_MX
import { formatDate, randomBirthDate, validateRange } from './age';
import { randomBody } from './anthropometry';
import { buildCurp, STATE_CODES, type Sexo } from './curp';

export type Rng = () => number;

export type Person = {
  nombres: string; // nombres de pila unidos por espacio
  apellidoPaterno: string;
  apellidoMaterno: string;
  sexo: Sexo;
  birthDate: string; // dd-mm-aaaa
  age: number;
  stateCode: string;
  height: number; // cm
  weight: number; // kg
  curp: string;
};

const OTHER_STATES = STATE_CODES.filter(c => c !== 'GR');

// 1..n nombres distintos del mismo sexo; solo la primera palabra de cada uno
// para que el conteo sea exacto (el locale trae nombres compuestos).
function givenNames(n: number, sexo: Sexo): string[] {
  const names: string[] = [];
  while (names.length < n) {
    const name = faker.person.firstName(sexo === 'H' ? 'male' : 'female').split(' ')[0];
    if (!names.includes(name)) names.push(name);
  }
  return names;
}

export function generatePeople(
  min: number,
  max: number,
  count: number,
  now: Date,
  rng: Rng = Math.random,
): Person[] {
  validateRange(min, max, count);

  const people: Person[] = [];
  for (let i = 0; i < count; i++) {
    const sexo: Sexo = rng() < 0.5 ? 'H' : 'M';
    const r = rng();
    const nombres = givenNames(r < 0.9 ? 1 : 2, sexo);
    // Apellidos tal cual (pueden ser compuestos); buildCurp usa la primera palabra útil.
    const apellidoPaterno = faker.person.lastName();
    const apellidoMaterno = faker.person.lastName();
    const stateCode = rng() < 0.8 ? 'GR' : OTHER_STATES[Math.floor(rng() * OTHER_STATES.length)];
    const age = min + Math.floor(rng() * (max - min + 1));
    const birth = randomBirthDate(age, now);
    const { height, weight } = randomBody(sexo, age, rng);
    const diferenciador =
      birth.getFullYear() < 2000
        ? String(Math.floor(rng() * 10))
        : String.fromCharCode(65 + Math.floor(rng() * 26));

    people.push({
      nombres: nombres.join(' '),
      apellidoPaterno,
      apellidoMaterno,
      sexo,
      birthDate: formatDate(birth),
      age,
      stateCode,
      height,
      weight,
      curp: buildCurp({
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        birth,
        sexo,
        estado: stateCode,
        diferenciador,
      }),
    });
  }
  return people;
}
