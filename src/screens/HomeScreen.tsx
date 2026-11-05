import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Checkbox,
  Icon,
  Input,
  Paragraph,
  Text,
  Title,
} from '../components';
import { colors, spacing } from '../theme';

// Helper de maquetado solo para esta demo, no es un componente de librería.
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Title level={5}>{title}</Title>
      {children}
    </View>
  );
}

export function HomeScreen() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [newsletter, setNewsletter] = useState(true);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Title level={3}>AlphaWorks UI</Title>
        <Text type="secondary">
          Presentación de los componentes base estilo Ant Design.
        </Text>
      </View>

      <Section title="Typography">
        <Title level={1}>Título h1</Title>
        <Title level={2}>Título h2</Title>
        <Title level={3}>Título h3</Title>
        <Title level={4}>Título h4</Title>
        <Title level={5}>Título h5</Title>
        <Text>Texto por defecto</Text>
        <Text type="secondary">Texto secundario</Text>
        <Text type="success">Texto de éxito</Text>
        <Text type="warning">Texto de advertencia</Text>
        <Text type="danger">Texto de error</Text>
        <Text disabled>Texto deshabilitado</Text>
        <View style={styles.row}>
          <Text strong>Negrita</Text>
          <Text italic>Cursiva</Text>
          <Text underline>Subrayado</Text>
          <Text delete>Tachado</Text>
        </View>
        <Paragraph>
          Este es un párrafo que demuestra el espaciado inferior y el alto de
          línea por defecto del componente Paragraph.
        </Paragraph>
      </Section>

      <Section title="Button · tipos">
        <View style={styles.row}>
          <Button type="primary">Primary</Button>
          <Button>Default</Button>
          <Button type="dashed">Dashed</Button>
          <Button type="text">Text</Button>
          <Button type="link">Link</Button>
        </View>
      </Section>

      <Section title="Button · tamaños">
        <View style={styles.rowAlign}>
          <Button type="primary" size="large">
            Large
          </Button>
          <Button type="primary" size="middle">
            Middle
          </Button>
          <Button type="primary" size="small">
            Small
          </Button>
        </View>
      </Section>

      <Section title="Button · danger">
        <View style={styles.row}>
          <Button type="primary" danger>
            Primary
          </Button>
          <Button danger>Default</Button>
          <Button type="dashed" danger>
            Dashed
          </Button>
          <Button type="text" danger>
            Text
          </Button>
          <Button type="link" danger>
            Link
          </Button>
        </View>
      </Section>

      <Section title="Button · con icono, loading y disabled">
        <View style={styles.row}>
          <Button
            type="primary"
            icon={<Icon name="download" size={14} color={colors.white} />}
          >
            Descargar
          </Button>
          <Button icon={<Icon name="setting" size={14} />}>Ajustes</Button>
          <Button type="primary" loading>
            Cargando
          </Button>
          <Button disabled>Disabled</Button>
        </View>
        <Button type="primary" block>
          Botón block
        </Button>
      </Section>

      <Section title="Icon">
        <View style={styles.rowAlign}>
          <Icon name="home" size={24} color={colors.primary} />
          <Icon name="setting" size={24} color={colors.textPrimary} />
          <Icon name="heart" size={24} color={colors.error} />
          <Icon name="check-circle" size={24} color={colors.success} />
          <Icon name="warning" size={24} color={colors.warning} />
          <Icon name="user" size={24} color={colors.textSecondary} />
        </View>
      </Section>

      <Section title="Input">
        <Input
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
          allowClear
          prefix={<Icon name="user" size={14} color={colors.textTertiary} />}
        />
        <Input
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          suffix={<Icon name="lock" size={14} color={colors.textTertiary} />}
        />
        <Input placeholder="Estado: error" status="error" />
        <Input placeholder="Estado: warning" status="warning" />
        <Input placeholder="Deshabilitado" disabled />
        <View style={styles.row}>
          <Input placeholder="Large" size="large" style={styles.flex} />
          <Input placeholder="Small" size="small" style={styles.flex} />
        </View>
      </Section>

      <Section title="Checkbox">
        <Checkbox checked={agree} onChange={setAgree}>
          Acepto los términos
        </Checkbox>
        <Checkbox checked={newsletter} onChange={setNewsletter}>
          Suscribirme al boletín
        </Checkbox>
        <Checkbox indeterminate>Selección parcial</Checkbox>
        <Checkbox defaultChecked disabled>
          Deshabilitado marcado
        </Checkbox>
        <Checkbox disabled>Deshabilitado</Checkbox>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.bgLayout },
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    flexGrow: 1,
  },
  header: { gap: spacing.xxs },
  section: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: spacing.xs,
    backgroundColor: colors.bgContainer,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  row: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', alignItems: 'center' },
  rowAlign: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', flexWrap: 'wrap' },
  flex: { flex: 1 },
});
