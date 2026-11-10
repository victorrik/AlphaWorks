import { useCallback, useEffect, useState } from 'react';

type Row = { id: string; used: boolean };

// Consulta tipo react-query. Debe ser una constante estable (módulo), no un
// objeto creado en cada render, porque es la dependencia del efecto.
export type RecordsQuery<T extends Row> = {
  fetch: () => Promise<T[]>;
  setUsed: (id: string, used: boolean) => Promise<void>;
};

export function useRecords<T extends Row>(query: RecordsQuery<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [hideUsed, setHideUsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    query
      .fetch()
      .then(fetched => active && setRows(fetched))
      // shortcut: si la consulta falla se muestra la lista vacía, sin mensaje de error.
      .catch(() => {})
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [query]);

  // Vuelve a consultar la base (después de insertar registros).
  const refetch = useCallback(
    async () => setRows(await query.fetch()),
    [query],
  );

  const markLocal = (id: string, used: boolean) =>
    setRows(prev => prev.map(r => (r.id === id ? { ...r, used } : r)));

  // Actualiza primero el estado local y luego la base; si la base falla, revierte.
  const toggleUsed = async (id: string) => {
    const row = rows.find(r => r.id === id);
    if (!row) {
      return;
    }
    const used = !row.used;
    markLocal(id, used);
    try {
      await query.setUsed(id, used);
    } catch {
      markLocal(id, !used);
    }
  };

  // Los marcados se pueden ocultar; el estado completo sigue en `rows`.
  const data = hideUsed ? rows.filter(r => !r.used) : rows;

  return { data, isLoading, refetch, toggleUsed, hideUsed, setHideUsed };
}
