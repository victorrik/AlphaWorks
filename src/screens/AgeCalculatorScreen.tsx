import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Input, RecordList, Text, Title } from '../components';
import { colors, spacing } from '../theme';
import { generateByAges, ValidationError } from '../services/age';
import { addRecords, fetchBySource, setUsed } from '../db/ageRecordRepo';
import { useRecords } from '../hooks/useRecords';

const query = { fetch: () => fetchBySource('calculator'), setUsed };

export function AgeCalculatorScreen() {
  const { t } = useTranslation(['calculator', 'common']);
  const { data, isLoading, refetch, toggleUsed, hideUsed, setHideUsed } =
    useRecords(query);
  const [ages, setAges] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async () => {
    try {
      const parsed = ages.split(',').map(a => Number(a.trim()));
      const generated = generateByAges(parsed, new Date());
      setError(null);
      await addRecords('calculator', generated);
      await refetch();
    } catch (e) {
      setError(e instanceof ValidationError ? t(`common:${e.key}`) : t('common:errors.generic'));
    }
  };

  return (
    <View style={styles.screen}>
      <Title level={3}>{t('title')}</Title>
      <View style={styles.form}>
        <Input
          value={ages}
          onChangeText={setAges}
          placeholder={t('agesPlaceholder')}
          keyboardType="numeric"
          status={error ? 'error' : undefined}
        />
        {error != null && <Text type="danger">{error}</Text>}
        <Button type="primary" block onPress={onGenerate}>
          {t('common:generate')}
        </Button>
        <Checkbox checked={hideUsed} onChange={setHideUsed}>
          {t('common:hideMarked')}
        </Checkbox>
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
});
