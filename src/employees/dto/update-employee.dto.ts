import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EmployeeStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class UpdateEmployeeDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  positionId?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  departmentId?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  managerId?: number;

  @ApiProperty({ enum: EmployeeStatus, required: false })
  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}
