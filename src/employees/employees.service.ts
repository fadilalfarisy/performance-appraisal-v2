import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponse } from './dto/employee-response.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @Inject(DB_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
  ) { }

  async findAll(): Promise<EmployeeResponse[]> {
    return await this.db
      .select({
        id: schema.employees.id,
        fullName: schema.employees.fullName,
        birthDate: schema.employees.birthDate,
        manager: {
          id: schema.employees.managerId,
          name: schema.employees.fullName,
        },
        position: {
          id: schema.employees.positionId,
          name: schema.employees.fullName,
        },
        department: {
          id: schema.employees.departmentId,
          name: schema.employees.fullName,
        },
      })
      .from(schema.employees);
  }

  async findOne(id: number) {
    const result = await this.db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.id, id))
      .limit(1);
    if (!result[0]) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return result[0];
  }

  async findExpiringContracts() {
    // This will be used by the scheduler too
    // For now, return all employees whose contracts end in the current month
    // Simplified logic:
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    return this.db
      .select({
        employee: schema.employees,
        contract: schema.contracts,
      })
      .from(schema.employees)
      .innerJoin(
        schema.contracts,
        eq(schema.employees.id, schema.contracts.employeeId),
      )
      .where(
        sql`EXTRACT(MONTH FROM ${schema.contracts.endDate}) = ${currentMonth} AND EXTRACT(YEAR FROM ${schema.contracts.endDate}) = ${currentYear}`,
      );
  }

  async update(id: number, updateDto: UpdateEmployeeDto) {
    const result = await this.db
      .update(schema.employees)
      .set(updateDto as any)
      .where(eq(schema.employees.id, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return result[0];
  }

  async approve(id: number) {
    return this.update(id, { status: 'PENDING' } as any);
  }
}
