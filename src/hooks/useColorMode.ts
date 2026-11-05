import { useColorScheme } from 'react-native';

export function useColorMode() {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}
