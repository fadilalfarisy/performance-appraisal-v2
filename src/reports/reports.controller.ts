import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post(':id/hod/submit')
  @Roles('HEAD_DEPARTMENT', 'ADMINISTRATOR')
  @ApiOperation({ summary: 'HOD submits report to Manager' })
  async hodSubmit(@Param('id') id: string, @Request() req: any) {
    return this.reportsService.hodSubmit(+id, req.user.userId);
  }

  @Post(':id/hod/reject')
  @Roles('HEAD_DEPARTMENT', 'ADMINISTRATOR')
  @ApiOperation({ summary: 'HOD rejects report back to DRAFT' })
  async hodReject(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { note: string },
  ) {
    return this.reportsService.hodReject(+id, req.user.userId, body.note);
  }

  @Post(':id/manager/approve')
  @Roles('MANAGER', 'ADMINISTRATOR')
  @ApiOperation({ summary: 'Manager approves report to GM' })
  async managerApprove(@Param('id') id: string, @Request() req: any) {
    return this.reportsService.managerApprove(+id, req.user.userId);
  }

  @Post(':id/manager/reject')
  @Roles('MANAGER', 'ADMINISTRATOR')
  @ApiOperation({ summary: 'Manager rejects report back to PENDING' })
  async managerReject(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { note: string },
  ) {
    return this.reportsService.managerReject(+id, req.user.userId, body.note);
  }

  @Post(':id/gm/done')
  @Roles('GENERAL_MANAGER', 'ADMINISTRATOR')
  @ApiOperation({ summary: 'GM finalizes the report' })
  async gmDone(@Param('id') id: string, @Request() req: any) {
    return this.reportsService.gmDone(+id, req.user.userId);
  }

  @Post(':id/gm/reject')
  @Roles('GENERAL_MANAGER', 'ADMINISTRATOR')
  @ApiOperation({ summary: 'GM rejects report' })
  async gmReject(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { note: string },
  ) {
    return this.reportsService.gmReject(+id, req.user.userId, body.note);
  }
}
