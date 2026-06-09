import { Inject, Injectable } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { CreateDailyRecordDto } from './dto/create-daily-record.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class DailyRecordsService {
  constructor(
    @Inject(DB_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async createBulk(supervisorId: number, records: CreateDailyRecordDto[]) {
    const values = records.map((record) => ({
      employeeId: record.employeeId,
      supervisorId: supervisorId,
      recordDate: record.recordDate,
      category: record.category as any, // Cast to match schema enum
      description: record.description,
    }));

    return this.db.insert(schema.dailyRecords).values(values).returning();
  }

  async findAllByEmployee(employeeId: number) {
    return this.db
      .select()
      .from(schema.dailyRecords)
      .where(eq(schema.dailyRecords.employeeId, employeeId));
  }

  async findAllBySupervisor(supervisorId: number) {
    return this.db
      .select()
      .from(schema.dailyRecords)
      .where(eq(schema.dailyRecords.supervisorId, supervisorId));
  }
}
