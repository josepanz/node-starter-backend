/** Forma del error de axios que el SDK de Infobip devuelve COMO VALOR cuando falla red/HTTP. */
export interface IInfobipAxiosError extends Error {
  isAxiosError: true;
  code?: string;
  response?: {
    status?: number;
    data?: { requestError?: { serviceException?: { text?: string } } };
  };
}

export interface IInfobipStatus {
  groupName: string;
  name?: string;
  description?: string;
}

export interface IInfobipMessageLog {
  messageId: string;
  status: IInfobipStatus;
  error?: IInfobipStatus;
}

export interface IInfobipHttpResponse<T> {
  data: T;
  status: number;
}

export interface IInfobipSendPayload {
  type: 'text';
  messages: {
    destinations: { to: string }[];
    text: string;
    from?: string;
  }[];
}

export interface IInfobipSendResponse {
  messages: { to: string; status: IInfobipStatus; messageId: string }[];
}

/**
 * Parte del cliente del SDK que se usa. El SDK tipa `channels` como `any`: esta interfaz da el
 * tipo necesario sin propagar `any` al resto del código.
 */
export interface IInfobipClient {
  channels: {
    sms: {
      send(
        payload: IInfobipSendPayload,
      ): Promise<IInfobipHttpResponse<IInfobipSendResponse>>;
      reports: {
        get(filter: {
          limit?: number;
        }): Promise<IInfobipHttpResponse<{ results: IInfobipMessageLog[] }>>;
      };
      logs: {
        get(filter: {
          messageId: string;
        }): Promise<IInfobipHttpResponse<{ results: IInfobipMessageLog[] }>>;
      };
    };
  };
}
