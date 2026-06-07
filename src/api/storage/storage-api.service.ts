import { PrismaDatasource } from '@core/database/services/prisma.service';
import { StorageService } from '@modules/storage/services/storage.service';
import { StorageUploadInput } from '@modules/storage/interfaces/storage.interface';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  IUploadFileParams,
  IUploadedFileUrls,
} from './interfaces/storage.interface';

@Injectable()
export class StorageApiService {
  constructor(
    private readonly storageService: StorageService,
    private readonly prisma: PrismaDatasource,
  ) {}

  async uploadFile(params: IUploadFileParams): Promise<void> {
    const { files, userId, referenceId, documentType, documentNumber } = params;

    await this.uploadFilesToStorage(files, referenceId, 1);
    await this.prisma.extended.users.update({
      where: { id: Number(userId) },
      data: {
        documentNumber: documentNumber,
        documentType: documentType,
      },
    });
  }

  private async uploadFilesToStorage(
    files: IUploadFileParams['files'],
    referenceId: string,
    applicationId: number,
  ): Promise<IUploadedFileUrls> {
    try {
      const uploadInputs = this.buildUploadInputs(
        files,
        referenceId,
        applicationId,
      );
      const uploadedFiles =
        await this.storageService.uploadFilesQueue(uploadInputs);

      return uploadedFiles.reduce<IUploadedFileUrls>((accumulator, file) => {
        if (file.id) {
          accumulator[file.id as keyof IUploadedFileUrls] = file.key;
        }

        return accumulator;
      }, {});
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to upload files to storage',
        { cause: error },
      );
    }
  }

  private buildUploadInputs(
    files: IUploadFileParams['files'],
    referenceId: string,
    applicationId: number,
  ): StorageUploadInput[] {
    return Object.entries(files).flatMap(([fieldName, fileGroup]) =>
      fileGroup.map((file) => ({
        id: fieldName,
        file,
        path: `onboarding/merchants/${referenceId}/${applicationId}`,
      })),
    );
  }
}
