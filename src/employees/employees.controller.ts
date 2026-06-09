import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('employees')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  async findAll() {
    return this.employeesService.findAll();
  }

  @Get('contract-expiring')
  @Roles('HR', 'ADMINISTRATOR')
  @ApiOperation({
    summary: 'Get employees whose contracts expire this month (HR view)',
  })
  async findExpiring() {
    return this.employeesService.findExpiringContracts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  async findOne(@Param('id') id: string) {
    return this.employeesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('HR', 'ADMINISTRATOR')
  @ApiOperation({ summary: 'Update employee details (HR only)' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateEmployeeDto) {
    return this.employeesService.update(+id, updateDto);
  }

  @Post(':id/approve')
  @Roles('HR', 'ADMINISTRATOR')
  @ApiOperation({
    summary:
      'Approve employee for appraisal (HR only: status Draft -> Pending)',
  })
  async approve(@Param('id') id: string) {
    return this.employeesService.approve(+id);
  }
}
