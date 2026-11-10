import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Input, RecordList, Text, Title } from '../components';
import { colors, spacing } from '../theme';
import { generateByRange, ValidationError } from '../services/age';
import { addRecords, fetchBySource, setUsed } from '../db/ageRecordRepo';
import { useRecords } from '../hooks/useRecords';

const query = { fetch: () => fetchBySource('range'), setUsed };

export function RangeGeneratorScreen() {
  const { t } = useTranslation(['range', 'common']);
  const { data, isLoading, refetch, toggleUsed } = useRecords(query);
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
      await refetch();
    } catch (e) {
      setError(
        e instanceof ValidationError
          ? t(`common:${e.key}`)
          : t('common:errors.generic'),
      );
    }
  };

  return (
    <View style={styles.screen}>
      <Title level={3}>{t('title')}</Title>
      <View style={styles.form}>
        <View style={styles.inputs}>
          <Input
            style={styles.flex}
            value={min}
            onChangeText={setMin}
            placeholder={t('common:minAge')}
            keyboardType="numeric"
            status={error ? 'error' : undefined}
          />
          <Input
            style={styles.flex}
            value={max}
            onChangeText={setMax}
            placeholder={t('common:maxAge')}
            keyboardType="numeric"
            status={error ? 'error' : undefined}
          />
          <Input
            style={styles.flex}
            value={count}
            onChangeText={setCount}
            placeholder={t('common:count')}
            keyboardType="numeric"
            status={error ? 'error' : undefined}
          />
        </View>
        {error != null && <Text type="danger">{error}</Text>}
        <Button type="primary" block onPress={onGenerate}>
          {t('common:generate')}
        </Button>
      </View>
      <RecordList
        records={data}
        isLoading={isLoading}
        onToggleUsed={toggleUsed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg, backgroundColor: colors.white },
  form: { gap: spacing.sm, marginVertical: spacing.lg },
  inputs: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
