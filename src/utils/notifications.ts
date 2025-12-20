import { CustomError } from "../types/customError";
import { ErrorCode } from "../constants/errorCode";
import {
  BroadcastBodyInput,
  BroadcastMessageInput,
  BroadcastPushBody,
  BroadcastPushMessage
} from "../types/notifications";

const parseBroadcastMessage = (message: BroadcastMessageInput | null | undefined): BroadcastPushMessage => {
  const title = typeof message?.title === "string" ? message.title.trim() : "";
  const body =
    typeof message?.body === "string"
      ? message.body.trim()
      : typeof message?.message === "string"
        ? message.message.trim()
        : "";

  return { title, body };
};

export const parseBroadcastPushBody = (body: BroadcastBodyInput | null | undefined): BroadcastPushBody => {
  if (!body) return { messages: [] };

  if (Array.isArray(body.messages)) {
    const messages = body.messages
      .map(parseBroadcastMessage)
      .filter((msg: BroadcastPushMessage) => msg.title || msg.body);
    return { messages };
  }

  if (body.title || body.body || body.message) {
    const message = parseBroadcastMessage(body);
    return { messages: message.title || message.body ? [message] : [] };
  }

  return { messages: [] };
};

export const validateBroadcastPushBody = (body: BroadcastPushBody) => {
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 2) {
    throw new CustomError("Body incorrecto", ErrorCode.BROADCAST_INCORRECT_BODY);
  }

  body.messages.forEach((message, index) => {
    if (!message.title || message.title.trim().length === 0) {
      throw new CustomError(`Titulo ${index + 1} es requerido`, ErrorCode.BROADCAST_INCORRECT_BODY);
    }

    if (!message.body || message.body.trim().length === 0) {
      throw new CustomError(`Mensaje ${index + 1} es requerido`, ErrorCode.BROADCAST_INCORRECT_BODY);
    }
  });
};
