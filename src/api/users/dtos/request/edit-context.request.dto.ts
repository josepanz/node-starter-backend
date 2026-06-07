import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UserStatus, AccessLevel } from '@prisma/client';

export class EditContextUserDTO {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  email!: string;

  @ApiPropertyOptional({ example: '4.123.456' })
  @IsString()
  @IsOptional()
  documentNumber?: string;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  status!: UserStatus;

  @ApiProperty({ example: false })
  @IsBoolean()
  isEmployee!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isLdap!: boolean;

  @ApiPropertyOptional({ example: 'Corrección de datos' })
  @IsString()
  @IsOptional()
  changedReason?: string;
}

export class EditContextAccessDTO {
  @ApiProperty({ enum: AccessLevel, example: AccessLevel.BRANCH })
  @IsEnum(AccessLevel)
  level!: AccessLevel;

  @ApiProperty({ type: [String], example: ['1', '2'] })
  @IsArray()
  @IsString({ each: true })
  branchCodes!: string[];
}

export class UpdateEditContextRequestDTO {
  @ApiPropertyOptional({ type: EditContextUserDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => EditContextUserDTO)
  user?: EditContextUserDTO;

  @ApiPropertyOptional({ type: [Number], example: [1, 2] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  roleIds?: number[];

  @ApiPropertyOptional({ type: EditContextAccessDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => EditContextAccessDTO)
  access?: EditContextAccessDTO;
}
