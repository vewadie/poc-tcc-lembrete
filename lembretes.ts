import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CANAL = 'lembretes';
const HORA_DIARIO = 20;
const MINUTO_DIARIO = 0;

export type TipoLembrete = 'teste' | 'diario';

const CONTEUDO = {
  title: 'Como foi seu dia?',
  body: 'Que tal escrever no diário do Apsicare?',
};

export const HORARIO_DIARIO = `${String(HORA_DIARIO).padStart(2, '0')}:${String(MINUTO_DIARIO).padStart(2, '0')}`;

export async function configurarNotificacoes() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Lembretes do diário',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

function permitido(status: Notifications.NotificationPermissionsStatus) {
  return status.granted || status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function garantirPermissao() {
  const atual = await Notifications.getPermissionsAsync();
  if (permitido(atual)) return true;
  if (!atual.canAskAgain) return false;
  return permitido(await Notifications.requestPermissionsAsync());
}

export function tipoDe(pedido: Notifications.NotificationRequest): TipoLembrete | undefined {
  return pedido.content.data?.tipo as TipoLembrete | undefined;
}

export function agendarTeste() {
  return Notifications.scheduleNotificationAsync({
    content: { ...CONTEUDO, data: { tipo: 'teste' } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
      channelId: CANAL,
    },
  });
}

export async function agendarDiario() {
  const agendados = await Notifications.getAllScheduledNotificationsAsync();
  const diariosAntigos = agendados.filter((pedido) => tipoDe(pedido) === 'diario');
  await Promise.all(
    diariosAntigos.map((pedido) => Notifications.cancelScheduledNotificationAsync(pedido.identifier)),
  );

  return Notifications.scheduleNotificationAsync({
    content: { ...CONTEUDO, data: { tipo: 'diario' } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: HORA_DIARIO,
      minute: MINUTO_DIARIO,
      channelId: CANAL,
    },
  });
}

export function listarAgendados() {
  return Notifications.getAllScheduledNotificationsAsync();
}

export function cancelarTodos() {
  return Notifications.cancelAllScheduledNotificationsAsync();
}
