import { Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import type { Prisma } from "../../../generated/prisma/client";
import { CreateOrganizerDto, UpdateOrganizerDto } from "./dto/create-organizer.dto";
import type { PaginatedResult } from "../../common/dto/pagination.dto";
import { QueryOrganizerDto } from "./dto/query-organizer.dto";

@Injectable()
export class OrganizerService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryOrganizerDto): Promise<PaginatedResult<Record<string, unknown>>> {
    const { page, pageSize, keyword } = query;
    const where: Record<string, unknown> = {};
    if (keyword) {
      where.OR = [
        { loginAccount: { contains: keyword, mode: "insensitive" } },
        { name: { contains: keyword, mode: "insensitive" } },
        { contact: { contains: keyword, mode: "insensitive" } },
        { phone: { contains: keyword } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.organizer.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.organizer.count({ where }),
    ]);
    return { items: items.map((item) => this.stripPassword(item)), total, page, pageSize };
  }

  async findOne(id: string) {
    const item = await this.prisma.organizer.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("组委会不存在");
    return this.stripPassword(item);
  }

  async create(dto: CreateOrganizerDto) {
    const data = await this.buildOrganizerData(dto);
    const item = await this.prisma.organizer.create({ data: data as Prisma.OrganizerCreateInput });
    return this.stripPassword(item);
  }

  async update(id: string, dto: UpdateOrganizerDto) {
    await this.findOne(id);
    const data = await this.buildOrganizerData(dto);
    const item = await this.prisma.organizer.update({
      where: { id },
      data: data as Prisma.OrganizerUpdateInput,
    });
    return this.stripPassword(item);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.organizer.delete({ where: { id } });
  }

  async updateStatus(id: string, status: number) {
    await this.findOne(id);
    const item = await this.prisma.organizer.update({ where: { id }, data: { status } });
    return this.stripPassword(item);
  }

  async resetPassword(id: string, password: string) {
    await this.findOne(id);
    const hashed = await bcrypt.hash(password, 10);
    const item = await this.prisma.organizer.update({ where: { id }, data: { password: hashed } });
    return this.stripPassword(item);
  }

  private async buildOrganizerData(dto: CreateOrganizerDto | UpdateOrganizerDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.eventDate) data.eventDate = new Date(dto.eventDate);
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    return data;
  }

  private stripPassword<T extends { password?: string | null; eventItems?: unknown }>(item: T) {
    const { password: _password, ...safeItem } = item;
    return {
      ...safeItem,
      eventItems: this.parseJsonField(safeItem.eventItems),
    };
  }

  private parseJsonField(value: unknown): unknown {
    if (value === null || value === undefined) return value;
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
}
