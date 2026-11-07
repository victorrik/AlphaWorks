# Design Document

## Overview

Nueva pantalla `CurpGeneratorScreen` que replica el flujo de
`RangeGeneratorScreen` (mín/máx/cantidad → Generar → lista persistida) pero
genera Personas completas con CURP. La lógica se divide en dos módulos puros
(`src/services/curp.ts` y `src/services/person.ts`), persistencia en una tabla
nueva `curp_records` de WatermelonDB (esquema v1 → v2 con migración) y una
lista nueva `CurpRecordList` para no tocar `RecordList`.

```
App
└─ NavigationContainer (native-stack)
   ├─ Home            → + botón "Generador de CURP"
   ├─ RangeGenerator  (sin cambios)
   ├─ AgeCalculator   (sin cambios)
   └─ CurpGenerator   → inputs min/max/count → lista persistida de CURP
```

## Architecture

```
CurpGeneratorScreen ──► generatePeople (person.ts) ──► randomBirthDate/formatDate (age.ts)
        │                       │                 └──► buildCurp (curp.ts)
        │                       └──► faker es_MX (nombres/apellidos)
        ├──► curpRecordRepo.addRecords ──► database (curp_records)
        └──► withObservables(observeAll) ──► CurpRecordList
```

- `curp.ts` no conoce faker ni aleatoriedad: recibe datos y el Diferenciador
  ya elegido, y devuelve la CURP. Totalmente determinista.
- `person.ts` concentra la aleatoriedad (sexo, número de nombres, estado,
  edad, Diferenciador) con una fuente `rng` inyectable (`() => number`,
  default `Math.random`). La fecha de nacimiento sigue usando
  `randomBirthDate(age, now)` tal cual (usa `Math.random` interno; no se
  cambia su firma).
- La validación de mín/máx/cantidad se extrae de `generateByRange` a
  `validateRange(min, max, count)` exportada en `age.ts`, y la usan ambos
  generadores (mismos mensajes de error, sin duplicar reglas).

## Components and Interfaces

### `src/services/age.ts` (cambio mínimo)

```ts
// Lanza Error con el mismo mensaje que hoy usa generateByRange.
export function validateRange(min: number, max: number, count: number): void;
```

`generateByRange` pasa a llamar `validateRange` en lugar de sus `if` inline.
Su comportamiento y sus tests existentes no cambian.

### `src/services/curp.ts`

```ts
export type Sexo = 'H' | 'M';

export type CurpInput = {
  nombres: string[];        // 1..3 nombres de pila, sin normalizar
  apellidoPaterno: string;
  apellidoMaterno: string;  // '' => 'X'
  birth: Date;
  sexo: Sexo;
  estado: string;           // Clave_Estado, p. ej. 'GR'
  diferenciador: string;    // 1 carácter: dígito (<2000) o letra (>=2000)
};

// 32 entidades → clave CURP. Sin 'NE'.
export const STATE_CODES: readonly string[];

export function buildCurp(p: CurpInput): string;      // 18 caracteres
export function checkDigit(first17: string): string;  // '0'..'9'
export function isValidCurp(curp: string): boolean;
```

Constantes:

```ts
export const STATE_CODES = [
  'AS', 'BC', 'BS', 'CC', 'CL', 'CM', 'CS', 'CH', 'DF', 'DG', 'GT', 'GR',
  'HG', 'JC', 'MC', 'MN', 'MS', 'NT', 'NL', 'OC', 'PL', 'QT', 'QR', 'SP',
  'SL', 'SR', 'TC', 'TS', 'TL', 'VZ', 'YN', 'ZS',
] as const;

const PARTICLES = new Set([
  'DA', 'DAS', 'DE', 'DEL', 'DER', 'DI', 'DIE', 'DD', 'EL', 'LA', 'LOS',
  'LAS', 'LE', 'LES', 'MAC', 'MC', 'VAN', 'VON', 'Y',
]);

const SKIP_FIRST_NAMES = new Set(['JOSE', 'J', 'MARIA', 'MA', 'M']);

// Lista oficial RENAPO de palabras inconvenientes.
const BAD_WORDS = new Set([
  'BACA', 'BAKA', 'BUEI', 'BUEY', 'CACA', 'CACO', 'CAGA', 'CAGO', 'CAKA',
  'CAKO', 'COGE', 'COGI', 'COJA', 'COJE', 'COJI', 'COJO', 'COLA', 'CULO',
  'FALO', 'FETO', 'GETA', 'GUEI', 'GUEY', 'JETA', 'JOTO', 'KACA', 'KACO',
  'KAGA', 'KAGO', 'KAKA', 'KAKO', 'KOGE', 'KOGI', 'KOJA', 'KOJE', 'KOJI',
  'KOJO', 'KOLA', 'KULO', 'LILO', 'LOCA', 'LOCO', 'LOKA', 'LOKO', 'MAME',
  'MAMO', 'MEAR', 'MEAS', 'MEON', 'MIAR', 'MION', 'MOCO', 'MOKO', 'MULA',
  'MULO', 'NACA', 'NACO', 'PEDA', 'PEDO', 'PENE', 'PIPI', 'PITO', 'POPO',
  'PUTA', 'PUTO', 'QULO', 'RATA', 'ROBA', 'ROBE', 'ROBO', 'RUIN', 'SENO',
  'TETA', 'VACA', 'VAGA', 'VAGO', 'VAKA', 'VUEI', 'VUEY', 'WUEI', 'WUEY',
]);

const DICT = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'; // valor = índice (0..36)
```

Algoritmo de `buildCurp`:

1. **Normalizar** cada cadena: `toUpperCase()` → `Ñ`→`X` → `normalize('NFD')`
   y quitar marcas diacríticas (`/[\u0300-\u036f]/g`) → quitar todo lo que no
   sea `A-Z` o espacio → colapsar espacios. El orden importa: `Ñ` debe
   reemplazarse **antes** de NFD, porque NFD la descompone en `N` + tilde y
   terminaría como `N`.
2. **Quitar Partículas** iniciales: separar por espacios y, mientras quede más
   de una palabra y la primera esté en `PARTICLES`, descartarla. Se usa la
   primera palabra restante (`'de la Cruz'` → `CRUZ`).
3. **Nombre seleccionado**: normalizar cada nombre de pila; si hay más de uno y
   el primero está en `SKIP_FIRST_NAMES`, usar el segundo; si no, el primero.
   (`'Ma.'` normaliza a `MA`, `'J.'` a `J`.)
4. Caracteres 1–4: `pat[0]`, primera vocal (`AEIOU`) de `pat.slice(1)` o `X`,
   `mat[0]` o `X`, `nom[0]`. Si el resultado está en `BAD_WORDS`, el carácter
   2 pasa a `X`.
5. Caracteres 5–10: `AAMMDD` de `birth` (año `% 100`, con ceros a la
   izquierda). 11: `sexo`. 12–13: `estado`.
6. Caracteres 14–16: primera consonante (letra no vocal) de `pat.slice(1)`,
   `mat.slice(1)`, `nom.slice(1)`; `X` donde no haya.
7. Carácter 17: `diferenciador`. Carácter 18: `checkDigit(primeros17)`.

`checkDigit`: `suma = Σ DICT.indexOf(c[i]) * (18 - i)` para `i = 0..16`;
resultado `String((10 - suma % 10) % 10)`.

`isValidCurp`: regex de estructura + dígito verificador.

```ts
const CURP_RE =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]\d$/;

export function isValidCurp(curp: string): boolean {
  return CURP_RE.test(curp) && checkDigit(curp.slice(0, 17)) === curp[17];
}
```

`isValidCurp` acepta `NE` porque valida CURP en general; el generador nunca lo
produce.

Ejemplo verificado (CURP de formato real):
`{ nombres: ['Gloria'], apellidoPaterno: 'Hernández', apellidoMaterno: 'García', birth: 1956-04-27, sexo: 'M', estado: 'VZ', diferenciador: '0' }`
→ `HEGG560427MVZRRL04` (dígito verificador `4`).

### `src/services/person.ts`

```ts
import { faker } from '@faker-js/faker/locale/es_MX'; // solo el locale es_MX

export type Rng = () => number;

export type Person = {
  nombres: string;          // nombres de pila unidos por espacio
  apellidoPaterno: string;
  apellidoMaterno: string;
  sexo: Sexo;
  birthDate: string;        // dd-mm-aaaa
  age: number;
  stateCode: string;
  curp: string;
};

export function generatePeople(
  min: number, max: number, count: number, now: Date, rng: Rng = Math.random,
): Person[];
```

Por Persona:
- `sexo = rng() < 0.5 ? 'H' : 'M'`.
- Número de nombres: `r = rng()`; `r < 0.80` → 1, `r < 0.95` → 2, si no 3.
  Cada nombre: `faker.person.firstName(sexo === 'H' ? 'male' : 'female')`,
  tomando solo la primera palabra (algunos nombres del locale son compuestos,
  y así el conteo de nombres es exacto). Todos con el mismo sexo, por lo que
  nombre y Sexo coinciden.
- Apellidos: `faker.person.lastName()` dos veces.
- Estado: `rng() < 0.80` → `'GR'`; si no, `OTHER_STATES[Math.floor(rng() * 31)]`
  donde `OTHER_STATES = STATE_CODES.filter(c => c !== 'GR')`. Independiente
  por Persona; un lote puede no tener ningún otro estado.
- Edad: `min + Math.floor(rng() * (max - min + 1))`; fecha:
  `randomBirthDate(age, now)`.
- Diferenciador: año `< 2000` → `String(Math.floor(rng() * 10))`; si no,
  `String.fromCharCode(65 + Math.floor(rng() * 26))`.
- `curp = buildCurp({...})`, `birthDate = formatDate(birth)`.

Antes de generar llama `validateRange(min, max, count)`.

### Persistencia — `src/db`

**`schema.ts`**: `version: 2`, se agrega `tableSchema(curpRecordsTable)`.

**`migrations.ts`** (nuevo):

```ts
import { createTable, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';
import { curpRecordsTable } from './schema';

export const migrations = schemaMigrations({
  migrations: [{ toVersion: 2, steps: [createTable(curpRecordsTable)] }],
});
```

`curpRecordsTable` (`{ name, columns }`) se exporta desde `schema.ts` para que
esquema y migración compartan la misma definición de columnas.

**`index.ts`**: pasar `migrations` tanto a `new SQLiteAdapter({ schema, migrations, jsi: true })`
como al `LokiJSAdapter` de Jest. Agregar `CurpRecord` a `modelClasses`. En
Jest la base en memoria arranca vacía directamente en v2; pasar las
migraciones igual valida que el objeto de migraciones es aceptado por el
adaptador. En dispositivo, una instalación con v1 ejecuta `createTable` y
conserva `age_records` (Req 5.5).

**`models/CurpRecord.ts`** (nuevo), con el mismo patrón que `AgeRecord`:

```ts
export class CurpRecord extends Model {
  static table = 'curp_records';

  @text('nombres') nombres: string;
  @text('apellido_paterno') apellidoPaterno: string;
  @text('apellido_materno') apellidoMaterno: string;
  @text('sexo') sexo: string;
  @text('birth_date') birthDate: string;
  @field('age') age: number;
  @text('state_code') stateCode: string;
  @text('curp') curp: string;
  @field('used') used: boolean;
  @date('created_at') createdAt: Date;

  @writer async toggleUsed() {
    await this.update(r => { r.used = !r.used; });
  }
}
```

**`curpRecordRepo.ts`** (nuevo):

```ts
export function observeAll(): Observable<CurpRecord[]>; // sortBy created_at desc
export function addRecords(people: Person[]): Promise<number>; // insertados
export function toggleUsed(record: CurpRecord): Promise<void>;
```

`addRecords`: dedup dentro del lote con un `Set` de CURP (se queda la
primera), luego `Q.where('curp', Q.oneOf(curps))` para descartar las ya
existentes, y `database.write(() => database.batch(...prepareCreate))` con
`used = false`, `createdAt = new Date()`. Devuelve 0 sin escribir si no queda
nada.

### UI

**`src/components/CurpRecordList.tsx`** (nuevo, exportado en
`components/index.ts`): misma estructura que `RecordList` (`FlatList`, estado
vacío "Sin registros todavía", fila atenuada `opacity: 0.5` y `Text delete`
cuando `used`). Fila: `Checkbox` + columna con nombre completo
(`nombres apellidoPaterno apellidoMaterno`) y CURP debajo + `stateCode` +
`age`. Se eligió un componente nuevo en lugar de generalizar `RecordList`
porque está tipado a `AgeRecord` y generalizarlo obliga a tocar las dos
pantallas existentes.

**`src/screens/CurpGeneratorScreen.tsx`** (nuevo): copia del patrón de
`RangeGeneratorScreen` — tres `Input` numéricos, error inline con
`Text type="danger"`, `Button` "Generar" que llama
`generatePeople(Number(min), Number(max), Number(count), new Date())` y
`addRecords(...)`. Export:

```ts
import { withObservables } from '@nozbe/watermelondb/react';

export const CurpGeneratorScreen = withObservables([], () => ({
  records: observeAll(),
}))(CurpGeneratorView);
```

**`RootNavigator.tsx`**: `CurpGenerator: undefined` en `RootStackParamList` y
`<Stack.Screen name="CurpGenerator" ... options={{ title: 'Generador de CURP' }} />`.

**`HomeScreen.tsx`**: tercer `Button type="primary" block` "Generador de CURP"
→ `navigation.navigate('CurpGenerator')`.

### Dependencia nueva

`npm i @faker-js/faker@^9`. Se importa solo
`@faker-js/faker/locale/es_MX` para no empaquetar los demás locales (Metro no
hace tree-shaking del entry principal). La v9 trae build CJS, compatible con
Jest sin tocar `transformIgnorePatterns`; la v10 es solo ESM y requeriría
configurar Jest, por eso se fija `^9`.

### Restricciones del proyecto (aprendidas)

- Los campos de modelos WatermelonDB se declaran **sin `!`**
  (`@text('curp') curp: string;`). `tsconfig` ya tiene
  `strictPropertyInitialization: false`; usar `!` rompe la transformación del
  preset de Babel de RN.
- `withObservables` se importa con nombre desde `@nozbe/watermelondb/react`
  (`import { withObservables } from '@nozbe/watermelondb/react'`).
- Jest renderiza el árbol completo de la app (`__tests__/App.test.tsx`) contra
  LokiJS en memoria: el esquema v2, las migraciones y el import de faker deben
  funcionar ahí.

## Data Models

```
table curp_records            (nueva, esquema v2)
  nombres           string    // "Juan Carlos"
  apellido_paterno  string
  apellido_materno  string
  sexo              string    // 'H' | 'M'
  birth_date        string    // dd-mm-aaaa
  age               number
  state_code        string    // 'GR', 'DF', ...
  curp              string    // isIndexed: true (lookup de dedup)
  used              boolean
  created_at        number

table age_records             (sin cambios)
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all
valid executions of a system-essentially, a formal statement about what the
system should do. Properties serve as the bridge between human-readable
specifications and machine-verifiable correctness guarantees.*

### Property 1: Personas dentro del rango y fecha coherente

Para cualquier `min`, `max`, `count` válidos (`0 <= min <= max`, `count >= 1`)
y cualquier `now`, `generatePeople` devuelve exactamente `count` Personas y
cada una tiene `min <= age <= max`, fecha de nacimiento anterior a `now` y
`ageOf(fecha, now) === age`.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Toda CURP generada es válida y consistente con la Persona

Para cualquier Persona generada, `isValidCurp(curp)` es verdadero, los
caracteres 5–10 son el AAMMDD de su fecha, el 11 es su `sexo`, los 12–13 son
su `stateCode` y `stateCode` pertenece a `STATE_CODES` (sin `NE`).

**Validates: Requirements 2.3, 3.3, 4.3, 4.6, 4.7, 4.10, 4.11**

### Property 3: Diferenciador según siglo

Para cualquier Persona generada, el carácter 17 de la CURP es un dígito si su
año de nacimiento es menor a 2000 y una letra A–Z si es 2000 o mayor.

**Validates: Requirements 4.8, 4.9**

### Property 4: El dígito verificador detecta alteraciones del carácter 18

Para cualquier prefijo de 17 caracteres válido, `isValidCurp(p + checkDigit(p))`
es verdadero y `isValidCurp(p + d)` es falso para todo dígito
`d !== checkDigit(p)`.

**Validates: Requirements 4.10, 4.11**

### Property 5: Distribuciones de estado y número de nombres

Para una muestra de 5000 Personas, la proporción con `stateCode === 'GR'` está
en [0.77, 0.83], y las proporciones con 1, 2 y 3 nombres están en
[0.77, 0.83], [0.12, 0.18] y [0.03, 0.07] respectivamente.

**Validates: Requirements 2.2, 3.1, 3.2**

### Property 6: Entradas inválidas lanzan

Para cualquier entrada con un valor no entero, `min < 0`, `max < min` o
`count < 1`, `generatePeople` lanza `Error`.

**Validates: Requirements 1.4, 1.5, 1.6, 1.7**

## Error Handling

- Validación: `validateRange` lanza `Error`; la pantalla lo captura y muestra
  el mensaje bajo los inputs (mismo patrón que `RangeGeneratorScreen`).
- Escritura a DB: errores de `addRecords` se capturan en el mismo `try` y se
  muestran como mensaje inline; no se pierde lo ya guardado.
- CURP duplicadas: se descartan en el repositorio, no son error.

## Testing Strategy

No hay librería de PBT instalada y no se agrega una: las propiedades se
implementan en Jest como bucles sobre entradas aleatorias (≥100 iteraciones)
con `now` fijo. Cada test se etiqueta
`Feature: curp-generator, Property N: <título>`.

- `src/services/curp.test.ts` (ejemplos):
  - `HEGG560427MVZRRL04` es válida; `HEGG560427MVZRRL05` no; el caso de
    Gloria Hernández García construye exactamente esa CURP.
  - Palabra inconveniente: Pérez / Domínguez / Óscar → `PEDO` → `PXDO`.
  - JOSÉ/MARÍA: `['José', 'Luis']` usa `L`; `['María', 'Fernanda']` y
    `['Ma.', 'Fernanda']` usan `F`; `['José']` solo usa `J`.
  - Partículas: apellido paterno `'de la Cruz'` → caracteres 1–2 `CU`.
  - Ñ→X: `'Ñúñez'` → carácter 1 `X`; `'Muñoz'` → consonante interna `X`.
  - Apellido materno vacío → carácter 3 y 15 `X`.
  - Property 4.
- `src/services/person.test.ts`: Properties 1, 2, 3, 5 y 6.
- `src/db/curpRecordRepo.test.ts` (LokiJS en memoria): un lote con una CURP
  repetida inserta solo una; repetir `addRecords` con las mismas CURP inserta
  0; `toggleUsed` alterna `used`.
- `__tests__/App.test.tsx` existente valida que el árbol (navegación, faker,
  esquema v2) renderiza.
- Migración v1→v2 y persistencia tras reinicio: verificación manual en
  simulador (requiere SQLite nativo).
