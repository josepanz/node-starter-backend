import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from '@core/database/database.module';
import { UsersRepository } from './repository/users.repository';

@Module({
  imports: [DatabaseModule],
  exports: [UsersService],
  controllers: [],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
