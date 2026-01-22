import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BillsService } from './bills.service';
import { createZodDto } from 'nestjs-zod';
import { billSchema, billItemSchema } from '@nestject/shared';

class CreateBillDto extends createZodDto(billSchema) {}
class UpdateBillDto extends createZodDto(billSchema.partial()) {}
class CreateBillItemDto extends createZodDto(billItemSchema) {}

@ApiTags('bills')
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get()
  findAll() {
    return this.billsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBillDto) {
    return this.billsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBillDto) {
    return this.billsService.update(id, dto);
  }

  // Bill Items nested resource
  @Get(':id/items')
  findBillItems(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.findBillItems(id);
  }

  @Post(':id/items')
  createBillItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateBillItemDto,
  ) {
    return this.billsService.createBillItem(id, dto);
  }
}
