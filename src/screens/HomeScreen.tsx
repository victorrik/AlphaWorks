import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { Button, Text, Title } from '../components';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, spacing } from '../theme';

export function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Title level={3}>AlphaWorks</Title>
        <Text type="secondary">Elige una herramienta.</Text>
      </View>
      <Button
        type="primary"
        block
        onPress={() => navigation.navigate('RangeGenerator')}
      >
        Generador por rango
      </Button>
      <Button
        type="primary"
        block
        onPress={() => navigation.navigate('AgeCalculator')}
      >
        Calculador por edades
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.bgLayout,
  },
  header: { gap: spacing.xxs, marginBottom: spacing.md },
});
