/**
 * AlphaWorks
 *
 * @format
 */

import { PortalProvider } from '@gorhom/portal';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <PortalProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <RootNavigator />
      </PortalProvider>
    </SafeAreaProvider>
  );
}

export default App;
