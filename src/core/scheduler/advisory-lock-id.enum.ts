/**
 * Ids de advisory lock de Postgres, centralizados para que dos jobs nunca compartan id por
 * accidente (un id repetido serializaría jobs no relacionados). Un job nuevo = una entrada nueva.
 */
export enum AdvisoryLockId {
  IdempotencyPurge = 910001,
  MessagePurge = 910002,
  SmsDeliveryPoll = 910003,
  AccountAnonymization = 910004,
}
