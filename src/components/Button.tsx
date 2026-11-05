import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  colors,
  controlHeight,
  fontFamily,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from '../theme';

type ButtonType = 'default' | 'primary' | 'dashed' | 'text' | 'link';
type ButtonSize = 'small' | 'middle' | 'large';

type Props = {
  children?: ReactNode;
  type?: ButtonType;
  size?: ButtonSize;
  danger?: boolean;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const heightBySize: Record<ButtonSize, number> = {
  small: controlHeight.sm,
  middle: controlHeight.base,
  large: controlHeight.lg,
};

const fontBySize: Record<ButtonSize, number> = {
  small: fontSize.base,
  middle: fontSize.base,
  large: fontSize.lg,
};

const padBySize: Record<ButtonSize, number> = {
  small: spacing.xs,
  middle: spacing.md,
  large: spacing.md,
};

// Container style per antd type, danger variant folded in.
function container(type: ButtonType, danger: boolean): ViewStyle {
  const brand = danger ? colors.error : colors.primary;
  const border = danger ? colors.error : colors.border;
  switch (type) {
    case 'primary':
      return { backgroundColor: brand };
    case 'dashed':
      return {
        backgroundColor: colors.bgContainer,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: danger ? colors.error : colors.border,
      };
    case 'text':
      return { backgroundColor: 'transparent' };
    case 'link':
      return { backgroundColor: 'transparent' };
    default:
      return {
        backgroundColor: colors.bgContainer,
        borderWidth: 1,
        borderColor: border,
      };
  }
}

function labelColor(type: ButtonType, danger: boolean): string {
  if (type === 'primary') return colors.white;
  if (type === 'link') return danger ? colors.error : colors.primary;
  if (danger) return colors.error;
  if (type === 'text') return colors.textPrimary;
  return colors.textPrimary;
}

export function Button({
  children,
  type = 'default',
  size = 'middle',
  danger = false,
  block = false,
  disabled = false,
  loading = false,
  icon,
  onPress,
  style,
  textStyle,
}: Props) {
  const isDisabled = disabled || loading;
  const spinnerColor = type === 'primary' ? colors.white : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { height: heightBySize[size], paddingHorizontal: padBySize[size] },
        type !== 'text' && type !== 'link' && { borderRadius: radius.base },
        container(type, danger),
        block && styles.block,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} style={styles.icon} />
      ) : icon ? (
        <View style={styles.icon}>{icon}</View>
      ) : null}
      {children != null && (
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            { fontSize: fontBySize[size], color: labelColor(type, danger) },
            type === 'link' && styles.link,
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  block: { alignSelf: 'stretch' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
  label: {
    fontFamily,
    fontWeight: fontWeight.regular,
    textAlign: 'center',
  },
  link: { textDecorationLine: 'none' },
  icon: { marginRight: spacing.xs },
});
