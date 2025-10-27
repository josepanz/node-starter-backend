import { ConfigType } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { AppConfigType } from '@core/config/config-loader';
import { IJwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';

export class CryptoHelper {
  private static configService: ConfigType<AppConfigType>;

  public static initConfigService(cfgService: ConfigType<AppConfigType>) {
    this.configService = cfgService;
  }

  /**
   * Desencripta un valor utilizando la clave privada y el tipo de hash especificado.
   * @param value
   * @param hashType
   * @returns Buffer con el valor desencriptado.
   */
  public static decrypt(
    value: string,
    hashType: string,
  ): Buffer<ArrayBufferLike> {
    const decryptedBuffer = crypto.privateDecrypt(
      {
        key: this.configService.authentication.privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: hashType,
      },
      Buffer.from(value, 'base64'),
    );
    return decryptedBuffer;
  }

  /**
   * Verifica un token JWT.
   * @param token Token JWT a verificar.
   * @returns Payload del token si es válido.
   */
  public static async verifyJwt<T = IJwtPayload>(token: string): Promise<T> {
    try {
      return (await jwt.verify(
        token,
        this.configService.authentication.publicKey,
      )) as T;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
  /**
   * Genera un string aleatorio según la longitud indicada.
   * @param length
   * @returns valor aleatorio generado.
   */
  static generateRandomString(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Compara dos hashes utilizando bcrypt.
   * @param hash1 valor sin hashear.
   * @param hash2 valor hasheado.
   * @returns True si los hashes coinciden, false en caso contrario.
   */
  static compareHashes(hash1: string, hash2: string): boolean {
    return bcrypt.compareSync(hash1, hash2) as boolean;
  }

  /**
   * Hashea un valor utilizando bcrypt.
   * @param password
   * @returns Valor hasheado.
   */
  static hashValue(value: string): string {
    const salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(value, salt) as string;
  }

  /**
   * Genera un token JWT.
   * @param tokenType Tipo de token (access, refresh, etc).
   * @param payload Payload del token.
   * @param algorithm Algoritmo de firma (RS256, HS256, etc).
   * @param expires Expiración del token (ej: '1h', '7d').
   * @returns JWT generado.
   */
  static generateToken(
    tokenType: string,
    payload: IJwtPayload,
    algorithm: string,
    expires: string,
  ): string {
    return jwt.sign(
      {
        sub: payload.sub,
        email: payload.email,
        user: payload.user,
        tokenType: tokenType,
      },
      this.configService.authentication.privateKey,
      {
        algorithm: algorithm,
        expiresIn: expires,
      },
    ) as string;
  }

  /**
   * Verifica un token de refresh.
   * @param token Token JWT a verificar.
   * @returns Payload del token si es válido.
   */
  static async verifyRefreshToken(token: string): Promise<IJwtPayload> {
    try {
      return (await jwt.verifyAsync(
        token,
        this.configService.authentication.publicKey,
        {
          algorithms: ['RS256'],
        },
      )) as IJwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
