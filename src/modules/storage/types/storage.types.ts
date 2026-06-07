export type DeleteFileTarget =
  | string
  | {
      key: string;
      bucket?: string;
      id?: string;
    };

export type PresignedUrlTarget = string | StoragePresignedUrlInput;

export type StoragePresignedUrlInput = {
  key: string;
  bucket?: string;
  id?: string;
};
