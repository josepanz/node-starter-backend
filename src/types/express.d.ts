import { UserPayload } from '@/auth/types/user-payload'; // o donde esté tu tipo de usuario

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
