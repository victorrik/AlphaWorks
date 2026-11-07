# Implementation Plan: CURP Generator

## Overview

Plan incremental para la pantalla Generador de CURP. Primero la lógica pura de
CURP y de generación de personas con sus pruebas, luego el esquema v2 con
migración, modelo y repositorio, y al final la lista, la pantalla y la
navegación que cablean todo. Cada tarea referencia los requerimientos de
`requirements.md`; el detalle está en `design.md`.

## Tasks

- [x] 1. Lógica pura de CURP
  - [x] 1.1 Crear `src/services/curp.ts`
    - Tipos `Sexo`, `CurpInput`; constantes `STATE_CODES` (32, sin `NE`),
      `PARTICLES`, `SKIP_FIRST_NAMES`, `BAD_WORDS`, `DICT`.
    - `buildCurp`, `checkDigit`, `isValidCurp` según el algoritmo del diseño
      (normalizar con `Ñ`→`X` antes de NFD, quitar Partículas, regla
      JOSÉ/MARÍA, palabra inconveniente → 2º carácter `X`).
    - _Requirements: 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.10, 4.11_
  - [x]* 1.2 Escribir `src/services/curp.test.ts`
    - Ejemplos: `HEGG560427MVZRRL04` válida y construida desde Gloria
      Hernández García; `...05` inválida; `PEDO`→`PXDO`; JOSÉ/MARÍA (`José`,
      `María`, `Ma.`, nombre único `José`); `de la Cruz`; `Ñúñez`/`Muñoz`;
      apellido materno vacío.
    - **Property 4: El dígito verificador detecta alteraciones del carácter 18**
    - **Validates: Requirements 4.1, 4.2, 4.4, 4.5, 4.10, 4.11**

- [x] 2. Generación de personas
  - [x] 2.1 Instalar `@faker-js/faker@^9`
    - `npm i @faker-js/faker@^9` (build CJS compatible con Jest).
    - _Requirements: 2.1, 2.4_
  - [x] 2.2 Extraer `validateRange` en `src/services/age.ts`
    - Mover las validaciones de `generateByRange` a
      `export function validateRange(min, max, count)` con los mismos
      mensajes; `generateByRange` la llama. `age.test.ts` debe seguir pasando.
    - _Requirements: 1.4, 1.5, 1.6, 1.7_
  - [x] 2.3 Crear `src/services/person.ts`
    - `import { faker } from '@faker-js/faker/locale/es_MX'`.
    - Tipos `Rng`, `Person`; `generatePeople(min, max, count, now, rng = Math.random)`
      que llama `validateRange`, elige sexo, 1/2/3 nombres (0.80/0.15/0.05,
      primera palabra de cada `firstName`), apellidos, estado (0.80 `GR`, resto
      uniforme entre los otros 31), edad, `randomBirthDate`, Diferenciador por
      siglo y `buildCurp`.
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 4.8, 4.9_
  - [x]* 2.4 Property test en `src/services/person.test.ts`
    - **Property 1: Personas dentro del rango y fecha coherente**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  - [x]* 2.5 Property test en `src/services/person.test.ts`
    - **Property 2: Toda CURP generada es válida y consistente con la Persona**
    - **Validates: Requirements 2.3, 3.3, 4.3, 4.6, 4.7, 4.10, 4.11**
  - [x]* 2.6 Property test en `src/services/person.test.ts`
    - **Property 3: Diferenciador según siglo**
    - Usar rangos de edad que crucen el año 2000 con `now` fijo.
    - **Validates: Requirements 4.8, 4.9**
  - [x]* 2.7 Property test estadístico en `src/services/person.test.ts`
    - **Property 5: Distribuciones de estado y número de nombres** (5000
      muestras, cotas tolerantes del diseño)
    - **Validates: Requirements 2.2, 3.1, 3.2**
  - [x]* 2.8 Property test en `src/services/person.test.ts`
    - **Property 6: Entradas inválidas lanzan**
    - **Validates: Requirements 1.4, 1.5, 1.6, 1.7**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Persistencia
  - [x] 4.1 Esquema v2 y migración
    - En `src/db/schema.ts`: exportar `curpRecordsTable` (columnas del
      diseño, `curp` con `isIndexed: true`), agregarla a `tables` y subir a
      `version: 2`.
    - Crear `src/db/migrations.ts` con `schemaMigrations` +
      `createTable(curpRecordsTable)` para `toVersion: 2`.
    - _Requirements: 5.4, 5.5_
  - [x] 4.2 Modelo `CurpRecord` y registro en la base
    - Crear `src/db/models/CurpRecord.ts` (campos sin `!`, `@writer toggleUsed`).
    - En `src/db/index.ts`: pasar `migrations` a `SQLiteAdapter` y a
      `LokiJSAdapter`; agregar `CurpRecord` a `modelClasses`.
    - _Requirements: 5.3, 5.4, 5.5, 6.3_
  - [x] 4.3 Crear `src/db/curpRecordRepo.ts`
    - `observeAll` (desc por `created_at`), `addRecords(people)` con dedup por
      CURP dentro del lote y contra existentes (`Q.oneOf`), `toggleUsed`.
    - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.3_
  - [x]* 4.4 Escribir `src/db/curpRecordRepo.test.ts`
    - LokiJS en memoria: CURP repetida en el lote inserta una; repetir el lote
      inserta 0; `toggleUsed` alterna `used`.
    - _Requirements: 5.1, 5.2, 6.3_

- [x] 5. UI y navegación
  - [x] 5.1 Crear `src/components/CurpRecordList.tsx`
    - `FlatList` con fila `Checkbox` + nombre completo y CURP + estado + edad,
      estado vacío, atenuado/tachado cuando `used`. Exportar en
      `src/components/index.ts`.
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 5.2 Crear `src/screens/CurpGeneratorScreen.tsx`
    - Patrón de `RangeGeneratorScreen`: inputs mín/máx/cantidad, error inline,
      `generatePeople` + `addRecords`, `CurpRecordList` vía
      `withObservables` (import con nombre) sobre `observeAll()`.
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7, 5.1, 6.1_
  - [x] 5.3 Ruta y botón de inicio
    - `RootNavigator.tsx`: `CurpGenerator` en `RootStackParamList` y
      `Stack.Screen` con título "Generador de CURP".
    - `HomeScreen.tsx`: tercer `Button` "Generador de CURP".
    - _Requirements: 7.1, 7.2_

- [x] 6. Verificación final
  - [x] 6.1 Correr `npx tsc --noEmit`, `npx eslint src App.tsx` y `npm test`
    - Corregir los errores que aparezcan (incluido `__tests__/App.test.tsx`
      con el esquema v2 y faker).
    - _Requirements: 1.1, 4.11, 5.1, 7.1_

## Notes

- Las tareas con `*` son opcionales y se pueden saltar para un MVP más rápido.
- No hay librería de PBT instalada; las propiedades se escriben como bucles
  aleatorios en Jest (≥100 iteraciones, 5000 para la estadística).
- La migración v1→v2 y la persistencia tras reinicio solo se pueden comprobar
  en simulador (SQLite nativo); Jest usa LokiJS en memoria.
- Campos de modelos sin `!` e import con nombre de `withObservables` (ver
  restricciones en `design.md`).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "2.2", "4.1"] },
    { "id": 1, "tasks": ["1.2", "2.3", "4.2"] },
    { "id": 2, "tasks": ["2.4", "4.3", "5.1"] },
    { "id": 3, "tasks": ["2.5", "4.4", "5.2"] },
    { "id": 4, "tasks": ["2.6", "5.3"] },
    { "id": 5, "tasks": ["2.7"] },
    { "id": 6, "tasks": ["2.8"] },
    { "id": 7, "tasks": ["6.1"] }
  ]
}
```
