import { HomeScreen } from '../screens/HomeScreen';

// shortcut: sin librería de navegación aún; cuando haya más de una pantalla,
// instalar @react-navigation/native y reemplazar este render directo.
export function RootNavigator() {
  return <HomeScreen />;
}
