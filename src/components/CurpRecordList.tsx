import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../theme';
import type { CurpRecord } from '../db/models/CurpRecord';
import { Checkbox } from './Checkbox';
import { Text } from './Typography';

type Props = {
  records: CurpRecord[];
  onToggleUsed: (record: CurpRecord) => void;
};

export function CurpRecordList({ records, onToggleUsed }: Props) {
  const { t } = useTranslation();
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
      renderItem={({ item, index }) => {
        const type = item.used ? 'secondary' : 'default';
        return (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.used }}
            onPress={() => onToggleUsed(item)}
            style={[styles.row, item.used && styles.rowUsed]}
          >
            <Text type="secondary" style={styles.index}>
              {index + 1}
            </Text>
            <View
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Checkbox checked={item.used} />
            </View>
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
          </Pressable>
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
  rowUsed: { backgroundColor: colors.bgSelected },
  index: { minWidth: 28 },
  info: { marginLeft: spacing.sm, flex: 1 },
  meta: { marginLeft: spacing.sm },
});
