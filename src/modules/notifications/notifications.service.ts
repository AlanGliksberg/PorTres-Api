import { ExpoPushMessage } from "expo-server-sdk";
import prisma from "../../prisma/client";
import { BroadcastPushBody } from "../../types/notifications";
import { preparePlayerTokens, pruneInvalidTokens, sendExpoMessages, PreparedExpoToken } from "./expo.service";

export const sendBroadcastPush = async (data: BroadcastPushBody) => {
  const playersWithTokens = await prisma.player.findMany({
    where: {
      expoPushTokens: {
        some: {}
      }
    },
    include: {
      expoPushTokens: true
    }
  });

  const messages: ExpoPushMessage[] = [];
  const preparedTokensForMessages: PreparedExpoToken[] = [];
  const hasTwoMessages = data.messages.length === 2;
  const [evenMessage, oddMessage] = data.messages;

  let targetedPlayers = 0;

  for (const player of playersWithTokens) {
    const playerTokens = preparePlayerTokens(player.expoPushTokens);
    if (playerTokens.length === 0) continue;

    targetedPlayers++;

    const messageToSend = hasTwoMessages ? (player.id % 2 === 0 ? evenMessage : oddMessage) : data.messages[0];

    playerTokens.forEach((token) => {
      preparedTokensForMessages.push(token);
      messages.push({
        to: token.token,
        sound: "default",
        priority: "high",
        title: messageToSend.title,
        body: messageToSend.body,
        data: {
          type: "broadcast",
          playerId: player.id
        }
      });
    });
  }

  if (messages.length === 0) {
    return {
      delivered: 0,
      failed: 0,
      targetedPlayers: 0,
      targetedTokens: 0
    };
  }

  const tickets = await sendExpoMessages(messages);
  await pruneInvalidTokens(preparedTokensForMessages, tickets);

  const delivered = tickets.filter((ticket) => ticket.status === "ok").length;
  const failed = tickets.length - delivered;

  return {
    delivered,
    failed,
    targetedPlayers,
    targetedTokens: messages.length
  };
};
