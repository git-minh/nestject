import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../db/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { LeaseDto } from '@nestject/shared';

@Injectable()
export class LeasesService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll() {
    return this.db
      .select({
        lease: schema.leases,
        tenant: schema.tenants,
        unit: schema.units,
      })
      .from(schema.leases)
      .leftJoin(schema.tenants, eq(schema.leases.tenant_id, schema.tenants.id))
      .leftJoin(schema.units, eq(schema.leases.unit_id, schema.units.id));
  }

  async findOne(id: number) {
    const results = await this.db
      .select({
        lease: schema.leases,
        tenant: schema.tenants,
        unit: schema.units,
      })
      .from(schema.leases)
      .leftJoin(schema.tenants, eq(schema.leases.tenant_id, schema.tenants.id))
      .leftJoin(schema.units, eq(schema.leases.unit_id, schema.units.id))
      .where(eq(schema.leases.id, id));

    if (results.length === 0) {
      throw new NotFoundException(`Lease with ID ${id} not found`);
    }
    return results[0];
  }

  async create(dto: LeaseDto) {
    return this.db
      .insert(schema.leases)
      .values({
        unit_id: dto.unitId,
        tenant_id: dto.tenantId,
        start_date: dto.startDate,
        end_date: dto.endDate,
        deposit: dto.deposit?.toString(),
        rent_price: dto.rentPrice?.toString(),
        occupant_count: dto.occupantCount,
        active: dto.active,
      })
      .returning();
  }

  async update(id: number, dto: Partial<LeaseDto>) {
    const updateData: Record<string, unknown> = {};
    if (dto.unitId !== undefined) updateData.unit_id = dto.unitId;
    if (dto.tenantId !== undefined) updateData.tenant_id = dto.tenantId;
    if (dto.startDate !== undefined) updateData.start_date = dto.startDate;
    if (dto.endDate !== undefined) updateData.end_date = dto.endDate;
    if (dto.deposit !== undefined) updateData.deposit = dto.deposit.toString();
    if (dto.rentPrice !== undefined)
      updateData.rent_price = dto.rentPrice.toString();
    if (dto.occupantCount !== undefined)
      updateData.occupant_count = dto.occupantCount;
    if (dto.active !== undefined) updateData.active = dto.active;

    const results = await this.db
      .update(schema.leases)
      .set(updateData)
      .where(eq(schema.leases.id, id))
      .returning();

    if (results.length === 0) {
      throw new NotFoundException(`Lease with ID ${id} not found`);
    }
    return results[0];
  }

  async remove(id: number) {
    const results = await this.db
      .delete(schema.leases)
      .where(eq(schema.leases.id, id))
      .returning();

    if (results.length === 0) {
      throw new NotFoundException(`Lease with ID ${id} not found`);
    }
    return results[0];
  }
}
