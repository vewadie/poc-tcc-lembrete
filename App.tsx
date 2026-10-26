import { NotificationRequest } from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';

import Botao from './components/Botao';
import CartaoLembrete from './components/CartaoLembrete';
import {
  HORARIO_DIARIO,
  agendarDiario,
  agendarTeste,
  cancelarTodos,
  configurarNotificacoes,
  garantirPermissao,
  listarAgendados,
  tipoDe,
} from './lembretes';

const SEM_PERMISSAO = 'Permita as notificações nos Ajustes do celular para receber lembretes';

export default function App() {
  const [agendados, setAgendados] = useState<NotificationRequest[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState('');

  const temDiario = agendados.some((pedido) => tipoDe(pedido) === 'diario');
  const temTeste = agendados.some((pedido) => tipoDe(pedido) === 'teste');

  const atualizar = useCallback(async () => {
    try {
      setAgendados(await listarAgendados());
    } catch (erro) {
      setMensagem(`Erro ao ler os lembretes: ${(erro as Error).message}`);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    configurarNotificacoes().then(atualizar);
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') atualizar();
    });
    return () => assinatura.remove();
  }, [atualizar]);

  async function agendar(acao: () => Promise<string>, sucesso: string) {
    try {
      if (!(await garantirPermissao())) {
        setMensagem(SEM_PERMISSAO);
        return;
      }
      await acao();
      setMensagem(sucesso);
      await atualizar();
    } catch (erro) {
      setMensagem(`Erro ao agendar: ${(erro as Error).message}`);
    }
  }

  async function cancelar() {
    try {
      await cancelarTodos();
      setMensagem('');
      await atualizar();
    } catch (erro) {
      setMensagem(`Erro ao cancelar: ${(erro as Error).message}`);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Apsicare · lembrete do diário</Text>
      <Text style={styles.subtitulo}>Prova de conceito com expo-notifications</Text>

      <CartaoLembrete carregando={carregando} temDiario={temDiario} temTeste={temTeste} horario={HORARIO_DIARIO} />

      <Botao
        titulo="Lembrar em 10 segundos"
        cor="#6C5CE7"
        onPress={() => agendar(agendarTeste, 'Saia do app e espere 10 segundos')}
      />
      <Botao
        titulo={`Lembrar todo dia às ${HORARIO_DIARIO.slice(0, 2)}h`}
        cor="#4A3F8C"
        onPress={() => agendar(agendarDiario, '')}
      />
      <Botao titulo="Cancelar lembretes" cor="#757575" onPress={cancelar} />

      {mensagem !== '' && <Text style={styles.mensagem}>{mensagem}</Text>}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 72,
    gap: 14,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A3F8C',
  },
  subtitulo: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  mensagem: {
    fontSize: 15,
    color: '#4A3F8C',
  },
});
