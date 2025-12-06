import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WorklogsService } from './worklogs.service';
import { CreateWorklogDto } from './dto/create-worklog.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '@prisma/client';

@Controller('worklogs')
@UseGuards(RolesGuard)
export class WorklogsController {
  constructor(private readonly worklogsService: WorklogsService) {}

  @Post()
  @Roles(ROLES.EMPLOYEE, ROLES.HR, ROLES.ADMIN)
  create(@Body() createWorklogDto: CreateWorklogDto) {
    return this.worklogsService.create(createWorklogDto);
  }

  @Get()
  @Roles(ROLES.EMPLOYEE, ROLES.HR, ROLES.ADMIN)
  findAll(@Query('employeeId') employeeId: string) {
    // Add logic to ensure user can only see their own logs unless HR/ADMIN
    return this.worklogsService.findAll(employeeId);
  }

  @Patch(':id/approve')
  @Roles(ROLES.HR, ROLES.ADMIN)
  approve(@Param('id') id: string, @Req() req) {
    // In a real app, the approverId comes from the authenticated user
    const approverId = req.user.id;
    return this.worklogsService.approve(id, approverId);
  }
}
