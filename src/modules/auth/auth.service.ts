import prisma from '../../prisma/client';
import { hashPassword, verifyPassword } from '../../utils/hash';
import { signToken } from '../../utils/jwt';
import { OAuth2Client } from 'google-auth-library';

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
  passwordHash = await hashPassword(data.password!);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      dni: data.dni,
      photoUrl: data.photoUrl,
      googleId: data.googleId
    }
  });
  return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
};

export const login = async ({ email, password }: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw new Error('Invalid credentials');
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');
  return signToken({ userId: user.id });
};

export const loginWithGoogle = async (idToken: string) => {
  const ticket = await googleClient.verifyIdToken({ idToken });
  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.sub) throw new Error('Invalid Google token');
  let user = await prisma.user.findUnique({ where: { googleId: payload.sub } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: payload.email,
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        photoUrl: payload.picture,
        googleId: payload.sub
      }
    });
  }
  return signToken({ userId: user.id });
};
