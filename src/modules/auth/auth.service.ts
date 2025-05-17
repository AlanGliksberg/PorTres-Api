import { Prisma, User } from "@prisma/client";
import prisma from "../../prisma/client";
import { hashPassword, verifyPassword } from "../../utils/hash";
import { signToken } from "../../utils/jwt";
import { OAuth2Client } from "google-auth-library";
import { creatUser } from "../../utils/auth";
import { CustomError } from "../../types/customError";
import { ErrorCode } from "../../constants/errorCode";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface RegisterDTO {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  dni?: string;
  photoUrl?: string;
  googleId?: string;
}

export const register = async (data: RegisterDTO) => {
  let passwordHash: string;
  //TODO - validar contraseña
  // 8 chars min
  // 1 may 1 min
  passwordHash = await hashPassword(data.password!);

  const user = await creatUser({
    email: data.email,
    passwordHash,
    firstName: data.firstName,
    lastName: data.lastName,
    dni: data.dni || null,
    photoUrl: data.photoUrl || null,
    googleId: data.googleId || null
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
  let user = await prisma.user.findUnique({ where: { googleId: payload.sub }, include: { player: true } });
  if (!user) {
    user = await creatUser({
      email: payload.email,
      firstName: payload.given_name || "",
      lastName: payload.family_name || "",
      photoUrl: payload.picture,
      googleId: payload.sub
    });
  }
  return getToken(user);
};

const getToken = (
  user: Prisma.UserGetPayload<{
    include: { player: true };
  }>
) => {
  const { passwordHash, player, ...userWithoutPassword } = user;
  return signToken({ playerId: player?.id, ...userWithoutPassword });
};
