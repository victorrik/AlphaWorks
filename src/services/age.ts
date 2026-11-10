export type GeneratedRecord = { birthDate: string; age: number };

// Clave del namespace 'common' de i18n; la UI la traduce, la lógica no conoce idiomas.
export type ValidationKey =
  | 'errors.integers'
  | 'errors.minNegative'
  | 'errors.maxLessThanMin'
  | 'errors.countMin'
  | 'errors.agesEmpty'
  | 'errors.agesInvalid';

export class ValidationError extends Error {
  constructor(public key: ValidationKey) {
    super(key);
  }
}

function isInt(n: number): boolean {
  return Number.isInteger(n);
}

// Fecha de nacimiento aleatoria para una edad entera dada, siempre < now.
// Elige un día aleatorio dentro de la ventana que mantiene la edad cumplida
// == age: desde el día posterior al último cumpleaños que daría age+1, hasta
// hoy. Así la edad calculada coincide con la objetivo y la fecha es < now.
export function randomBirthDate(age: number, now: Date): Date {
  // Último día posible: nació hoy hace `age` años (cumple hoy) -> edad == age.
  const latest = new Date(now.getFullYear() - age, now.getMonth(), now.getDate());
  // Primer día posible: un día después de cumplir age+1 años atrás, es decir
  // nacido (age+1) años antes + 1 día; antes de eso la edad sería age+1.
  const earliest = new Date(now.getFullYear() - age - 1, now.getMonth(), now.getDate());
  earliest.setDate(earliest.getDate() + 1);

  const spanMs = latest.getTime() - earliest.getTime();
  const birth = new Date(earliest.getTime() + Math.floor(Math.random() * (spanMs + 1)));

  // El extremo joven del rango (latest) sería igual a now cuando age es la edad
  // de alguien nacido hoy; forzamos estrictamente < now.
  if (birth.getTime() >= now.getTime()) {
    birth.setDate(birth.getDate() - 1);
  }
  return birth;
}

// Edad cumplida a partir de una fecha de nacimiento.
export function ageOf(birth: Date, now: Date): number {
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) {
    age -= 1;
  }
  return age;
}

// Formato dd-mm-aaaa.
export function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

// Reglas de rango compartidas por generateByRange y el generador de CURP.
export function validateRange(min: number, max: number, count: number): void {
  if (!isInt(min) || !isInt(max) || !isInt(count)) {
    throw new ValidationError('errors.integers');
  }
  if (min < 0) {
    throw new ValidationError('errors.minNegative');
  }
  if (max < min) {
    throw new ValidationError('errors.maxLessThanMin');
  }
  if (count < 1) {
    throw new ValidationError('errors.countMin');
  }
}

// Req 1: N registros con edad aleatoria en [min, max].
export function generateByRange(
  min: number,
  max: number,
  count: number,
  now: Date,
): GeneratedRecord[] {
  validateRange(min, max, count);

  const records: GeneratedRecord[] = [];
  for (let i = 0; i < count; i++) {
    const age = min + Math.floor(Math.random() * (max - min + 1));
    const birth = randomBirthDate(age, now);
    records.push({ birthDate: formatDate(birth), age });
  }
  return records;
}

// Req 2: un registro por edad de la lista.
export function generateByAges(ages: number[], now: Date): GeneratedRecord[] {
  if (ages.length === 0) {
    throw new ValidationError('errors.agesEmpty');
  }
  for (const age of ages) {
    if (!isInt(age) || age < 0) {
      throw new ValidationError('errors.agesInvalid');
    }
  }
  return ages.map(age => ({ birthDate: formatDate(randomBirthDate(age, now)), age }));
}
