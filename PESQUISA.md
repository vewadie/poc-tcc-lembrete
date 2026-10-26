# Diário de pesquisa

## Contexto do TCC

O Apsicare é um app de acompanhamento psicológico (React Native + Expo) em que o paciente escreve um diário e sincroniza o smartwatch, e a psicóloga recebe tudo organizado entre as sessões. O diário só tem valor se o paciente escrever com frequência, e hoje o app não manda nenhum lembrete para ele (só a psicóloga recebe notificações).

## Pergunta de pesquisa

Como o `expo-notifications` pode lembrar o paciente, todo dia às 20h, de escrever no diário, usando notificações locais agendadas no próprio celular (sem servidor) e rodando no Expo Go?

## Alternativas consideradas

| Opção | Serve para | Funciona no Expo Go? | Decisão |
|-------|-----------|----------------------|---------|
| **Notificação local** (`expo-notifications`) | Lembrete em horário fixo, agendado pelo próprio celular | Sim, no Android e no iOS | **Sim**: o lembrete não depende de nada do servidor, e funciona mesmo sem internet. |
| Push remoto (Expo Push Service + `expo-notifications`) | Avisar quando algo acontece no servidor (ex.: a psicóloga respondeu) | **Não** no Android desde o SDK 53 (precisa de development build) | **Não** para o lembrete: precisaria de um servidor agendando, e não roda no Expo Go no Android. O Apsicare já usa push para a psicóloga. |
| Notifee | Notificações com mais controle de aparência no Android | Não, exige development build | **Não**: biblioteca de terceiros, mais complexa e não roda no Expo Go. |
| `expo-background-task` | Rodar código de tempos em tempos em segundo plano | Não serve para horário fixo | **Não**: quem decide quando a tarefa roda é o sistema, então não dá para garantir as 20h. |

## Como funciona (para o diagrama)

1. Ao abrir, o app cria o canal "Lembretes do diário" (obrigatório no Android 8+) e define como a notificação aparece com o app aberto.
2. Ao tocar num botão, o app pede a permissão de notificação. Se for negada, avisa e não agenda.
3. O app entrega o lembrete ao **sistema operacional** com um gatilho (`trigger`):
   - `TIME_INTERVAL` de 10 segundos, para testar;
   - `DAILY` às 20:00, para o lembrete de verdade.
4. A partir daí, quem dispara é o sistema: a notificação chega mesmo com o app fechado.
5. Ao abrir o app, ele pergunta ao sistema o que está agendado (`getAllScheduledNotificationsAsync`) e mostra na tela. "Cancelar" apaga tudo (`cancelAllScheduledNotificationsAsync`).

## Fontes oficiais lidas

- Expo — Notifications, SDK 58 (https://docs.expo.dev/versions/latest/sdk/notifications/)
- Tipos do pacote instalado: `node_modules/expo-notifications/build/NotificationScheduler.types.d.ts` (versão 58.1.6)

O que a documentação confirmou e entrou na prova de conceito:

- "Local notifications (in-app notifications) remain available in Expo Go"; só o push remoto deixou de funcionar no Expo Go no Android a partir do SDK 53.
- No Android 13, a janela que pede a permissão "não aparece até que pelo menos um canal de notificação seja criado". Por isso o canal é criado logo ao abrir o app, **antes** de pedir a permissão.
- No iOS a permissão deve ser lida pelo campo `ios.status`, não só pelo `status` geral. O código aceita também a permissão provisória, como no exemplo da documentação.
- `shouldShowAlert` está obsoleto: o certo é `shouldShowBanner` e `shouldShowList`.
- Os gatilhos precisam do campo `type` (`SchedulableTriggerInputTypes.TIME_INTERVAL`, `DAILY`).

## Onde a IA errou

**Erro 1: um campo que não existe no lembrete diário**
- Pedido: pedi a uma IA para resumir a página oficial do `expo-notifications` e listar os campos dos gatilhos `TIME_INTERVAL` e `DAILY`, e se aceitam `repeats` e `channelId`.
- O que veio: `DAILY: { type: 'daily', hour, minute, repeats?: boolean, channelId?, delivery? }` e a frase "os dois aceitam as propriedades `repeats` e `channelId`".
- Como percebi: conferindo a tabela `DailyTriggerInput` na própria documentação e o arquivo de tipos do pacote instalado.
- O certo: o `DAILY` tem só `type`, `hour`, `minute`, `channelId` e `delivery`. **Não existe `repeats`**: ele já repete todo dia por definição. O `repeats` existe no `TIME_INTERVAL`. O erro é sutil: mesmo resumindo uma página real, a IA "completou" a tabela com um campo de outro gatilho.

**Erro 2: o que a IA deixou de fora** (resposta de memória no `mapa-ia-antes-da-doc.md`)
- Pedido: o mapa do tema, de memória, antes de abrir a documentação.
- O que veio: "no Android é preciso criar um canal para as notificações aparecerem", sem dizer **quando** criar.
- Como percebi: lendo a seção de permissões da documentação.
- O certo: no Android 13 a janela de permissão nem aparece se nenhum canal existir. O canal precisa ser criado **antes** de pedir a permissão, por isso a ordem no código é essa.

**A conferir em uma segunda IA** (exercício 3 da apostila): rodar o mesmo prompt do mapa no ChatGPT ou no Gemini e anotar aqui onde as respostas divergem.

## Resultado e próximos passos no TCC

- A prova de conceito mostra que um lembrete diário funciona com notificação local, no Expo Go, sem servidor e sem internet: o próprio celular agenda, a notificação chega com o app fechado, e o agendamento continua depois de fechar e abrir o app.
- **O que muda no TCC:**
  1. Criar no Apsicare a opção "Lembrar de escrever no diário" no perfil do paciente, com o horário escolhido por ele (o gatilho `DAILY` aceita qualquer `hour`/`minute`).
  2. Usar **notificação local** para o lembrete e manter o push remoto só para o que vem do servidor (como os avisos para a psicóloga, que o app já tem).
  3. No logout, cancelar os lembretes, para o próximo usuário do aparelho não receber lembrete de outra pessoa.
  4. Criar o canal de notificação antes de pedir a permissão (no Android 13 a janela não aparece sem canal).
