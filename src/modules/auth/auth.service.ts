import { Prisma, User } from "@prisma/client";
import prisma from "../../prisma/client";
import { hashPassword, verifyPassword } from "../../utils/hash";
import { signToken, verifyToken } from "../../utils/jwt";
import { OAuth2Client } from "google-auth-library";
import { creatUser } from "../../utils/auth";
import { CustomError } from "../../types/customError";
import { ErrorCode } from "../../constants/errorCode";
import { RegisterDTO, ChangePasswordDTO } from "../../types/auth";
import { isValidExpoPushToken } from "../../utils/player";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (data: RegisterDTO) => {
  let passwordHash: string;
  //TODO - validar contraseña
  // 8 chars min
  // 1 may 1 min
  // 1 numero
  passwordHash = await hashPassword(data.password!);
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new CustomError("User already exists", ErrorCode.USER_ALREADY_EXISTS);
  }

  const user = await creatUser({
    email: data.email,
    passwordHash,
    firstName: data.firstName.trim().replace(/\b\w/g, (char) => char.toUpperCase()),
    lastName: data.lastName.trim().replace(/\b\w/g, (char) => char.toUpperCase()),
    phoneNumber: data.phone?.trim() || null,
    dni: data.dni?.trim() || null,
    photoUrl: data.photoUrl?.trim() || null
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  };
};

export const login = async ({ email, password }: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({ where: { email }, include: { player: true } });
  if (!user || !user.passwordHash) throw new CustomError("Invalid credentials", ErrorCode.INVALID_CREDENTIALS);
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new CustomError("Invalid credentials", ErrorCode.INVALID_CREDENTIALS);
  return getToken(user);
};

export const loginWithGoogle = async (idToken: string) => {
  const ticket = await googleClient.verifyIdToken({ idToken });
  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.sub)
    throw new CustomError("Invalid Google token", ErrorCode.INVALID_GOOGLE_TOKEN);

  const user = await prisma.user.upsert({
    where: { googleId: payload.sub },
    create: {
      email: payload.email,
      firstName: payload.given_name || "",
      lastName: payload.family_name || "",
      photoUrl: payload.picture,
      googleId: payload.sub
    },
    update: {
      firstName: payload.given_name ?? undefined,
      lastName: payload.family_name ?? undefined,
      photoUrl: payload.picture ?? undefined,
      email: payload.email
    },
    include: { player: true }
  });
  
  return getToken(user);
};

export const refreshToken = async (token: string) => {
  const user = verifyToken(token) as User;
  const userDB = await prisma.user.findUnique({ where: { id: user.id }, include: { player: true } });
  return getToken(userDB!);
};

export const changePassword = async (userId: number, data: ChangePasswordDTO) => {
  // Buscar el usuario
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash) {
    throw new CustomError("Usuario no encontrado o sin contraseña", ErrorCode.INVALID_CREDENTIALS);
  }

  // Verificar la contraseña actual
  const isCurrentPasswordValid = await verifyPassword(data.currentPassword, user.passwordHash);
  if (!isCurrentPasswordValid) {
    throw new CustomError("Contraseña actual incorrecta", ErrorCode.INVALID_CREDENTIALS);
  }

  // Validar que la nueva contraseña sea diferente a la actual
  const isNewPasswordSame = await verifyPassword(data.newPassword, user.passwordHash);
  if (isNewPasswordSame) {
    throw new CustomError("La nueva contraseña debe ser diferente a la actual", ErrorCode.CREATE_PLAYER_INCORRECT_BODY);
  }

  // TODO - Validar contraseña nueva
  // 8 chars min
  // 1 may 1 min
  // 1 numero
  if (data.newPassword.length < 8) {
    throw new CustomError(
      "La nueva contraseña debe tener al menos 8 caracteres",
      ErrorCode.CREATE_PLAYER_INCORRECT_BODY
    );
  }

  // Hashear la nueva contraseña
  const newPasswordHash = await hashPassword(data.newPassword);

  // Actualizar la contraseña en la base de datos
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash }
  });
};

export const logout = async (userId: number, expoPushToken?: string) => {
  if (!expoPushToken) return;
  if (!isValidExpoPushToken(expoPushToken)) {
    throw new CustomError("Token push invalido", ErrorCode.INVALID_PUSH_TOKEN);
  }

  const player = await prisma.player.findUnique({
    where: { userId }
  });

  if (!player) return;

  await prisma.expoPushToken.deleteMany({
    where: {
      playerId: player.id,
      token: expoPushToken
    }
  });
};

const getToken = (
  user: Prisma.UserGetPayload<{
    include: { player: true };
  }>
) => {
  const { passwordHash, player, ...userWithoutPassword } = user;
  return signToken({ playerId: player?.id, ...userWithoutPassword });
};
