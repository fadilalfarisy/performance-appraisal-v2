import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RecordCategory {
  QUALITY = 'QUALITY',
  QUANTITY = 'QUANTITY',
  ATTENDANCE = 'ATTENDANCE',
  RESPONSIBILITY = 'RESPONSIBILITY',
}

export class CreateDailyRecordDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  employeeId: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  recordDate: string;

  @ApiProperty({ enum: RecordCategory })
  @IsEnum(RecordCategory)
  @IsNotEmpty()
  category: RecordCategory;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class BulkCreateDailyRecordsDto {
  @ApiProperty({ type: [CreateDailyRecordDto] })
  @IsNotEmpty()
  records: CreateDailyRecordDto[];
}
