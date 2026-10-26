# Mapa do tema respondido pela IA, antes de abrir a documentação

IA: Claude (Anthropic), sem consultar a documentação, em 26/10/2026.

Prompt: "Estou fazendo meu TCC: o Apsicare, um app de acompanhamento psicológico em que o paciente escreve um diário e a psicóloga recebe as anotações. Preciso resolver o seguinte problema: o paciente esquece de escrever no diário e o app não manda nenhum lembrete para ele. O app é feito com React Native e Expo, em TypeScript. Quais são as alternativas para resolver isso nesse ecossistema? Para cada uma, diga em uma frase quando ela é a melhor escolha e quando não é, e indique a página da documentação oficial que eu devo ler. Não escreva código ainda."

Resposta (de memória):

1. Notificação local com expo-notifications: o próprio celular agenda o lembrete, sem servidor. Melhor escolha para lembrete em horário fixo. Funciona no Expo Go, em Android e iOS. Doc: docs.expo.dev/versions/latest/sdk/notifications
2. Push remoto (Expo Push Service + expo-notifications): o servidor manda a notificação. Melhor quando o lembrete depende de algo que acontece no servidor (ex.: a psicóloga respondeu). Não funciona no Expo Go no Android desde o SDK 53; precisa de development build. Doc: docs.expo.dev/push-notifications/overview
3. Notifee: biblioteca de terceiros com mais controle de aparência no Android. Exige development build. Doc: notifee.app
4. expo-background-task / tarefas em segundo plano: rodar código periodicamente. Não é a melhor escolha para lembrete, porque o sistema decide quando roda (não garante horário). Doc: docs.expo.dev/versions/latest/sdk/background-task

Detalhes que a IA afirmou sobre o expo-notifications:
- Instalar com `npx expo install expo-notifications`.
- Pedir permissão com `requestPermissionsAsync()`; no Android 13+ isso pede a permissão POST_NOTIFICATIONS.
- No Android é preciso criar um canal (`setNotificationChannelAsync`) para as notificações aparecerem.
- Agendar com `scheduleNotificationAsync({ content, trigger })`.
- Lembrete em segundos: trigger `{ type: SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 10 }`.
- Lembrete diário: trigger `{ type: SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 0 }`.
- Para a notificação aparecer com o app aberto, configurar `setNotificationHandler` com `shouldShowBanner` e `shouldShowList`.
- Cancelar com `cancelScheduledNotificationAsync(id)` ou `cancelAllScheduledNotificationsAsync()`; listar com `getAllScheduledNotificationsAsync()`.
- O lembrete aparece mesmo com o app fechado, porque quem dispara é o sistema operacional.
