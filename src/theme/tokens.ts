// Ant Design v5 sizing/typography tokens mapped to RN.
// Roboto comes from the system on Android; iOS falls back to San Francisco.
export const fontFamily = 'Roboto';

export const fontSize = {
  sm: 12,
  base: 14, // antd default
  lg: 16,
  xl: 20,
  heading5: 16,
  heading4: 20,
  heading3: 24,
  heading2: 30,
  heading1: 38,
};

export const lineHeight = {
  sm: 20,
  base: 22,
  lg: 24,
  xl: 28,
  heading5: 24,
  heading4: 28,
  heading3: 32,
  heading2: 38,
  heading1: 46,
};

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// antd controlHeight tokens: SM 24, default 32, LG 40
export const controlHeight = {
  sm: 24,
  base: 32,
  lg: 40,
};

export const radius = {
  sm: 4,
  base: 6, // antd borderRadius default
  lg: 8,
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
};
