import ReactTestRenderer from 'react-test-renderer';
import { useRecords, type RecordsQuery } from './useRecords';

type Row = { id: string; used: boolean };

let hook: ReturnType<typeof useRecords<Row>>;
function Probe({ query }: { query: RecordsQuery<Row> }) {
  hook = useRecords(query);
  return null;
}

const mount = (query: RecordsQuery<Row>) =>
  ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<Probe query={query} />);
  });

const makeQuery = (setUsed: RecordsQuery<Row>['setUsed']): RecordsQuery<Row> => ({
  fetch: async () => [
    { id: 'a', used: false },
    { id: 'b', used: false },
  ],
  setUsed,
});

test('isLoading pasa a false y data trae el resultado', async () => {
  await mount(makeQuery(jest.fn().mockResolvedValue(undefined)));
  expect(hook.isLoading).toBe(false);
  expect(hook.data.map(r => r.id)).toEqual(['a', 'b']);
});

test('toggleUsed actualiza el estado local y la base', async () => {
  const setUsed = jest.fn().mockResolvedValue(undefined);
  await mount(makeQuery(setUsed));
  await ReactTestRenderer.act(() => hook.toggleUsed('a'));
  expect(hook.data.find(r => r.id === 'a')?.used).toBe(true);
  expect(hook.data.find(r => r.id === 'b')?.used).toBe(false);
  expect(setUsed).toHaveBeenCalledWith('a', true);
});

test('si la base falla, revierte el estado local', async () => {
  await mount(makeQuery(jest.fn().mockRejectedValue(new Error('db'))));
  await ReactTestRenderer.act(() => hook.toggleUsed('a'));
  expect(hook.data.find(r => r.id === 'a')?.used).toBe(false);
});

test('hideUsed oculta los marcados sin perderlos', async () => {
  await mount(makeQuery(jest.fn().mockResolvedValue(undefined)));
  await ReactTestRenderer.act(() => hook.toggleUsed('a'));
  await ReactTestRenderer.act(async () => hook.setHideUsed(true));
  expect(hook.data.map(r => r.id)).toEqual(['b']);
  await ReactTestRenderer.act(async () => hook.setHideUsed(false));
  expect(hook.data.map(r => r.id)).toEqual(['a', 'b']);
});
