import { database } from './index';

// Borra los registros de todas las tablas. Solo llamar con las pantallas de
// registros cerradas: WatermelonDB no permite tener consultas activas al resetear.
export function deleteAllRecords(): Promise<void> {
  return database.write(() => database.unsafeResetDatabase());
}
