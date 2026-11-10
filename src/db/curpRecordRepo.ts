import { Q } from '@nozbe/watermelondb';
import { database } from './index';
import { CurpRecord } from './models/CurpRecord';
import { Person } from '../services/person';

const records = database.get<CurpRecord>('curp_records');

// Fila plana para el estado de la UI (los Model de WatermelonDB son mutables).
export type CurpRow = {
  id: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  curp: string;
  stateCode: string;
  age: number;
  used: boolean;
};

// Orden desc por created_at (Req 6.1).
export async function fetchAll(): Promise<CurpRow[]> {
  const rows = await records.query(Q.sortBy('created_at', Q.desc)).fetch();
  return rows.map(r => ({
    id: r.id,
    nombres: r.nombres,
    apellidoPaterno: r.apellidoPaterno,
    apellidoMaterno: r.apellidoMaterno,
    curp: r.curp,
    stateCode: r.stateCode,
    age: r.age,
    used: r.used,
  }));
}

// Dedup por CURP dentro del lote (se queda la primera) y contra las ya
// guardadas; inserta en un solo batch. Devuelve cuántas se insertaron
// (Req 5.1, 5.2, 5.3).
export async function addRecords(people: Person[]): Promise<number> {
  const byCurp = new Map<string, Person>();
  for (const p of people) {
    if (!byCurp.has(p.curp)) {
      byCurp.set(p.curp, p);
    }
  }
  if (byCurp.size === 0) {
    return 0;
  }

  const existing = await records
    .query(Q.where('curp', Q.oneOf([...byCurp.keys()])))
    .fetch();
  for (const r of existing) {
    byCurp.delete(r.curp);
  }

  const fresh = [...byCurp.values()];
  if (fresh.length === 0) {
    return 0;
  }

  await database.write(async () => {
    await database.batch(
      ...fresh.map(p =>
        records.prepareCreate(record => {
          record.nombres = p.nombres;
          record.apellidoPaterno = p.apellidoPaterno;
          record.apellidoMaterno = p.apellidoMaterno;
          record.sexo = p.sexo;
          record.birthDate = p.birthDate;
          record.age = p.age;
          record.stateCode = p.stateCode;
          record.curp = p.curp;
          record.used = false;
          record.createdAt = new Date();
        }),
      ),
    );
  });

  return fresh.length;
}

export async function setUsed(id: string, used: boolean): Promise<void> {
  const record = await records.find(id);
  await record.setUsed(used);
}
