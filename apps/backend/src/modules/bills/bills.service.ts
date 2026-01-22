import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../db/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { BillDto, BillItemDto } from '@nestject/shared';

@Injectable()
export class BillsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll() {
    return this.db
      .select({
        bill: schema.monthlyBills,
        unit: schema.units,
      })
      .from(schema.monthlyBills)
      .leftJoin(schema.units, eq(schema.monthlyBills.unit_id, schema.units.id));
  }

  async findOne(id: number) {
    const results = await this.db
      .select({
        bill: schema.monthlyBills,
        unit: schema.units,
      })
      .from(schema.monthlyBills)
      .leftJoin(schema.units, eq(schema.monthlyBills.unit_id, schema.units.id))
      .where(eq(schema.monthlyBills.id, id));

    if (results.length === 0) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }

    // Get bill items
    const items = await this.db
      .select()
      .from(schema.billItems)
      .where(eq(schema.billItems.bill_id, id));

    return {
      ...results[0],
      items,
    };
  }

  async create(dto: BillDto) {
    return this.db
      .insert(schema.monthlyBills)
      .values({
        unit_id: dto.unitId,
        month: dto.month,
        year: dto.year,
        electric_start: dto.electricStart,
        electric_end: dto.electricEnd,
        electric_rate: dto.electricRate?.toString(),
        water_usage: dto.waterUsage,
        water_rate: dto.waterRate?.toString(),
        total_amount: dto.totalAmount.toString(),
        paid_amount: dto.paidAmount?.toString() ?? '0',
        status: dto.status ?? 'unpaid',
        note: dto.note,
      })
      .returning();
  }

  async update(id: number, dto: Partial<BillDto>) {
    const updateData: Record<string, unknown> = {};
    if (dto.unitId !== undefined) updateData.unit_id = dto.unitId;
    if (dto.month !== undefined) updateData.month = dto.month;
    if (dto.year !== undefined) updateData.year = dto.year;
    if (dto.electricStart !== undefined)
      updateData.electric_start = dto.electricStart;
    if (dto.electricEnd !== undefined)
      updateData.electric_end = dto.electricEnd;
    if (dto.electricRate !== undefined)
      updateData.electric_rate = dto.electricRate.toString();
    if (dto.waterUsage !== undefined) updateData.water_usage = dto.waterUsage;
    if (dto.waterRate !== undefined)
      updateData.water_rate = dto.waterRate.toString();
    if (dto.totalAmount !== undefined)
      updateData.total_amount = dto.totalAmount.toString();
    if (dto.paidAmount !== undefined)
      updateData.paid_amount = dto.paidAmount.toString();
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.note !== undefined) updateData.note = dto.note;

    const results = await this.db
      .update(schema.monthlyBills)
      .set(updateData)
      .where(eq(schema.monthlyBills.id, id))
      .returning();

    if (results.length === 0) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }
    return results[0];
  }

  async findBillItems(billId: number) {
    // Verify bill exists
    const bill = await this.db
      .select()
      .from(schema.monthlyBills)
      .where(eq(schema.monthlyBills.id, billId));

    if (bill.length === 0) {
      throw new NotFoundException(`Bill with ID ${billId} not found`);
    }

    return this.db
      .select()
      .from(schema.billItems)
      .where(eq(schema.billItems.bill_id, billId));
  }

  async createBillItem(billId: number, dto: BillItemDto) {
    // Verify bill exists
    const bill = await this.db
      .select()
      .from(schema.monthlyBills)
      .where(eq(schema.monthlyBills.id, billId));

    if (bill.length === 0) {
      throw new NotFoundException(`Bill with ID ${billId} not found`);
    }

    return this.db
      .insert(schema.billItems)
      .values({
        bill_id: billId,
        type: dto.type,
        description: dto.description,
        amount: dto.amount.toString(),
      })
      .returning();
  }
}
