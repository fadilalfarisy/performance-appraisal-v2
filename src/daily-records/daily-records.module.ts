import { Module } from '@nestjs/common';
import { DailyRecordsService } from './daily-records.service';
import { DailyRecordsController } from './daily-records.controller';

@Module({
  providers: [DailyRecordsService],
  controllers: [DailyRecordsController],
  exports: [DailyRecordsService],
})
export class DailyRecordsModule {}
