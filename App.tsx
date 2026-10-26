import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Botao from './components/Botao';
import { agendarTeste, configurarNotificacoes, garantirPermissao } from './lembretes';

export default function App() {
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    configurarNotificacoes();
  }, []);

  async function lembrarEmDezSegundos() {
    try {
      await garantirPermissao();
      await agendarTeste();
      setMensagem('Saia do app e espere 10 segundos');
    } catch (erro) {
      setMensagem(`Erro ao agendar: ${(erro as Error).message}`);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Apsicare · lembrete do diário</Text>
      <Text style={styles.subtitulo}>Prova de conceito com expo-notifications</Text>

      <Botao titulo="Lembrar em 10 segundos" cor="#6C5CE7" onPress={lembrarEmDezSegundos} />

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
