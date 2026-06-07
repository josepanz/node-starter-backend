/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ConfigType } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { AppConfigType } from '@core/config/config-loader';
import { IJwtPayload } from '@api/auth/interfaces/jwt-payload.interface';
import { Algorithm } from 'jsonwebtoken';

export class CryptoHelper {
  private static configService: ConfigType<AppConfigType>;

  public static initConfigService(cfgService: ConfigType<AppConfigType>) {
    this.configService = cfgService;
  }

  /**
   * Asegura que la clave tenga el formato PEM correcto con saltos de línea reales.
   */
  private static formatKey(key: string): string {
    if (!key) return '';
    // Reemplaza los saltos de línea literales "\\n" por el caracter de salto de línea real "\n"
    return key.replace(/\\n/g, '\n');
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
  public static verifyJwt<T = IJwtPayload>(token: string): T {
    try {
      return jwt.verify(
        token,
        this.configService.authentication.publicKey,
      ) as T;
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
    return bcrypt.compareSync(hash1, hash2);
  }

  /**
   * Hashea un valor utilizando bcrypt.
   * @param password
   * @returns Valor hasheado.
   */
  static hashValue(value: string): string {
    const salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(value, salt);
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
    payload: Record<string, unknown>,
    algorithm: Algorithm,
    expires: string,
  ): string {
    return jwt.sign(
      {
        ...payload,
        tokenType: tokenType,
      },
      this.configService.authentication.privateKey,
      {
        algorithm: algorithm,
        expiresIn: expires,
      },
    );
  }

  /**
   * Verifica un token de refresh.
   * @param token Token JWT a verificar.
   * @returns Payload del token si es válido.
   */
  static verifyRefreshToken(token: string): IJwtPayload {
    const publicKey = this.formatKey(
      this.configService.authentication.publicKey,
    );

    try {
      return jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
      }) as IJwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Función auxiliar para encriptar valores bajo la llave publica
   * @param value valor en claro
   * @returns valor encriptado en formato base64
   */
  public static encrypt(value: string): string {
    const encrypted = crypto.publicEncrypt(
      {
        key: this.configService.authentication.publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(value, 'utf-8'),
    );
    return encrypted.toString('base64');
  }
}
