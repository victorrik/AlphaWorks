import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Checkbox,
  Icon,
  Input,
  Title,
  Text,
} from '../components';
import { colors, spacing } from '../theme';

export function HomeScreen() {
  const [name, setName] = useState('');
  const [agree, setAgree] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title level={3}>AlphaWorks</Title>
      <Text type="secondary">Componentes base estilo Ant Design.</Text>

      <View style={styles.row}>
        <Button type="primary">Primary</Button>
        <Button>Default</Button>
        <Button type="dashed">Dashed</Button>
      </View>
      <View style={styles.row}>
        <Button type="text">Text</Button>
        <Button type="link">Link</Button>
        <Button type="primary" danger icon={<Icon name="delete" size={14} color={colors.white} />}>
          Delete
        </Button>
      </View>
      <View style={styles.row}>
        <Button type="primary" loading>
          Loading
        </Button>
        <Button disabled>Disabled</Button>
      </View>

      <Input
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
        allowClear
        prefix={<Icon name="user" size={14} color={colors.textTertiary} />}
      />
      <Input placeholder="Con error" status="error" />

      <Checkbox checked={agree} onChange={setAgree}>
        Acepto los términos
      </Checkbox>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.bgContainer,
    flexGrow: 1,
  },
  row: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', alignItems: 'center' },
});
