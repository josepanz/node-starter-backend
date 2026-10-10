import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Notification, PushChannel, PushSubscription } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { PaginationResponseDTO } from '@common/dtos/pagination.dto';

export class RegisterSubscriptionRequestDTO {
  @ApiProperty({ enum: PushChannel })
  @IsEnum(PushChannel)
  channel!: PushChannel;

  @ApiProperty({ description: 'Token FCM o endpoint Web Push.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  token!: string;

  @ApiPropertyOptional({ description: 'Requerido para WEBPUSH.' })
  @ValidateIf((o: RegisterSubscriptionRequestDTO) => o.channel === 'WEBPUSH')
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  p256dh?: string;

  @ApiPropertyOptional({ description: 'Requerido para WEBPUSH.' })
  @ValidateIf((o: RegisterSubscriptionRequestDTO) => o.channel === 'WEBPUSH')
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  auth?: string;
}

export class SubscriptionResponseDTO {
  @ApiProperty() id!: number;
  @ApiProperty({ enum: PushChannel }) channel!: PushChannel;
  @ApiProperty() active!: boolean;
  @ApiProperty() createdAt!: Date;

  static fromEntity(subscription: PushSubscription): SubscriptionResponseDTO {
    return {
      id: subscription.id,
      channel: subscription.channel,
      active: subscription.active,
      createdAt: subscription.createdAt,
    };
  }
}

export class ListNotificationsRequestDTO {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10;

  @ApiPropertyOptional({ description: 'Solo las no leídas.' })
  @IsOptional()
  @Transform(
    ({ value }: { value: unknown }) => value === 'true' || value === true,
  )
  @IsBoolean()
  unreadOnly?: boolean;
}

export class NotificationResponseDTO {
  @ApiProperty() referenceId!: string;
  @ApiProperty() title!: string;
  @ApiProperty() body!: string;
  @ApiPropertyOptional({ nullable: true, type: Object }) data!: unknown;
  @ApiProperty() requiresAction!: boolean;
  @ApiPropertyOptional({ nullable: true }) readAt!: Date | null;
  @ApiProperty() createdAt!: Date;

  static fromEntity(notification: Notification): NotificationResponseDTO {
    return {
      referenceId: notification.referenceId,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      requiresAction: notification.requiresAction,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }
}

export class NotificationsListResponseDTO {
  @ApiProperty({ type: [NotificationResponseDTO] })
  data!: NotificationResponseDTO[];

  @ApiProperty({ type: PaginationResponseDTO })
  pagination!: PaginationResponseDTO;
}

export class UnreadCountResponseDTO {
  @ApiProperty({ example: 3 }) unread!: number;
}

export class TestNotificationResponseDTO {
  @ApiProperty({ type: NotificationResponseDTO })
  notification!: NotificationResponseDTO;
  @ApiProperty() sent!: number;
  @ApiProperty() gone!: number;
  @ApiProperty() failed!: number;
}
