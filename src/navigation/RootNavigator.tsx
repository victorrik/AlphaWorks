import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AgeCalculatorScreen } from '../screens/AgeCalculatorScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { RangeGeneratorScreen } from '../screens/RangeGeneratorScreen';

export type RootStackParamList = {
  Home: undefined;
  RangeGenerator: undefined;
  AgeCalculator: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'AlphaWorks' }} />
        <Stack.Screen
          name="RangeGenerator"
          component={RangeGeneratorScreen}
          options={{ title: 'Generador por rango' }}
        />
        <Stack.Screen
          name="AgeCalculator"
          component={AgeCalculatorScreen}
          options={{ title: 'Calculador por edades' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
