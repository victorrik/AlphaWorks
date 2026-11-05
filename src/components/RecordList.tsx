import { FlatList, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import type { AgeRecord } from '../db/models/AgeRecord';
import { Checkbox } from './Checkbox';
import { Text } from './Typography';

type Props = {
  records: AgeRecord[];
  onToggleUsed: (record: AgeRecord) => void;
};

export function RecordList({ records, onToggleUsed }: Props) {
  if (records.length === 0) {
    return (
      <View style={styles.empty}>
        <Text type="secondary">Sin registros todavía</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={records}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={[styles.row, item.used && styles.rowUsed]}>
          <Checkbox checked={item.used} onChange={() => onToggleUsed(item)} />
          <Text type={item.used ? 'secondary' : 'default'} delete={item.used} style={styles.date}>
            {item.birthDate}
          </Text>
          <Text type={item.used ? 'secondary' : 'default'} delete={item.used}>
            {item.age}
          </Text>
        </View>
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
  rowUsed: { opacity: 0.5 },
  date: { marginLeft: spacing.sm, flex: 1 },
});
