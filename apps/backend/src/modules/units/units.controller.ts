import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { createZodDto } from 'nestjs-zod';
import { unitSchema } from '@nestject/shared';

class CreateUnitDto extends createZodDto(unitSchema) {}
class UpdateUnitDto extends createZodDto(unitSchema.partial()) {}

@ApiTags('units')
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @ApiQuery({ name: 'propertyId', required: false, type: Number })
  findAll(@Query('propertyId') propertyId?: string) {
    const parsedPropertyId = propertyId ? parseInt(propertyId, 10) : undefined;
    return this.unitsService.findAll(parsedPropertyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unitsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUnitDto) {
    return this.unitsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUnitDto) {
    return this.unitsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.unitsService.remove(id);
  }
}
