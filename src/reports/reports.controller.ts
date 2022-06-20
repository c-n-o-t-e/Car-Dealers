import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CreateReportDto } from './Dtos/create-report.dtos';
import { ReportsService } from './reports.service';
import { AuthGuard } from 'src/Guards/auth.guard';
import { CurrentUser } from 'src/users/Decorators/create-user-decorator';
import { User } from 'src/users/user.entities';
import { serialize } from '../Interceptor/serialize.interceptor';
import { ReportDto } from './Dtos/reports.dto';
import { ApprovedReportDto } from './Dtos/approve-report.dto';
import { AdminGuard } from 'src/Guards/admin.guards';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  @serialize(ReportDto)
  @UseGuards(AuthGuard)
  createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    return this.reportsService.create(body, user);
  }

  @Patch('/:id')
  @UseGuards(AdminGuard)
  approvedReport(@Param('id') id: number, @Body() body: ApprovedReportDto) {
    return this.reportsService.changeApproval(id, body.approved);
  }
}
