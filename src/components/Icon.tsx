import {
  AntDesign,
  type AntDesignIconName,
} from '@react-native-vector-icons/ant-design/static';
import { colors } from '../theme';

export type IconName = AntDesignIconName;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
};

export function Icon({ name, size = 16, color = colors.textPrimary }: Props) {
  return <AntDesign name={name} size={size} color={color} />;
}
