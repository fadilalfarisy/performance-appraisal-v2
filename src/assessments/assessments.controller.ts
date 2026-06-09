import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('assessments')
@Controller('assessments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post('report/generate/:employeeId')
  @Roles('ADMINISTRATOR', 'HR', 'HEAD_DEPARTMENT')
  @ApiOperation({
    summary: 'Manually trigger report generation for an employee',
  })
  async generate(@Param('employeeId') employeeId: string) {
    return this.assessmentsService.generateReport(+employeeId);
  }

  @Get('report/:id')
  @ApiOperation({ summary: 'Get a report with its assessments' })
  async findReport(@Param('id') id: string) {
    return this.assessmentsService.findReportWithAssessments(+id);
  }

  @Patch(':id/override')
  @Roles('MANAGER', 'ADMINISTRATOR')
  @ApiOperation({ summary: 'Override an assessment score (Manager only)' })
  async override(
    @Param('id') id: string,
    @Body() body: { score: number; note: string },
  ) {
    return this.assessmentsService.overrideScore(+id, body.score, body.note);
  }
}
