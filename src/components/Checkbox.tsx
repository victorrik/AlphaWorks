import { useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fontFamily, fontSize, radius, spacing } from '../theme';
import { Icon } from './Icon';

type Props = {
  children?: ReactNode;
  checked?: boolean; // controlled
  defaultChecked?: boolean; // uncontrolled
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

export function Checkbox({
  children,
  checked,
  defaultChecked = false,
  indeterminate = false,
  disabled = false,
  onChange,
  style,
}: Props) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const value = isControlled ? checked : internal;

  const toggle = () => {
    if (disabled) return;
    const next = !value;
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const active = value || indeterminate;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? 'mixed' : !!value, disabled }}
      onPress={toggle}
      disabled={disabled}
      style={[styles.row, disabled && styles.disabled, style]}
    >
      <View
        style={[
          styles.box,
          active && styles.boxActive,
          disabled && styles.boxDisabled,
        ]}
      >
        {indeterminate ? (
          <View style={styles.indeterminate} />
        ) : value ? (
          <Icon name="check" size={12} color={colors.white} />
        ) : null}
      </View>
      {children != null && <Text style={styles.label}>{children}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  disabled: { opacity: 0.5 },
  box: {
    width: 16,
    height: 16,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  boxDisabled: { backgroundColor: colors.bgContainerDisabled, borderColor: colors.border },
  indeterminate: {
    width: 8,
    height: 8,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },
  label: {
    marginLeft: spacing.xs,
    fontFamily,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
});
