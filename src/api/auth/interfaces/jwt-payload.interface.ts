export interface IJwtPayload {
  sub: string; // referenceId del usuario
  email: string;
  status?: string;
  isEmployee?: boolean;
  firstName?: string;
  lastName?: string;
  tokenType: string; // 'accessToken' | 'refreshToken'
  iat: number;
  exp: number;
}
