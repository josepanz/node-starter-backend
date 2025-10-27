import { Users } from '@prisma/client';

export interface IJwtPayload {
  sub: string;
  email: string;
  user?: Users;
}

export interface IPasswordPayload {
  id: number;
  email: string;
  password: string;
}

export interface ICreatePasswordPayload {
  id: number;
  email: string;
  password: string;
}

export interface IChangePasswordPayload {
  id: number;
  email: string;
  oldPassword: string;
  newPassword: string;
}
export interface IForgotPasswordPayload {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IRefreshTokenPayload {
  email: string;
  refreshToken: string;
  userAgent: string;
}
