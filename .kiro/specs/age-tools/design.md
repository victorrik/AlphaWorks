# Design — Age Tools

## Visión general

Dos pantallas (`RangeGeneratorScreen`, `AgeCalculatorScreen`) sobre una capa de
lógica pura reutilizada del proyecto `ageGenerator`, con persistencia local vía
WatermelonDB (SQLite reactivo) y navegación con React Navigation (native stack).
Cada pantalla tiene su propio historial de registros; el usuario marca cada
registro como "usado" con un `Checkbox`. La UI se arma con los componentes base
estilo Ant Design ya existentes.

```
App
└─ NavigationContainer (native-stack)
   ├─ Home            → enlaces a las dos herramientas
   ├─ RangeGenerator  → inputs min/max/count → lista persistida
   └─ AgeCalculator   → input lista de edades → lista persistida
```

## Capa de lógica pura — `src/services/age.ts`

Portada 1:1 desde `ageGenerator`, en TypeScript, sin I/O (testeable y
compartida por ambas pantallas).

```ts
// Fecha de nacimiento aleatoria para una edad entera dada, siempre < now.
export function randomBirthDate(age: number, now: Date): Date;

// Edad cumplida a partir de una fecha de nacimiento.
export function ageOf(birth: Date, now: Date): number;

// Formato dd-mm-aaaa.
export function formatDate(d: Date): string;

// Req 1: N registros con edad aleatoria en [min, max].
export function generateByRange(
  min: number, max: number, count: number, now: Date,
): GeneratedRecord[];

// Req 2: un registro por edad de la lista.
export function generateByAges(ages: number[], now: Date): GeneratedRecord[];

export type GeneratedRecord = { birthDate: string; age: number };
```

`now` se inyecta como parámetro (no `new Date()` interno) para que los tests
sean deterministas. Las funciones `randomBirthDate`/`ageOf` conservan la lógica
original: el extremo joven del rango queda estrictamente antes de hoy y la edad
calculada coincide con la objetivo.

Validación (lanzan `Error` con mensaje que la pantalla muestra):
- `generateByRange`: `min`, `max`, `count` enteros; `min >= 0`; `max >= min`;
  `count >= 1`.
- `generateByAges`: lista no vacía; cada elemento entero `>= 0`.

## Persistencia — WatermelonDB

### Por qué WatermelonDB
Reactivo (las listas se actualizan solas al observar queries), escala a miles de
registros sobre SQLite, y es una buena base de aprendizaje de modelos/esquema/
migraciones. Se descartó Realm por su deprecación (fin del Atlas Device SDK).

### Esquema — `src/db/schema.ts`
Una sola tabla `age_records`; el historial "por pantalla" se separa con una
columna `source` en lugar de dos tablas (más simple, misma garantía).

```
table age_records
  source      string   // 'range' | 'calculator'
  birth_date  string   // dd-mm-aaaa
  age         number
  used        boolean
  created_at  number
```

Índice lógico de deduplicación: `(source, birth_date, age)`. WatermelonDB no
impone unicidad en el esquema, así que la dedup se hace en la capa de
repositorio antes de insertar (Req 1.4 / 2.3).

### Modelo — `src/db/models/AgeRecord.ts`
Clase `AgeRecord extends Model` con `@field`/`@text`/`@date` y `@writer` para
`toggleUsed()`. `static table = 'age_records'`.

### Repositorio — `src/db/ageRecordRepo.ts`
Aísla WatermelonDB de las pantallas (si algún día migramos, solo cambia aquí):

```ts
observeBySource(source: Source): Observable<AgeRecord[]>; // orden desc por created_at
addRecords(source: Source, records: GeneratedRecord[]): Promise<number>; // dedup, devuelve insertados
toggleUsed(record: AgeRecord): Promise<void>;
```

`addRecords` carga las claves existentes de ese `source`, filtra duplicados
(`birth_date`+`age`) y hace un `database.batch(...)` de los nuevos. Todo dentro
de `database.write(...)`.

### Setup de base de datos — `src/db/index.ts`
`SQLiteAdapter({ schema, jsi: true })` + `new Database({ adapter, modelClasses })`.
Exporta la instancia única `database`.

### Setup nativo requerido (fuera de código)
- **Babel**: agregar `['@babel/plugin-proposal-decorators', { legacy: true }]`
  en `babel.config.js` y la dev-dep `@babel/plugin-proposal-decorators`.
  WatermelonDB usa decoradores legacy en los modelos.
- **iOS**: `pod 'simdjson', path: '../node_modules/@nozbe/simdjson', modular_headers: true`
  en el Podfile, luego `bundle exec pod install`.
- **Android**: autolinking cubre el módulo; JSI recomendado (config en
  `settings.gradle`/`build.gradle`/`MainApplication`). Documentado en tasks.
- **tsconfig**: `experimentalDecorators` + `allowSyntheticDefaultImports`.

## Navegación — `src/navigation/RootNavigator.tsx`

Se reemplaza el render directo actual por un `createNativeStackNavigator` dentro
de `NavigationContainer`. Pantallas: `Home`, `RangeGenerator`, `AgeCalculator`.
`NavigationContainer` se monta aquí; el `PortalProvider` y `SafeAreaProvider` ya
están en `App.tsx` y envuelven todo.

Dependencias nuevas: `@react-navigation/native`,
`@react-navigation/native-stack`, `react-native-screens`.
(`react-native-safe-area-context` ya está instalada.)

## Pantallas

### Componente compartido — `RecordList`
Lista desplazable (`FlatList`) que recibe `records: AgeRecord[]` y
`onToggleUsed`. Cada fila: `Checkbox` (usado) + fecha de nacimiento + edad,
usando `Text` del sistema de tipografía. Estado vacío con `Text type="secondary"`
(Req 3.2). Fila marcada "usado" se atenúa / tacha (Req 4.2).

### `RangeGeneratorScreen`
Inputs: `Input` para mín, máx y cantidad (teclado numérico). `Button` primary
"Generar". Al pulsar: parsea, valida (muestra error inline si falla),
`generateByRange(...)`, `repo.addRecords('range', ...)`. La lista se alimenta de
`repo.observeBySource('range')` vía `withObservables`, así se re-renderiza sola
al insertar o alternar "usado".

### `AgeCalculatorScreen`
Input: `Input` de texto "edades separadas por coma". `Button` "Generar". Parsea
por coma, valida, `generateByAges(...)`, `repo.addRecords('calculator', ...)`.
Lista desde `repo.observeBySource('calculator')`.

### `HomeScreen`
Se mantiene como showcase y se le agregan dos `Button` que navegan a cada
herramienta (Req 6).

## Manejo de errores
- Validación de entrada: la capa pura lanza `Error`; la pantalla captura y
  muestra el mensaje bajo los inputs (no crashea).
- Escrituras a DB: `addRecords`/`toggleUsed` devuelven promesas; los errores se
  registran y se muestra un aviso simple. La dedup evita inserciones repetidas.

## Estrategia de pruebas
- **Unitarias (Jest, ya configurado)** sobre `src/services/age.ts` con `now`
  fijo: rango respeta [min,max], edad calculada == objetivo, fecha < now,
  validaciones lanzan, `generateByAges` produce una fila por edad. Es la lógica
  no trivial del spec y lleva su propio test.
- La capa de repositorio/DB no se testea aquí (requiere entorno nativo); se
  valida manualmente en simulador.
```
