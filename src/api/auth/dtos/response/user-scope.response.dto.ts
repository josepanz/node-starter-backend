import { ApiProperty } from '@nestjs/swagger';
import { AccessLevel } from '@prisma/client';
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class RoleScopeDTO {
  @ApiProperty({ example: 'merchant-admin' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Administrador del comercio', nullable: true })
  @IsString()
  @IsOptional()
  description?: string | null;
}

export class PermissionScopeDTO {
  @ApiProperty({ example: 'dashboard:read' })
  @IsString()
  name: string;
}

export class UserScopeResponseDTO {
  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      status: 'ACTIVE',
      profileStatus: 'COMPLETE',
      isEmployee: false,
      documentType: 'CI',
      documentNumber: '12345678',
      phoneNumber: '+595981234567',
    },
  })
  @IsObject()
  user: {
    id: string;
    email: string;
    phoneNumber: string | null;
    firstName: string;
    lastName: string;
    status: string;
    profileStatus: string;
    isEmployee: boolean;
    currentAccessLevel: AccessLevel;
  };

  @ApiProperty({ type: [RoleScopeDTO] })
  @IsArray()
  @IsOptional()
  roles?: RoleScopeDTO[];

  @ApiProperty({ type: [PermissionScopeDTO] })
  @IsArray()
  @IsOptional()
  permissions?: PermissionScopeDTO[];
}
