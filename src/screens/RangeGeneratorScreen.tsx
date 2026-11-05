import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { Button, Input, RecordList, Text, Title } from '../components';
import { colors, spacing } from '../theme';
import { generateByRange } from '../services/age';
import { addRecords, observeBySource, toggleUsed } from '../db/ageRecordRepo';
import type { AgeRecord } from '../db/models/AgeRecord';

type Props = { records: AgeRecord[] };

function RangeGeneratorView({ records }: Props) {
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [count, setCount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async () => {
    try {
      const generated = generateByRange(
        Number(min),
        Number(max),
        Number(count),
        new Date(),
      );
      setError(null);
      await addRecords('range', generated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar.');
    }
  };

  return (
    <View style={styles.screen}>
      <Title level={3}>Generador por rango</Title>
      <View style={styles.form}>
        <Input
          value={min}
          onChangeText={setMin}
          placeholder="Edad mínima"
          keyboardType="numeric"
          status={error ? 'error' : undefined}
        />
        <Input
          value={max}
          onChangeText={setMax}
          placeholder="Edad máxima"
          keyboardType="numeric"
          status={error ? 'error' : undefined}
        />
        <Input
          value={count}
          onChangeText={setCount}
          placeholder="Cantidad"
          keyboardType="numeric"
          status={error ? 'error' : undefined}
        />
        {error != null && <Text type="danger">{error}</Text>}
        <Button type="primary" block onPress={onGenerate}>
          Generar
        </Button>
      </View>
      <RecordList records={records} onToggleUsed={toggleUsed} />
    </View>
  );
}

export const RangeGeneratorScreen = withObservables([], () => ({
  records: observeBySource('range'),
}))(RangeGeneratorView);

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg, backgroundColor: colors.bgLayout },
  form: { gap: spacing.sm, marginVertical: spacing.lg },
});
