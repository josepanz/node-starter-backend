import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  GatewayTimeoutException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import { CustomHttpResponseHelper } from './custom-http-response-helper.helper';

const response = (status: number, statusText = 'txt') =>
  ({ status, statusText }) as AxiosResponse;

describe('CustomHttpResponseHelper', () => {
  describe('handleResponse', () => {
    it.each([
      [404, NotFoundException],
      [400, BadRequestException],
      [401, UnauthorizedException],
      [403, ForbiddenException],
      [500, InternalServerErrorException],
    ])('status %i lanza la excepción mapeada', (status, exception) => {
      expect(() =>
        CustomHttpResponseHelper.handleResponse(response(status)),
      ).toThrow(exception);
    });

    it('status no mapeado conserva el código en HttpException', () => {
      let caught: unknown;
      try {
        CustomHttpResponseHelper.handleResponse(response(418, 'teapot'));
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(HttpException);
      expect((caught as HttpException).getStatus()).toBe(418);
      expect((caught as HttpException).message).toContain('teapot');
    });
  });

  describe('handleAxiosError', () => {
    const axiosError = (code?: string, resp?: AxiosResponse) =>
      ({ code, response: resp, message: 'm' }) as AxiosError;

    it('delega en handleResponse cuando hay respuesta', () => {
      expect(() =>
        CustomHttpResponseHelper.handleAxiosError(
          axiosError(undefined, response(404)),
        ),
      ).toThrow(NotFoundException);
    });

    it.each([
      ['ECONNABORTED', GatewayTimeoutException],
      ['ETIMEDOUT', GatewayTimeoutException],
      ['ECONNREFUSED', ServiceUnavailableException],
      ['ECONNRESET', ServiceUnavailableException],
      ['EPIPE', ServiceUnavailableException],
      ['EHOSTUNREACH', ServiceUnavailableException],
      ['ENETUNREACH', ServiceUnavailableException],
      ['ENOTFOUND', BadGatewayException],
      ['OTRO', InternalServerErrorException],
    ])('código %s', (code, exception) => {
      expect(() =>
        CustomHttpResponseHelper.handleAxiosError(axiosError(code)),
      ).toThrow(exception);
    });
  });
});
