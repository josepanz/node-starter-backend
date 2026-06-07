export const MERCHANT_DOC_FIELDS = [
  { name: 'documentFrontImage', maxCount: 1 },
  { name: 'documentBackImage', maxCount: 1 },
  { name: 'commercialInvoiceImage', maxCount: 1 },
  { name: 'businessLicenseImage', maxCount: 1 },
  { name: 'storefrontImage', maxCount: 1 },
];

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export enum DocumentTypeEnum {
  PAS,
  CAD,
  CIP,
  CIE,
  DNI,
  RUC,
  CRC,
}
