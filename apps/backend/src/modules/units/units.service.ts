import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../db/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { UnitDto } from '@nestject/shared';

@Injectable()
export class UnitsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll(propertyId?: number) {
    if (propertyId) {
      return this.db
        .select()
        .from(schema.units)
        .where(eq(schema.units.property_id, propertyId));
    }
    return this.db.select().from(schema.units);
  }

  async findOne(id: number) {
    const results = await this.db
      .select()
      .from(schema.units)
      .where(eq(schema.units.id, id));

    if (results.length === 0) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return results[0];
  }

  async create(dto: UnitDto) {
    return this.db
      .insert(schema.units)
      .values({
        property_id: dto.propertyId,
        name: dto.name,
        floor: dto.floor,
        base_price: dto.basePrice?.toString(),
      })
      .returning();
  }

  async update(id: number, dto: Partial<UnitDto>) {
    const updateData: Record<string, unknown> = {};
    if (dto.propertyId !== undefined) updateData.property_id = dto.propertyId;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.floor !== undefined) updateData.floor = dto.floor;
    if (dto.basePrice !== undefined)
      updateData.base_price = dto.basePrice.toString();

    const results = await this.db
      .update(schema.units)
      .set(updateData)
      .where(eq(schema.units.id, id))
      .returning();

    if (results.length === 0) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return results[0];
  }

  async remove(id: number) {
    const results = await this.db
      .delete(schema.units)
      .where(eq(schema.units.id, id))
      .returning();

    if (results.length === 0) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return results[0];
  }
}
