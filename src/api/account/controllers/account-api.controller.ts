import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@common/decorators/user.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';
import { DeletionStatusResponseDTO } from '../dtos/account.dto';
import { AccountApiService } from '../services/account-api.service';

/** Autoservicio: cualquier usuario autenticado gestiona la baja de SU cuenta (sin permisos extra). */
@ApiTags('Account')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountApiController {
  constructor(private readonly account: AccountApiService) {}

  @Post('deletion')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar la baja de mi cuenta (período de gracia)',
    description:
      'Soft: la cuenta sigue activa hasta `scheduledAt`; luego se anonimiza. Cancelable antes.',
  })
  @ApiOkResponse({ type: DeletionStatusResponseDTO })
  @ApiConflictResponse({ description: 'Ya existe una solicitud en curso.' })
  async requestDeletion(
    @User() user: IUserDataOnJwt,
  ): Promise<DeletionStatusResponseDTO> {
    return await this.account.requestDeletion(user.id);
  }

  @Delete('deletion')
  @Version('1')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar mi solicitud de baja' })
  @ApiNoContentResponse()
  async cancelDeletion(@User() user: IUserDataOnJwt): Promise<void> {
    await this.account.cancelDeletion(user.id);
  }

  @Get('deletion')
  @Version('1')
  @ApiOperation({ summary: 'Estado de mi solicitud de baja' })
  @ApiOkResponse({ type: DeletionStatusResponseDTO })
  async status(
    @User() user: IUserDataOnJwt,
  ): Promise<DeletionStatusResponseDTO> {
    return await this.account.status(user.id);
  }
}
