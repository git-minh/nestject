import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LeasesService } from './leases.service';
import { createZodDto } from 'nestjs-zod';
import { leaseSchema } from '@nestject/shared';

class CreateLeaseDto extends createZodDto(leaseSchema) {}
class UpdateLeaseDto extends createZodDto(leaseSchema.partial()) {}

@ApiTags('leases')
@Controller('leases')
export class LeasesController {
  constructor(private readonly leasesService: LeasesService) {}

  @Get()
  findAll() {
    return this.leasesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leasesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateLeaseDto) {
    return this.leasesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLeaseDto) {
    return this.leasesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.leasesService.remove(id);
  }
}
