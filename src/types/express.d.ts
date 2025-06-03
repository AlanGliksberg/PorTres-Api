import { User } from "@prisma/client";
import { Prisma } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user: User & { playerId?: number };
    }
  }
}
