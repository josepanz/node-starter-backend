import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { AuthService } from '@modules/auth/services/auth.service';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
