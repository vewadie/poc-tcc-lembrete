import { StyleSheet, Text, View } from 'react-native';

type Props = {
  carregando: boolean;
  temDiario: boolean;
  temTeste: boolean;
  horario: string;
};

function tituloDo({ carregando, temDiario, temTeste, horario }: Props) {
  if (carregando) return 'Lendo os lembretes agendados…';
  if (temDiario) return `Lembrete diário ativado para as ${horario}`;
  if (temTeste) return 'Lembrete de teste agendado';
  return 'Nenhum lembrete agendado';
}

export default function CartaoLembrete(props: Props) {
  const ativo = props.temDiario || props.temTeste;

  return (
    <View style={[styles.cartao, ativo ? styles.ativo : styles.inativo]}>
      <Text style={styles.titulo}>{tituloDo(props)}</Text>
      {props.temDiario && props.temTeste && (
        <Text style={styles.detalhe}>E um lembrete de teste a caminho.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  ativo: {
    backgroundColor: '#EDE9FF',
    borderColor: '#6C5CE7',
  },
  inativo: {
    backgroundColor: '#F5F5F5',
    borderColor: '#BDBDBD',
  },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  detalhe: {
    marginTop: 6,
    fontSize: 15,
    color: '#424242',
  },
});
