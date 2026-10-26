import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  titulo: string;
  cor: string;
  onPress: () => void;
};

export default function Botao({ titulo, cor, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.botao, { backgroundColor: cor, opacity: pressed ? 0.7 : 1 }]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={styles.texto}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  texto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
