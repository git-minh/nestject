import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../db/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { PropertyDto } from '@nestject/shared';

@Injectable()
export class PropertiesService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll() {
    return this.db.select().from(schema.properties);
  }

  async create(dto: PropertyDto) {
    return this.db.insert(schema.properties).values(dto).returning();
  }
}
