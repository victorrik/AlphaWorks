# Requirements Document

## Introduction

Tercera herramienta de AlphaWorks: una pantalla que genera personas ficticias
mexicanas (nombre, apellidos, sexo, fecha de nacimiento, estado de nacimiento)
dentro de un rango de edades y construye para cada una su CURP de 18
caracteres con el algoritmo oficial de RENAPO, incluido el dígito verificador.
Los registros se muestran en una lista, se persisten localmente en un
historial propio y el usuario puede marcar cada uno como "usado", igual que en
las pantallas de `age-tools`. Al generar, se descartan los registros cuya CURP
ya existe en el historial.

## Glossary

- **Generador_CURP**: la pantalla `CurpGeneratorScreen` junto con su lógica de
  generación y persistencia.
- **Persona**: datos ficticios generados: nombres (1 a 3 nombres de pila),
  apellido paterno, apellido materno, sexo, fecha de nacimiento, edad y clave
  de estado.
- **Sexo**: `H` (hombre) o `M` (mujer), coherente con el sexo de los nombres
  generados.
- **Clave_Estado**: código oficial de 2 letras de la entidad federativa de
  nacimiento usado en la CURP (`AS`, `BC`, …, `ZS`; Ciudad de México = `DF`).
  `NE` (nacido en el extranjero) no se genera.
- **CURP**: Clave Única de Registro de Población de 18 caracteres construida
  con el algoritmo oficial de RENAPO.
- **Partícula**: palabra inicial de un nombre o apellido compuesto que se
  omite al construir la CURP: DA, DAS, DE, DEL, DER, DI, DIE, DD, EL, LA, LOS,
  LAS, LE, LES, MAC, MC, VAN, VON, Y.
- **Palabra_Inconveniente**: cualquiera de las palabras de 4 letras de la lista
  oficial de RENAPO (BACA, BAKA, BUEI, …, WUEY) definida en el diseño.
- **Diferenciador**: carácter 17 de la CURP (homoclave): dígito si la persona
  nació antes del año 2000, letra si nació en 2000 o después.
- **Dígito_Verificador**: carácter 18 de la CURP, calculado sobre los 17
  primeros.
- **Registro_CURP**: fila persistida con los datos de una Persona, su CURP, el
  flag Usado y la fecha de creación.
- **Usado**: flag booleano por registro marcado manualmente por el usuario;
  solo informativo.
- **Historial_CURP**: colección persistida de Registro_CURP de esta pantalla.

## Requirements

### Requerimiento 1 — Generar personas por rango de edad

**Historia de usuario:** Como usuario, quiero generar una cantidad configurable
de personas con edades aleatorias dentro de un rango, para obtener datos de
prueba con CURP.

#### Criterios de aceptación

1. CUANDO el usuario introduce edad mínima, edad máxima y cantidad y pulsa
   Generar, EL Generador_CURP DEBERÁ producir exactamente esa cantidad de
   Personas.
2. CUANDO se genera una Persona, EL Generador_CURP DEBERÁ asignarle una edad
   entera elegida uniformemente en el rango inclusivo [mínima, máxima].
3. CUANDO se genera una Persona, EL Generador_CURP DEBERÁ asignarle una fecha
   de nacimiento anterior a la fecha actual cuya edad cumplida es exactamente
   la edad asignada.
4. SI la edad mínima, la edad máxima o la cantidad no son enteros, ENTONCES EL
   Generador_CURP DEBERÁ rechazar la generación y mostrar un mensaje de error
   bajo los campos.
5. SI la edad mínima es menor que 0, ENTONCES EL Generador_CURP DEBERÁ rechazar
   la generación y mostrar un mensaje de error bajo los campos.
6. SI la edad máxima es menor que la edad mínima, ENTONCES EL Generador_CURP
   DEBERÁ rechazar la generación y mostrar un mensaje de error bajo los campos.
7. SI la cantidad es menor que 1, ENTONCES EL Generador_CURP DEBERÁ rechazar la
   generación y mostrar un mensaje de error bajo los campos.

### Requerimiento 2 — Nombres y sexo

**Historia de usuario:** Como usuario, quiero que cada persona tenga nombres y
apellidos mexicanos verosímiles y un sexo coherente con sus nombres, para que
los datos parezcan reales.

#### Criterios de aceptación

1. CUANDO se genera una Persona, EL Generador_CURP DEBERÁ asignarle un apellido
   paterno y un apellido materno tomados del locale mexicano (`es_MX`) de
   `@faker-js/faker`.
2. CUANDO se genera una Persona, EL Generador_CURP DEBERÁ asignarle 1 nombre de
   pila con probabilidad 0.80, 2 nombres con probabilidad 0.15 y 3 nombres con
   probabilidad 0.05.
3. CUANDO se genera una Persona, EL Generador_CURP DEBERÁ tomar todos sus
   nombres de pila del mismo sexo y asignar el Sexo (`H` o `M`) correspondiente
   a ese sexo.
4. THE Generador_CURP SHALL importar únicamente el locale `es_MX` de
   `@faker-js/faker`.

### Requerimiento 3 — Estado de nacimiento

**Historia de usuario:** Como usuario, quiero que la mayoría de las personas
nazcan en Guerrero y el resto en otros estados, para reflejar mi caso de uso.

#### Criterios de aceptación

1. CUANDO se genera una Persona, EL Generador_CURP DEBERÁ asignarle la
   Clave_Estado `GR` con probabilidad 0.80, de forma independiente por Persona.
2. CUANDO a una Persona no se le asigna `GR`, EL Generador_CURP DEBERÁ
   asignarle una de las otras 31 Clave_Estado elegida uniformemente.
3. THE Generador_CURP SHALL asignar únicamente Clave_Estado de las 32 entidades
   federativas, sin incluir `NE`.

### Requerimiento 4 — Construcción de la CURP

**Historia de usuario:** Como usuario, quiero que cada persona tenga una CURP
con formato y dígito verificador válidos, para usarla en pruebas que validan
CURP.

#### Criterios de aceptación

1. CUANDO se construye una CURP, EL Generador_CURP DEBERÁ normalizar nombres y
   apellidos a mayúsculas, sin acentos, con `Ñ` convertida en `X` y sin
   caracteres que no sean letras.
2. CUANDO un nombre o apellido inicia con una o más Partículas seguidas de otra
   palabra, EL Generador_CURP DEBERÁ omitir esas Partículas al construir la
   CURP.
3. CUANDO se construye una CURP, EL Generador_CURP DEBERÁ formar los
   caracteres 1 a 4 con: la primera letra del apellido paterno, la primera
   vocal interna del apellido paterno (`X` si no hay), la primera letra del
   apellido materno (`X` si no hay) y la primera letra del nombre de pila
   seleccionado.
4. CUANDO la Persona tiene más de un nombre de pila y el primero es JOSE, J,
   MARIA, MA o M (tras normalizar), EL Generador_CURP DEBERÁ usar el segundo
   nombre de pila como nombre seleccionado.
5. SI los caracteres 1 a 4 forman una Palabra_Inconveniente, ENTONCES EL
   Generador_CURP DEBERÁ reemplazar el segundo carácter por `X`.
6. CUANDO se construye una CURP, EL Generador_CURP DEBERÁ formar los
   caracteres 5 a 10 con la fecha de nacimiento en formato AAMMDD, el carácter
   11 con el Sexo y los caracteres 12 y 13 con la Clave_Estado.
7. CUANDO se construye una CURP, EL Generador_CURP DEBERÁ formar los
   caracteres 14 a 16 con la primera consonante interna del apellido paterno,
   del apellido materno y del nombre seleccionado, usando `X` donde no exista.
8. CUANDO la Persona nació antes del año 2000, EL Generador_CURP DEBERÁ asignar
   como Diferenciador un dígito aleatorio de 0 a 9.
9. CUANDO la Persona nació en el año 2000 o después, EL Generador_CURP DEBERÁ
   asignar como Diferenciador una letra aleatoria de A a Z.
10. CUANDO se construye una CURP, EL Generador_CURP DEBERÁ asignar como
    Dígito_Verificador `(10 - suma % 10) % 10`, donde suma es la suma de
    `valor(c_i) * (18 - i)` para los 17 primeros caracteres (i de 0 a 16) y
    `valor` es el índice del carácter en `0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ`.
11. THE Generador_CURP SHALL exponer una función `isValidCurp` que devuelve
    verdadero solo para cadenas de 18 caracteres con la estructura de CURP y
    Dígito_Verificador correcto.

### Requerimiento 5 — Deduplicación y persistencia

**Historia de usuario:** Como usuario, quiero que mis registros y sus marcas
persistan entre sesiones y sin CURP repetidas, para no perder el historial ni
duplicar datos.

#### Criterios de aceptación

1. CUANDO termina una generación, EL Generador_CURP DEBERÁ agregar al
   Historial_CURP los registros cuya CURP no existe ya en el historial.
2. CUANDO una misma generación produce dos o más Personas con la misma CURP,
   EL Generador_CURP DEBERÁ conservar solo la primera.
3. CUANDO la app se reinicia, EL Generador_CURP DEBERÁ mostrar el
   Historial_CURP tal como quedó, incluidos los flags Usado.
4. THE Generador_CURP SHALL guardar su historial separado de los historiales de
   las pantallas de `age-tools`.
5. CUANDO la app con esquema de base de datos versión 1 se actualiza, EL
   Generador_CURP DEBERÁ conservar los registros existentes de `age_records`.

### Requerimiento 6 — Lista y marca de usado

**Historia de usuario:** Como usuario, quiero ver las personas generadas y
marcar las que ya ocupé, para llevar control.

#### Criterios de aceptación

1. WHILE el Historial_CURP tiene registros, EL Generador_CURP DEBERÁ mostrarlos
   en una lista desplazable, del más reciente al más antiguo, con nombre
   completo, CURP, Clave_Estado y edad por fila.
2. WHILE el Historial_CURP está vacío, EL Generador_CURP DEBERÁ mostrar un
   estado vacío.
3. CUANDO el usuario pulsa el checkbox de una fila, EL Generador_CURP DEBERÁ
   alternar el flag Usado de ese registro y persistir el cambio.
4. WHILE un registro está marcado como Usado, EL Generador_CURP DEBERÁ mostrar
   su fila atenuada y con el texto tachado.

### Requerimiento 7 — Navegación

**Historia de usuario:** Como usuario, quiero llegar a la nueva herramienta
desde la pantalla de inicio, para usarla igual que las otras.

#### Criterios de aceptación

1. CUANDO el usuario pulsa el botón "Generador de CURP" en la pantalla de
   inicio, EL Generador_CURP DEBERÁ abrirse con el título "Generador de CURP".
2. CUANDO el usuario pulsa atrás en el Generador_CURP, la app DEBERÁ volver a
   la pantalla de inicio.

## Fuera de alcance

- Exportar o copiar los resultados.
- Editar o borrar registros.
- Validar CURP introducidas por el usuario desde la UI.
- Generar personas nacidas en el extranjero (`NE`).
