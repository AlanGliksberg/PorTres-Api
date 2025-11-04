import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import prisma from "../../prisma/client";
import { ExpoPushToken } from "@prisma/client";
import { isValidExpoPushToken } from "../../utils/player";

const expoAccessToken = process.env.EXPO_ACCESS_TOKEN;

const expo = new Expo({
  accessToken: expoAccessToken
});

const INVALID_TOKEN_ERRORS = new Set(["DeviceNotRegistered", "MessageTooBig", "InvalidCredentials", "InvalidPushToken"]);

export type PreparedExpoToken = {
  token: string;
  record: ExpoPushToken;
};

export const preparePlayerTokens = (playerTokens: ExpoPushToken[]): PreparedExpoToken[] => {
  return playerTokens
    .map((token) => ({
      token: token.token.trim(),
      record: token
    }))
    .filter(({ token }) => isValidExpoPushToken(token));
};

export const sendExpoMessages = async (messages: ExpoPushMessage[]) => {
  const chunks = expo.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("[Notifications][Expo] Error enviando chunk", error);
      tickets.push(
        ...chunk.map(
          (): ExpoPushTicket => ({
            status: "error",
            message: (error as Error)?.message ?? "Expo chunk failed"
          })
        )
      );
    }
  }

  return tickets;
};

export const pruneInvalidTokens = async (preparedTokens: PreparedExpoToken[], tickets: ExpoPushTicket[]) => {
  const invalidTokens = new Set<string>();

  tickets.forEach((ticket, index) => {
    if (ticket.status === "error") {
      const errorCode = ticket.details && "error" in ticket.details ? (ticket.details as any).error : undefined;
      if (errorCode && INVALID_TOKEN_ERRORS.has(errorCode)) {
        invalidTokens.add(preparedTokens[index]?.token);
      }
    }
  });

  if (invalidTokens.size === 0) return;

  await prisma.expoPushToken.deleteMany({
    where: {
      token: {
        in: Array.from(invalidTokens)
      }
    }
  });

  console.log(`[Notifications][Expo] Tokens inválidos removidos: ${invalidTokens.size}`);
};
