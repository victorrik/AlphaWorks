import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { AgeRecord } from './models/AgeRecord';

// SQLite (JSI) needs the native runtime; under Jest fall back to an in-memory
// LokiJS adapter so the JS layer is testable without a device.
function makeAdapter() {
  const isJest = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.JEST_WORKER_ID;
  if (!isJest) {
    return new SQLiteAdapter({ schema, jsi: true });
  }
  const LokiJSAdapter = require('@nozbe/watermelondb/adapters/lokijs').default;
  const { LokiMemoryAdapter } = require('lokijs');
  // _testLokiAdapter keeps everything in memory: no IndexedDB, no open handles.
  return new LokiJSAdapter({
    schema,
    useWebWorker: false,
    useIncrementalIndexedDB: false,
    _testLokiAdapter: new LokiMemoryAdapter(),
  });
}

export const database = new Database({
  adapter: makeAdapter(),
  modelClasses: [AgeRecord],
});
