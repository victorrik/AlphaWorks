import { appSchema, tableSchema } from '@nozbe/watermelondb';
import type { TableSchemaSpec } from '@nozbe/watermelondb/Schema';

// Shared by schema and migrations so both use the same column list.
// Columnas por versión del esquema; las migraciones usan cada grupo por separado.
export const curpV2Columns: TableSchemaSpec['columns'] = [
  { name: 'nombres', type: 'string' },
  { name: 'apellido_paterno', type: 'string' },
  { name: 'apellido_materno', type: 'string' },
  { name: 'sexo', type: 'string' },
  { name: 'birth_date', type: 'string' },
  { name: 'age', type: 'number' },
  { name: 'state_code', type: 'string' },
  { name: 'curp', type: 'string', isIndexed: true },
  { name: 'used', type: 'boolean' },
  { name: 'created_at', type: 'number' },
];

// v3: opcionales porque los registros anteriores no tienen talla ni peso.
export const curpV3Columns: TableSchemaSpec['columns'] = [
  { name: 'height', type: 'number', isOptional: true },
  { name: 'weight', type: 'number', isOptional: true },
];

export const curpRecordsTable: TableSchemaSpec = {
  name: 'curp_records',
  columns: [...curpV2Columns, ...curpV3Columns],
};

export const schema = appSchema({
  version: 3,
  tables: [
    tableSchema({
      name: 'age_records',
      columns: [
        { name: 'source', type: 'string' },
        { name: 'birth_date', type: 'string' },
        { name: 'age', type: 'number' },
        { name: 'used', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema(curpRecordsTable),
  ],
});
