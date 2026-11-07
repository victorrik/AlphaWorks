import { FlatList, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import type { CurpRecord } from '../db/models/CurpRecord';
import { Checkbox } from './Checkbox';
import { Text } from './Typography';

type Props = {
  records: CurpRecord[];
  onToggleUsed: (record: CurpRecord) => void;
};

export function CurpRecordList({ records, onToggleUsed }: Props) {
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
      renderItem={({ item }) => {
        const type = item.used ? 'secondary' : 'default';
        return (
          <View style={[styles.row, item.used && styles.rowUsed]}>
            <Checkbox checked={item.used} onChange={() => onToggleUsed(item)} />
            <View style={styles.info}>
              <Text type={type} delete={item.used}>
                {`${item.nombres} ${item.apellidoPaterno} ${item.apellidoMaterno}`}
              </Text>
              <Text type={type} delete={item.used}>
                {item.curp}
              </Text>
            </View>
            <Text type={type} delete={item.used} style={styles.meta}>
              {item.stateCode}
            </Text>
            <Text type={type} delete={item.used} style={styles.meta}>
              {item.age}
            </Text>
          </View>
        );
      }}
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
  info: { marginLeft: spacing.sm, flex: 1 },
  meta: { marginLeft: spacing.sm },
});
