import { addRecords as addAge, fetchBySource } from './ageRecordRepo';
import { addRecords as addCurp, fetchAll } from './curpRecordRepo';
import { deleteAllRecords } from './deleteAll';

test('deleteAllRecords vacía las tablas de edades y de CURP', async () => {
  await addAge('range', [{ birthDate: '01-01-2000', age: 24 }]);
  await addCurp([
    {
      nombres: 'ANA',
      apellidoPaterno: 'LOPEZ',
      apellidoMaterno: 'RUIZ',
      sexo: 'M',
      birthDate: '01-01-2000',
      age: 24,
      stateCode: 'GR',
      height: 155,
      weight: 60,
      curp: 'LORA000101MGRPZNA1',
    },
  ]);
  expect(await fetchBySource('range')).toHaveLength(1);
  expect(await fetchAll()).toHaveLength(1);

  await deleteAllRecords();

  expect(await fetchBySource('range')).toHaveLength(0);
  expect(await fetchAll()).toHaveLength(0);
});
