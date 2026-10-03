import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WithPermissions } from '@common/decorators/with-permissions.decorator';
import { CallerContext } from '@common/decorators/caller-context.decorator';
import { User } from '@common/decorators/user.decorator';
import { PERMISSIONS } from '@common/enum/permissions.enum';
import { ICallerContext } from '@common/interfaces/caller-context.interface';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';
import { Idempotent } from '@modules/idempotency/decorators/idempotency.decorators';
import { OrdersApiService } from '../services/orders-api.service';
import { OrdersApiDocs } from '../docs/orders-api.docs';
import {
  CreateOrderRequestDTO,
  ListOrdersRequestDTO,
  UpdateOrderStatusRequestDTO,
} from '../dtos/request';
import {
  OrderResponseDTO,
  OrdersListResponseDTO,
} from '../dtos/response/order.response.dto';

@ApiTags('Orders (demo)')
@Controller('orders')
export class OrdersApiController {
  constructor(private readonly ordersApiService: OrdersApiService) {}

  @Post()
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  @WithPermissions([PERMISSIONS.ORDER.CREATE])
  @Idempotent()
  @OrdersApiDocs.create
  async create(
    @Body() dto: CreateOrderRequestDTO,
    @User() user: IUserDataOnJwt,
    @CallerContext() caller: ICallerContext,
  ): Promise<OrderResponseDTO> {
    return await this.ordersApiService.create(dto, user, caller);
  }

  @Get()
  @Version('1')
  @WithPermissions([PERMISSIONS.ORDER.READ, PERMISSIONS.ADMIN.ALL], {
    mode: 'any',
  })
  @OrdersApiDocs.list
  async list(
    @Query() query: ListOrdersRequestDTO,
    @User() user: IUserDataOnJwt,
  ): Promise<OrdersListResponseDTO> {
    return await this.ordersApiService.list(query, user);
  }

  @Get(':referenceId')
  @Version('1')
  @WithPermissions([PERMISSIONS.ORDER.READ, PERMISSIONS.ADMIN.ALL], {
    mode: 'any',
  })
  @OrdersApiDocs.findOne
  async findOne(
    @Param('referenceId', ParseUUIDPipe) referenceId: string,
    @User() user: IUserDataOnJwt,
  ): Promise<OrderResponseDTO> {
    return await this.ordersApiService.findOne(referenceId, user);
  }

  @Patch(':referenceId/status')
  @Version('1')
  @WithPermissions([PERMISSIONS.ORDER.UPDATE, PERMISSIONS.ADMIN.ALL], {
    mode: 'any',
  })
  @OrdersApiDocs.updateStatus
  async updateStatus(
    @Param('referenceId', ParseUUIDPipe) referenceId: string,
    @Body() dto: UpdateOrderStatusRequestDTO,
    @User() user: IUserDataOnJwt,
  ): Promise<OrderResponseDTO> {
    return await this.ordersApiService.updateStatus(referenceId, dto, user);
  }
}
