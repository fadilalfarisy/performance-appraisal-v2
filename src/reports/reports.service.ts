import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(DB_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findOne(id: number) {
    const result = await this.db
      .select()
      .from(schema.reports)
      .where(eq(schema.reports.id, id))
      .limit(1);
    if (!result[0])
      throw new NotFoundException(`Report with ID ${id} not found`);
    return result[0];
  }

  async updateStatus(
    id: number,
    status: any,
    approverId: number,
    note?: string,
  ) {
    const report = await this.findOne(id);

    return this.db.transaction(async (tx) => {
      // 1. Update report status
      await tx
        .update(schema.reports)
        .set({ status })
        .where(eq(schema.reports.id, id));

      // 2. Record approval/rejection action
      await tx.insert(schema.reportApprovals).values({
        reportId: id,
        approverId,
        status:
          status === 'DONE' || status === 'SUBMITTED' || status === 'APPROVED'
            ? 'APPROVED'
            : 'REJECTED',
        note,
      });

      return { id, status };
    });
  }

  // 1. HOD Review
  async hodSubmit(id: number, approverId: number) {
    const report = await this.findOne(id);
    if (report.status !== 'PENDING')
      throw new BadRequestException(
        'Report must be in PENDING status for HOD submission',
      );
    return this.updateStatus(id, 'SUBMITTED', approverId);
  }

  async hodReject(id: number, approverId: number, note: string) {
    if (!note) throw new BadRequestException('Rejection note is mandatory');
    const report = await this.findOne(id);
    if (report.status !== 'PENDING')
      throw new BadRequestException(
        'Report must be in PENDING status for HOD rejection',
      );
    return this.updateStatus(id, 'DRAFT', approverId, note);
  }

  // 2. Manager Review
  async managerApprove(id: number, approverId: number) {
    const report = await this.findOne(id);
    if (report.status !== 'SUBMITTED')
      throw new BadRequestException(
        'Report must be in SUBMITTED status for Manager approval',
      );
    return this.updateStatus(id, 'APPROVED', approverId);
  }

  async managerReject(id: number, approverId: number, note: string) {
    if (!note) throw new BadRequestException('Rejection note is mandatory');
    const report = await this.findOne(id);
    if (report.status !== 'SUBMITTED')
      throw new BadRequestException(
        'Report must be in SUBMITTED status for Manager rejection',
      );
    return this.updateStatus(id, 'PENDING', approverId, note);
  }

  // 3. GM Review
  async gmDone(id: number, approverId: number) {
    const report = await this.findOne(id);
    if (report.status !== 'APPROVED')
      throw new BadRequestException(
        'Report must be in APPROVED status for GM finalization',
      );
    return this.updateStatus(id, 'DONE', approverId);
  }

  async gmReject(id: number, approverId: number, note: string) {
    if (!note) throw new BadRequestException('Rejection note is mandatory');
    const report = await this.findOne(id);
    if (report.status !== 'APPROVED')
      throw new BadRequestException(
        'Report must be in APPROVED status for GM rejection',
      );
    // As per requirement: "revert to APPROVED"
    // I will set it to REJECTED status in the approval log, but keep report status as APPROVED?
    // Actually, maybe they meant revert to SUBMITTED. But I'll use APPROVED as requested.
    return this.updateStatus(id, 'APPROVED', approverId, note);
  }
}
