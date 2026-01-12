import { Controller, Get, Post, Body } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { createZodDto } from 'nestjs-zod';
import { propertySchema } from '@nestject/shared';

class CreatePropertyDto extends createZodDto(propertySchema) {}

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  findAll() {
    return this.propertiesService.findAll();
  }

  @Post()
  create(@Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(dto);
  }
}
