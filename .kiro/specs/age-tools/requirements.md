# Requirements — Age Tools

## Introducción

Dos pantallas que replican la lógica del proyecto `ageGenerator` dentro de la app
React Native AlphaWorks, usando los componentes base estilo Ant Design ya
creados. Cada pantalla genera datos de edad/fecha de nacimiento, los muestra en
una lista (equivalente al `console.table` original) y persiste localmente un
historial por generador. El usuario puede marcar cada registro como "usado"
mediante un checkbox; ese flag es solo informativo para control externo y, al
generar nuevos registros, se evita duplicar entradas ya existentes en el
historial de esa pantalla.

Una tercera pantalla (generador por rango con nombres y derivación estilo CURP)
queda fuera de alcance de este spec y se documenta como trabajo futuro.

## Glosario

- **Registro**: una fila con `{ fechaNacimiento, edad }` (y, a futuro, nombre).
- **Usado**: flag booleano por registro, marcado manualmente por el usuario.
  Solo informativo; no dispara ninguna lógica más allá de persistirse.
- **Historial**: colección persistida de registros de una pantalla. Cada
  pantalla tiene su propio historial independiente.

## Requerimientos

### Requerimiento 1 — Generar edades por rango

**Historia de usuario:** Como usuario, quiero generar una cantidad configurable
de registros con edades aleatorias dentro de un rango, para obtener fechas de
nacimiento de prueba.

#### Criterios de aceptación

1. CUANDO el usuario introduce edad mínima, edad máxima y cantidad, y pulsa
   generar, ENTONCES el sistema DEBERÁ producir esa cantidad de registros, cada
   uno con una edad entera aleatoria en el rango inclusivo [mínima, máxima] y una
   fecha de nacimiento aleatoria coherente con esa edad.
2. CUANDO se genera una fecha de nacimiento para una edad, ENTONCES el sistema
   DEBERÁ garantizar que la fecha es anterior a la fecha actual y que la edad
   calculada a partir de ella es exactamente la edad objetivo.
3. CUANDO la edad mínima es mayor que la máxima, o algún valor no es entero >= 0,
   o la cantidad no es un entero >= 1, ENTONCES el sistema DEBERÁ rechazar la
   generación y mostrar un mensaje de error indicando la restricción.
4. CUANDO se generan registros nuevos, ENTONCES el sistema DEBERÁ descartar los
   que dupliquen (misma fecha de nacimiento y misma edad) a registros ya
   presentes en el historial de esta pantalla.
5. CUANDO la generación termina, ENTONCES el sistema DEBERÁ agregar los registros
   nuevos (no duplicados) al historial persistido de esta pantalla.

### Requerimiento 2 — Calcular fechas por lista de edades

**Historia de usuario:** Como usuario, quiero introducir una lista de edades y
obtener para cada una una fecha de nacimiento con mes y día aleatorios, para
generar fechas puntuales.

#### Criterios de aceptación

1. CUANDO el usuario introduce una lista de edades separadas por coma y pulsa
   generar, ENTONCES el sistema DEBERÁ producir un registro por cada edad, con
   una fecha de nacimiento aleatoria (mes y día aleatorios) coherente con esa
   edad.
2. CUANDO la lista está vacía o contiene algún valor que no sea entero >= 0,
   ENTONCES el sistema DEBERÁ rechazar la generación y mostrar un mensaje de
   error indicando la restricción.
3. CUANDO se generan registros nuevos, ENTONCES el sistema DEBERÁ descartar los
   que dupliquen (misma fecha de nacimiento y misma edad) a registros ya
   presentes en el historial de esta pantalla.
4. CUANDO la generación termina, ENTONCES el sistema DEBERÁ agregar los registros
   nuevos (no duplicados) al historial persistido de esta pantalla.

### Requerimiento 3 — Mostrar resultados en lista

**Historia de usuario:** Como usuario, quiero ver los registros generados en una
lista con la misma información que la tabla del proyecto original, para
revisarlos.

#### Criterios de aceptación

1. CUANDO existen registros en el historial de una pantalla, ENTONCES el sistema
   DEBERÁ mostrarlos en una lista donde cada fila expone la fecha de nacimiento
   (formato dd-mm-aaaa) y la edad.
2. CUANDO el historial está vacío, ENTONCES el sistema DEBERÁ mostrar un estado
   vacío indicándolo.
3. CUANDO la lista contiene muchos registros, ENTONCES el sistema DEBERÁ
   renderizarla de forma desplazable y con buen rendimiento.

### Requerimiento 4 — Marcar registros como usados

**Historia de usuario:** Como usuario, quiero marcar un registro como usado con
un checkbox, para llevar control de cuáles ya ocupé externamente.

#### Criterios de aceptación

1. CUANDO el usuario pulsa el checkbox de una fila, ENTONCES el sistema DEBERÁ
   alternar el flag "usado" de ese registro y persistir el cambio.
2. CUANDO un registro está marcado como usado, ENTONCES el sistema DEBERÁ
   reflejarlo visualmente en su fila.
3. El flag "usado" NO DEBERÁ excluir al registro de la lista ni afectar la
   deduplicación al generar nuevos registros.

### Requerimiento 5 — Persistencia por generador

**Historia de usuario:** Como usuario, quiero que mis registros y sus marcas
persistan entre sesiones, para no perder el historial al cerrar la app.

#### Criterios de aceptación

1. CUANDO la app se reinicia, ENTONCES el sistema DEBERÁ restaurar el historial
   de cada pantalla tal como quedó, incluyendo los flags "usado".
2. CADA pantalla DEBERÁ mantener un historial independiente del de la otra.
3. CUANDO el usuario genera registros o alterna un flag, ENTONCES el cambio
   DEBERÁ persistirse de forma que sobreviva al cierre de la app.

### Requerimiento 6 — Navegación

**Historia de usuario:** Como usuario, quiero navegar entre la pantalla de inicio
y las dos herramientas, para acceder a cada una.

#### Criterios de aceptación

1. CUANDO la app arranca, ENTONCES el sistema DEBERÁ ofrecer navegación hacia la
   pantalla de generador por rango y hacia la de cálculo por lista de edades.
2. La navegación DEBERÁ permitir volver a la pantalla anterior.

## Fuera de alcance (futuro)

- Pantalla 3: generador por rango con nombres (vía `@faker-js/faker`) y
  derivación de los primeros caracteres estilo CURP a partir de la fecha.
- Exportar o copiar los resultados.
