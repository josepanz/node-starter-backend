import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Response } from 'express';

import { APP_CONFIG } from '@core/config/config-loader';
import { parseTime } from '@common/helpers/date.helper';

@Injectable()
export class AuthCookieService {
  constructor(
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<typeof APP_CONFIG>,
  ) {}

  setAccessToken(res: Response, token: string): void {
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: parseTime(this.config.authentication.accessTokenExpires),
    });
  }

  setRefreshToken(res: Response, token: string, rememberMe: boolean): void {
    const expiry = rememberMe
      ? this.config.authentication.refreshTokenExpires
      : this.config.authentication.shortRefreshTokenExpires;

    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: parseTime(expiry),
    });
  }
}
