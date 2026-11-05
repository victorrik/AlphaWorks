import { Text as RNText, StyleSheet, type TextProps, type TextStyle } from 'react-native';
import { colors, fontFamily, fontSize, fontWeight, lineHeight } from '../theme';

type TextType = 'default' | 'secondary' | 'success' | 'warning' | 'danger';

type BaseProps = TextProps & {
  type?: TextType;
  strong?: boolean;
  italic?: boolean;
  underline?: boolean;
  delete?: boolean;
  disabled?: boolean;
  style?: TextStyle | TextStyle[];
};

const typeColor: Record<TextType, string> = {
  default: colors.textPrimary,
  secondary: colors.textSecondary,
  success: colors.success,
  warning: colors.warning,
  danger: colors.error,
};

function decorate({
  type = 'default',
  strong,
  italic,
  underline,
  delete: del,
  disabled,
}: BaseProps): TextStyle {
  return {
    color: disabled ? colors.textDisabled : typeColor[type],
    ...(strong && { fontWeight: fontWeight.semibold }),
    ...(italic && { fontStyle: 'italic' }),
    ...((underline || del) && {
      textDecorationLine: del
        ? underline
          ? 'underline line-through'
          : 'line-through'
        : 'underline',
    }),
  };
}

export function Text({ style, children, ...rest }: BaseProps) {
  return (
    <RNText style={[styles.text, decorate(rest), style]} {...rest}>
      {children}
    </RNText>
  );
}

export function Paragraph({ style, children, ...rest }: BaseProps) {
  return (
    <RNText style={[styles.text, styles.paragraph, decorate(rest), style]} {...rest}>
      {children}
    </RNText>
  );
}

type TitleLevel = 1 | 2 | 3 | 4 | 5;

type TitleProps = Omit<BaseProps, 'strong'> & { level?: TitleLevel };

const titleStyle: Record<TitleLevel, TextStyle> = {
  1: { fontSize: fontSize.heading1, lineHeight: lineHeight.heading1 },
  2: { fontSize: fontSize.heading2, lineHeight: lineHeight.heading2 },
  3: { fontSize: fontSize.heading3, lineHeight: lineHeight.heading3 },
  4: { fontSize: fontSize.heading4, lineHeight: lineHeight.heading4 },
  5: { fontSize: fontSize.heading5, lineHeight: lineHeight.heading5 },
};

export function Title({ level = 1, style, children, ...rest }: TitleProps) {
  return (
    <RNText
      style={[
        styles.text,
        titleStyle[level],
        { fontWeight: fontWeight.semibold },
        decorate(rest),
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

export const Typography = { Text, Paragraph, Title };

const styles = StyleSheet.create({
  text: {
    fontFamily,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    color: colors.textPrimary,
  },
  paragraph: {
    marginBottom: 16,
  },
});
