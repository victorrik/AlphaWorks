import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { useTranslation } from 'react-i18next';
import { Button, Input, RecordList, Text, Title } from '../components';
import { colors, spacing } from '../theme';
import { generateByAges, ValidationError } from '../services/age';
import { addRecords, observeBySource, toggleUsed } from '../db/ageRecordRepo';
import type { AgeRecord } from '../db/models/AgeRecord';

type Props = { records: AgeRecord[] };

function AgeCalculatorView({ records }: Props) {
  const { t } = useTranslation(['calculator', 'common']);
  const [ages, setAges] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async () => {
    try {
      const parsed = ages.split(',').map(a => Number(a.trim()));
      const generated = generateByAges(parsed, new Date());
      setError(null);
      await addRecords('calculator', generated);
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
      </View>
      <RecordList records={records} onToggleUsed={toggleUsed} />
    </View>
  );
}

export const AgeCalculatorScreen = withObservables([], () => ({
  records: observeBySource('calculator'),
}))(AgeCalculatorView);

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg, backgroundColor: colors.bgLayout },
  form: { gap: spacing.sm, marginVertical: spacing.lg },
});
