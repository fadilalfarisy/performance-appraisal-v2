import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { DailyRecordsService } from './daily-records.service';
import { BulkCreateDailyRecordsDto } from './dto/create-daily-record.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('daily-records')
@Controller('daily-records')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DailyRecordsController {
  constructor(private readonly dailyRecordsService: DailyRecordsService) {}

  @Post('bulk')
  @Roles('SUPERVISOR', 'ADMINISTRATOR')
  @ApiOperation({ summary: 'Bulk create daily records (Supervisor only)' })
  async createBulk(
    @Request() req: any,
    @Body() bulkDto: BulkCreateDailyRecordsDto,
  ) {
    if (!req.user.employeeId) {
      throw new ForbiddenException(
        'User is not associated with an employee record',
      );
    }
    return this.dailyRecordsService.createBulk(
      req.user.employeeId,
      bulkDto.records,
    );
  }

  @Get('my-records')
  @ApiOperation({ summary: 'Get records created by the current supervisor' })
  async findMyRecords(@Request() req: any) {
    if (!req.user.employeeId) {
      throw new ForbiddenException(
        'User is not associated with an employee record',
      );
    }
    return this.dailyRecordsService.findAllBySupervisor(req.user.employeeId);
  }

  @Get('employee/:id')
  @ApiOperation({ summary: 'Get records for a specific employee' })
  async findByEmployee(@Param('id') id: string) {
    return this.dailyRecordsService.findAllByEmployee(+id);
  }
}
