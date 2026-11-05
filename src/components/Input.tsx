import { useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  colors,
  controlHeight,
  fontFamily,
  fontSize,
  radius,
  spacing,
} from '../theme';
import { Icon } from './Icon';

type InputSize = 'small' | 'middle' | 'large';
type InputStatus = 'error' | 'warning';

type Props = Omit<TextInputProps, 'style'> & {
  size?: InputSize;
  status?: InputStatus;
  disabled?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  allowClear?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

const heightBySize: Record<InputSize, number> = {
  small: controlHeight.sm,
  middle: controlHeight.base,
  large: controlHeight.lg,
};

const fontBySize: Record<InputSize, number> = {
  small: fontSize.base,
  middle: fontSize.base,
  large: fontSize.lg,
};

function borderColor(status: InputStatus | undefined, focused: boolean): string {
  if (status === 'error') return colors.error;
  if (status === 'warning') return colors.warning;
  if (focused) return colors.primary;
  return colors.border;
}

export function Input({
  size = 'middle',
  status,
  disabled = false,
  prefix,
  suffix,
  allowClear = false,
  value,
  onChangeText,
  style,
  inputStyle,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const showClear = allowClear && !disabled && !!value;

  return (
    <View
      style={[
        styles.wrapper,
        {
          height: heightBySize[size],
          borderColor: borderColor(status, focused),
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {prefix != null && <View style={styles.affix}>{prefix}</View>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        placeholderTextColor={colors.textTertiary}
        onFocus={e => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={e => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          styles.input,
          { fontSize: fontBySize[size] },
          disabled && styles.disabledText,
          inputStyle,
        ]}
        {...rest}
      />
      {showClear && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="clear"
          hitSlop={8}
          onPress={() => onChangeText?.('')}
          style={styles.affix}
        >
          <Icon name="close-circle" size={14} color={colors.textTertiary} />
        </Pressable>
      )}
      {suffix != null && <View style={styles.affix}>{suffix}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.base,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.bgContainer,
  },
  input: {
    flex: 1,
    fontFamily,
    color: colors.textPrimary,
    padding: 0, // kill Android default vertical padding so height is exact
  },
  affix: { justifyContent: 'center' },
  disabled: { backgroundColor: colors.bgContainerDisabled },
  disabledText: { color: colors.textDisabled },
});
