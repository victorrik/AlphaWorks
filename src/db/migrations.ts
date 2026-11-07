import {
  createTable,
  schemaMigrations,
} from '@nozbe/watermelondb/Schema/migrations';
import { curpRecordsTable } from './schema';

export const migrations = schemaMigrations({
  migrations: [{ toVersion: 2, steps: [createTable(curpRecordsTable)] }],
});
