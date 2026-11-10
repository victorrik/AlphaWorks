import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../theme';
import type { AgeRow } from '../db/ageRecordRepo';
import { Text } from './Typography';

type Props = {
  records: AgeRow[];
  isLoading: boolean;
  onToggleUsed: (id: string) => void;
};

export function RecordList({ records, isLoading, onToggleUsed }: Props) {
  const { t } = useTranslation();
  if (isLoading) {
    return <ActivityIndicator style={styles.empty} />;
  }
  if (records.length === 0) {
    return (
      <View style={styles.empty}>
        <Text type="secondary">{t('empty')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={records}
      keyExtractor={item => item.id}
      renderItem={({ item, index }) => (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.used }}
          onPress={() => onToggleUsed(item.id)}
          style={[styles.row, item.used && styles.rowUsed]}
        >
          <Text type="secondary" style={styles.index}>
            {index + 1}
          </Text>
          <Text type={item.used ? 'secondary' : 'default'} delete={item.used} style={styles.date}>
            {item.birthDate}
          </Text>
          <Text type={item.used ? 'secondary' : 'default'} delete={item.used}>
            {item.age}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: { padding: spacing.lg, alignItems: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowUsed: { backgroundColor: colors.bgSelected },
  index: { minWidth: 28 },
  date: { marginLeft: spacing.sm, flex: 1 },
});
