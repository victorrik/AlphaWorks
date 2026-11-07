import { appSchema, tableSchema } from '@nozbe/watermelondb';
import type { TableSchemaSpec } from '@nozbe/watermelondb/Schema';

// Shared by schema and migrations so both use the same column list.
export const curpRecordsTable: TableSchemaSpec = {
  name: 'curp_records',
  columns: [
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
  ],
};

export const schema = appSchema({
  version: 2,
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
