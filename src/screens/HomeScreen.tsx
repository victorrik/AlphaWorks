import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Text, Title } from '../components';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { deleteAllRecords } from '../db/deleteAll';
import { colors, spacing } from '../theme';

export function HomeScreen() {
  const { t } = useTranslation(['home', 'range', 'calculator', 'curp', 'common']);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Irreversible: pide confirmación antes de borrar.
  const confirmDelete = () =>
    Alert.alert(t('deleteTitle'), t('deleteMessage'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('deleteRecords'),
        style: 'destructive',
        onPress: () =>
          deleteAllRecords().catch(() =>
            Alert.alert(t('common:errors.generic')),
          ),
      },
    ]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Title level={3}>AlphaWorks</Title>
        <Text type="secondary">{t('subtitle')}</Text>
      </View>
      <Button
        type="primary"
        block
        onPress={() => navigation.navigate('RangeGenerator')}
      >
        {t('range:title')}
      </Button>
      <Button
        type="primary"
        block
        onPress={() => navigation.navigate('AgeCalculator')}
      >
        {t('calculator:title')}
      </Button>
      <Button
        type="primary"
        block
        onPress={() => navigation.navigate('CurpGenerator')}
      >
        {t('curp:title')}
      </Button>
      <Button type="primary" danger block onPress={confirmDelete}>
        {t('deleteRecords')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.white,
  },
  header: { gap: spacing.xxs, marginBottom: spacing.md },
});
