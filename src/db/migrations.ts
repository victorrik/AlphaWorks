import {
  addColumns,
  createTable,
  schemaMigrations,
} from '@nozbe/watermelondb/Schema/migrations';
import { curpV2Columns, curpV3Columns } from './schema';

// La más nueva va primero.
export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 3,
      steps: [addColumns({ table: 'curp_records', columns: curpV3Columns })],
    },
    {
      toVersion: 2,
      steps: [createTable({ name: 'curp_records', columns: curpV2Columns })],
    },
  ],
});
