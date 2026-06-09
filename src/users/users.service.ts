import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return result[0];
  }

  async create(user: NewUser): Promise<User> {
    const result = await this.db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const results = await this.db.select({
      id: schema.users.id,
      email: schema.users.email,
      createdAt: schema.users.createdAt,
      updatedAt: schema.users.updatedAt,
    }).from(schema.users);
    return results;
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const result = await this.db.select({
      id: schema.users.id,
      email: schema.users.email,
      createdAt: schema.users.createdAt,
      updatedAt: schema.users.updatedAt,
    }).from(schema.users).where(eq(schema.users.id, id)).limit(1);
    
    if (!result[0]) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return result[0];
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const updates: Partial<NewUser> = {};
    if (updateUserDto.email) {
      updates.email = updateUserDto.email;
    }
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updates.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    
    const result = await this.db.update(schema.users)
      .set(updates)
      .where(eq(schema.users.id, id))
      .returning({
        id: schema.users.id,
        email: schema.users.email,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
      });

    if (!result[0]) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return result[0];
  }

  async remove(id: number): Promise<void> {
    const result = await this.db.delete(schema.users).where(eq(schema.users.id, id)).returning();
    if (!result[0]) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
