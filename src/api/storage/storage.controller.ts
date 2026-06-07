import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { StorageApiService } from './storage-api.service';
import { JwtAuthGuard } from '@modules/auth/guards';
import { DocumentValidationDTO } from './dto/document-validation.dto';
import { DocumentType } from '@prisma/client';
import {
  ALLOWED_MIME_TYPES,
  MERCHANT_DOC_FIELDS,
} from './const/storage-api.enum';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';
import { User } from '@common/decorators/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  FileUploader,
  UploadedFilesValidated,
} from '@common/decorators/file-uploader.decorator';

@ApiTags('Storage')
@Controller('storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageApiService: StorageApiService) {}

  @Post('upload')
  @Version('1')
  @FileUploader({
    fields: MERCHANT_DOC_FIELDS,
    allowedTypes: ALLOWED_MIME_TYPES,
  })
  @ApiOperation({ summary: 'Carga archivos al storage.' })
  async uploadFile(
    @Body() body: DocumentValidationDTO,
    @UploadedFilesValidated() files: Record<string, Express.Multer.File[]>,
    @User() user: IUserDataOnJwt,
  ): Promise<void> {
    return await this.storageApiService.uploadFile({
      files,
      userId: String(user.id),
      referenceId: user.referenceId,
      documentType: body.documentType as DocumentType,
      documentNumber: body.documentNumber,
    });
  }
}
