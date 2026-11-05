# Implementation Plan: Age Tools

## Overview

Plan incremental para las dos pantallas de herramientas de edad. Primero la
lógica pura con pruebas, luego el setup nativo y la persistencia con
WatermelonDB, después navegación, y al final las pantallas que cablean todo.
Cada tarea referencia los requerimientos de `requirements.md`.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1", "2.1", "5"] },
    { "wave": 2, "tasks": ["2.2", "6"] },
    { "wave": 3, "tasks": ["3"] },
    { "wave": 4, "tasks": ["4"] },
    { "wave": 5, "tasks": ["7", "8"] },
    { "wave": 6, "tasks": ["9"] }
  ],
  "dependencies": {
    "1": [],
    "2.1": [],
    "2.2": ["2.1"],
    "3": ["2.2"],
    "4": ["3"],
    "5": [],
    "6": ["5"],
    "7": ["1", "4", "6"],
    "8": ["1", "4", "6"],
    "9": ["7", "8"]
  }
}
```

## Tasks

- [x] 1. Portar la lógica de edad a un módulo puro con pruebas
  - Crear `src/services/age.ts` con `randomBirthDate`, `ageOf`, `formatDate`,
    `generateByRange`, `generateByAges` y el tipo `GeneratedRecord`, inyectando
    `now` como parámetro.
  - Incluir la validación que lanza `Error` para rango y para lista de edades.
  - Escribir `src/services/age.test.ts` (Jest) con `now` fijo: edad en rango,
    edad calculada == objetivo, fecha < now, una fila por edad, y que las
    entradas inválidas lanzan.
  - _Requerimientos: 1.1, 1.2, 1.3, 2.1, 2.2_

- [x] 2. Instalar y configurar WatermelonDB (setup nativo)
- [x] 2.1 Instalar deps y configurar Babel/tsconfig
  - `npm i @nozbe/watermelondb @nozbe/simdjson` y
    `npm i -D @babel/plugin-proposal-decorators`.
  - Agregar `['@babel/plugin-proposal-decorators', { legacy: true }]` a
    `babel.config.js`.
  - Activar `experimentalDecorators` y `allowSyntheticDefaultImports` en
    `tsconfig.json`.
  - _Requerimientos: 5.1, 5.3_
- [x] 2.2 Enlazar la librería nativa en iOS y Android
  - Podfile: añadir `pod 'simdjson', path: '../node_modules/@nozbe/simdjson', modular_headers: true`; correr `bundle exec pod install`.
  - Android: aplicar la config JSI recomendada (settings.gradle, build.gradle,
    MainApplication).
  - _Requerimientos: 5.1, 5.3_

- [x] 3. Definir esquema, modelo y base de datos
  - Crear `src/db/schema.ts` con la tabla `age_records`
    (`source`, `birth_date`, `age`, `used`, `created_at`).
  - Crear `src/db/models/AgeRecord.ts` (`@field/@text/@date`, `@writer toggleUsed`).
  - Crear `src/db/index.ts` con `SQLiteAdapter({ schema, jsi: true })` y la
    instancia única `database`.
  - _Requerimientos: 5.1, 5.2, 5.3_

- [x] 4. Implementar el repositorio
  - Crear `src/db/ageRecordRepo.ts` con `observeBySource`, `addRecords` (dedup
    por `birth_date`+`age` dentro del mismo `source`, `database.batch` en
    `write`) y `toggleUsed`.
  - _Requerimientos: 1.4, 1.5, 2.3, 2.4, 4.1, 4.3, 5.2_

- [x] 5. Instalar y montar la navegación
  - `npm i @react-navigation/native @react-navigation/native-stack react-native-screens`;
    `bundle exec pod install`.
  - Reescribir `src/navigation/RootNavigator.tsx` como `NativeStack` dentro de
    `NavigationContainer` con rutas `Home`, `RangeGenerator`, `AgeCalculator`.
  - Agregar en `HomeScreen` dos `Button` que naveguen a cada herramienta.
  - _Requerimientos: 6.1, 6.2_

- [x] 6. Lista reutilizable de registros
  - Crear `src/components/RecordList.tsx` (`FlatList`) con fila
    `Checkbox` + fecha + edad, estado vacío, y estilo atenuado/tachado cuando
    `used` es true. Conectar el checkbox a `onToggleUsed`.
  - _Requerimientos: 3.1, 3.2, 3.3, 4.1, 4.2_

- [x] 7. Pantalla generador por rango
  - Crear `src/screens/RangeGeneratorScreen.tsx` con inputs numéricos
    min/max/count, botón Generar, manejo de error inline, llamada a
    `generateByRange` + `repo.addRecords('range', ...)`, y `RecordList`
    alimentada por `observeBySource('range')` vía `withObservables`.
  - _Requerimientos: 1.1, 1.3, 1.4, 1.5, 3.1, 4.1_

- [x] 8. Pantalla calculador por lista de edades
  - Crear `src/screens/AgeCalculatorScreen.tsx` con input de edades separadas
    por coma, botón Generar, manejo de error inline, llamada a `generateByAges`
    + `repo.addRecords('calculator', ...)`, y `RecordList` por
    `observeBySource('calculator')`.
  - _Requerimientos: 2.1, 2.2, 2.3, 2.4, 3.1, 4.1_

- [x] 9. Verificación final
  - Correr `npx tsc --noEmit`, `npx eslint src App.tsx` y `npm test`.
  - Verificación manual en simulador: generar, deduplicar, marcar usado y
    reiniciar la app comprobando que el historial y los flags persisten.
  - _Requerimientos: 1.1, 2.1, 3.1, 4.1, 5.1_

## Notes

- El setup nativo de WatermelonDB (tarea 2) requiere `pod install` y, en
  Android, config manual de JSI; no se puede verificar solo con type-check.
- La capa pura (tarea 1) es la única lógica no trivial del spec y lleva su
  propio test; el resto se valida en simulador.
- La dedup vive en el repositorio (tarea 4) porque WatermelonDB no impone
  unicidad a nivel de esquema.
