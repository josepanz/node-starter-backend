import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@common/decorators/user.decorator';
import { WithPermissions } from '@common/decorators/with-permissions.decorator';
import { PERMISSIONS } from '@common/enum/permissions.enum';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';
import {
  ListNotificationsRequestDTO,
  NotificationResponseDTO,
  NotificationsListResponseDTO,
  RegisterSubscriptionRequestDTO,
  SubscriptionResponseDTO,
  TestNotificationResponseDTO,
  UnreadCountResponseDTO,
} from '../dtos/notifications.dto';
import { NotificationsApiService } from '../services/notifications-api.service';

@ApiTags('Notifications (demo)')
@Controller('notifications')
export class NotificationsApiController {
  constructor(private readonly service: NotificationsApiService) {}

  @Post('subscriptions')
  @Version('1')
  @WithPermissions([PERMISSIONS.NOTIFICATION.UPDATE])
  @ApiOperation({ summary: 'Registrar una suscripción push (FCM o Web Push)' })
  @ApiCreatedResponse({ type: SubscriptionResponseDTO })
  async register(
    @Body() dto: RegisterSubscriptionRequestDTO,
    @User() user: IUserDataOnJwt,
  ): Promise<SubscriptionResponseDTO> {
    return await this.service.registerSubscription(user.id, dto);
  }

  @Delete('subscriptions/:id')
  @Version('1')
  @HttpCode(HttpStatus.NO_CONTENT)
  @WithPermissions([PERMISSIONS.NOTIFICATION.UPDATE])
  @ApiOperation({ summary: 'Eliminar una suscripción propia' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'No existe o es de otro usuario.' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User() user: IUserDataOnJwt,
  ): Promise<void> {
    await this.service.removeSubscription(user.id, id);
  }

  @Get()
  @Version('1')
  @WithPermissions([PERMISSIONS.NOTIFICATION.READ])
  @ApiOperation({ summary: 'Mis notificaciones (paginado)' })
  @ApiOkResponse({ type: NotificationsListResponseDTO })
  async list(
    @Query() query: ListNotificationsRequestDTO,
    @User() user: IUserDataOnJwt,
  ): Promise<NotificationsListResponseDTO> {
    return await this.service.list(user.id, query);
  }

  @Get('unread-count')
  @Version('1')
  @WithPermissions([PERMISSIONS.NOTIFICATION.READ])
  @ApiOperation({ summary: 'Contador de notificaciones sin leer' })
  @ApiOkResponse({ type: UnreadCountResponseDTO })
  async unreadCount(
    @User() user: IUserDataOnJwt,
  ): Promise<UnreadCountResponseDTO> {
    return await this.service.unreadCount(user.id);
  }

  @Post('test')
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  @WithPermissions([PERMISSIONS.NOTIFICATION.CREATE])
  @ApiOperation({
    summary: 'Enviarme una notificación de prueba',
    description: 'Demo del fan-out: bandeja in-app + push a mis suscripciones.',
  })
  @ApiCreatedResponse({ type: TestNotificationResponseDTO })
  async sendTest(
    @User() user: IUserDataOnJwt,
  ): Promise<TestNotificationResponseDTO> {
    return await this.service.sendTest(user.id);
  }

  @Patch(':referenceId/read')
  @Version('1')
  @WithPermissions([PERMISSIONS.NOTIFICATION.UPDATE])
  @ApiOperation({ summary: 'Marcar una notificación propia como leída' })
  @ApiOkResponse({ type: NotificationResponseDTO })
  @ApiNotFoundResponse({ description: 'No existe o es de otro usuario.' })
  async markRead(
    @Param('referenceId', ParseUUIDPipe) referenceId: string,
    @User() user: IUserDataOnJwt,
  ): Promise<NotificationResponseDTO> {
    return await this.service.markRead(user.id, referenceId);
  }
}
