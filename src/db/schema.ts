import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
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
  ],
});
