import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../db/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { TenantDto } from '@nestject/shared';

@Injectable()
export class TenantsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll() {
    return this.db.select().from(schema.tenants);
  }

  async findOne(id: number) {
    const results = await this.db
      .select()
      .from(schema.tenants)
      .where(eq(schema.tenants.id, id));

    if (results.length === 0) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return results[0];
  }

  async create(dto: TenantDto) {
    return this.db
      .insert(schema.tenants)
      .values({
        name: dto.name,
        phone: dto.phone,
      })
      .returning();
  }

  async update(id: number, dto: Partial<TenantDto>) {
    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.phone !== undefined) updateData.phone = dto.phone;

    const results = await this.db
      .update(schema.tenants)
      .set(updateData)
      .where(eq(schema.tenants.id, id))
      .returning();

    if (results.length === 0) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return results[0];
  }

  async remove(id: number) {
    const results = await this.db
      .delete(schema.tenants)
      .where(eq(schema.tenants.id, id))
      .returning();

    if (results.length === 0) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return results[0];
  }
}
