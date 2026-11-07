import { database } from './index';
import { CurpRecord } from './models/CurpRecord';
import { addRecords, toggleUsed } from './curpRecordRepo';
import { Person } from '../services/person';

const person = (curp: string, nombres = 'GLORIA'): Person => ({
  nombres,
  apellidoPaterno: 'HERNANDEZ',
  apellidoMaterno: 'GARCIA',
  sexo: 'M',
  birthDate: '27-04-1956',
  age: 69,
  stateCode: 'VZ',
  curp,
});

const all = () => database.get<CurpRecord>('curp_records').query().fetch();

beforeEach(() => database.write(() => database.unsafeResetDatabase()));

test('CURP repetida en el lote inserta una sola (la primera)', async () => {
  const n = await addRecords([
    person('HEGG560427MVZRRL04', 'PRIMERA'),
    person('HEGG560427MVZRRL04', 'SEGUNDA'),
    person('AAAA000101HGRBBB01'),
  ]);
  expect(n).toBe(2);
  const rows = await all();
  expect(rows).toHaveLength(2);
  expect(rows.find(r => r.curp === 'HEGG560427MVZRRL04')?.nombres).toBe('PRIMERA');
});

test('repetir el lote inserta 0', async () => {
  const batch = [person('HEGG560427MVZRRL04'), person('AAAA000101HGRBBB01')];
  expect(await addRecords(batch)).toBe(2);
  expect(await addRecords(batch)).toBe(0);
  expect(await all()).toHaveLength(2);
});

test('toggleUsed alterna used', async () => {
  await addRecords([person('HEGG560427MVZRRL04')]);
  const [rec] = await all();
  expect(rec.used).toBe(false);
  await toggleUsed(rec);
  expect(rec.used).toBe(true);
  await toggleUsed(rec);
  expect(rec.used).toBe(false);
});
