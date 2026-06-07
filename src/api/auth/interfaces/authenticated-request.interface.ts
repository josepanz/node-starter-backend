import { Request } from 'express';

export interface IAuthenticatedRequest extends Request {
  user: {
    email: string;
  };
  cookies: ICookies;
}

interface ICookies {
  refreshToken?: string;
}
