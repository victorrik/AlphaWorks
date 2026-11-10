import { Q } from '@nozbe/watermelondb';
import { Observable } from 'rxjs';
import { database } from './index';
import { AgeRecord } from './models/AgeRecord';
import { GeneratedRecord } from '../services/age';

export type Source = 'range' | 'calculator';

const records = database.get<AgeRecord>('age_records');

// Orden desc por created_at (Req 5.2).
export function observeBySource(source: Source): Observable<AgeRecord[]> {
  return records
    .query(Q.where('source', source), Q.sortBy('created_at', Q.desc))
    .observeWithColumns(['used']);
}

const dedupKey = (birthDate: string, age: number) => `${birthDate}|${age}`;

// Dedup por birth_date+age dentro del mismo source; inserta los nuevos en un
// solo batch. Devuelve cuántos se insertaron (Req 1.4/1.5, 2.3/2.4, 4.3).
export async function addRecords(
  source: Source,
  toAdd: GeneratedRecord[],
): Promise<number> {
  const existing = await records.query(Q.where('source', source)).fetch();
  const seen = new Set(existing.map(r => dedupKey(r.birthDate, r.age)));

  const fresh: GeneratedRecord[] = [];
  for (const r of toAdd) {
    const key = dedupKey(r.birthDate, r.age);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key); // dedup también dentro del mismo lote
    fresh.push(r);
  }

  if (fresh.length === 0) {
    return 0;
  }

  await database.write(async () => {
    await database.batch(
      ...fresh.map(r =>
        records.prepareCreate(record => {
          record.source = source;
          record.birthDate = r.birthDate;
          record.age = r.age;
          record.used = false;
          record.createdAt = new Date();
        }),
      ),
    );
  });

  return fresh.length;
}

export function toggleUsed(record: AgeRecord): Promise<void> {
  return record.toggleUsed();
}
