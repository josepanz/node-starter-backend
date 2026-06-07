import { DocumentType } from '@prisma/client';

export interface IUploadedFileUrls {
  documentFrontImage?: string;
  documentBackImage?: string;
  commercialInvoiceImage?: string;
  businessLicenseImage?: string;
  storefrontImage?: string;
}

export interface IUploadFileParams {
  files: { [key: string]: Express.Multer.File[] };
  userId: string;
  referenceId: string;
  applicationId?: number;
  documentType?: DocumentType;
  documentNumber?: string;
}
