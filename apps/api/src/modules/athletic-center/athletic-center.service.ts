import { Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import type { Prisma } from "../../../generated/prisma/client";
import { CreateAthleticCenterDto } from "./dto/create-athletic-center.dto";
import type { PaginatedResult } from "../../common/dto/pagination.dto";
import { QueryAthleticCenterDto } from "./dto/query-athletic-center.dto";

@Injectable()
export class AthleticCenterService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryAthleticCenterDto): Promise<PaginatedResult<Record<string, unknown>>> {
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
      this.prisma.athleticCenter.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.athleticCenter.count({ where }),
    ]);
    return { items: items.map((item) => this.stripPassword(item)), total, page, pageSize };
  }

  async findOne(id: string) {
    const item = await this.prisma.athleticCenter.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("田管中心不存在");
    return this.stripPassword(item);
  }

  async create(dto: CreateAthleticCenterDto) {
    const data = await this.buildData(dto);
    const item = await this.prisma.athleticCenter.create({
      data: data as Prisma.AthleticCenterCreateInput,
    });
    return this.stripPassword(item);
  }

  async update(id: string, dto: Partial<CreateAthleticCenterDto>) {
    await this.findOne(id);
    const data = await this.buildData(dto);
    const item = await this.prisma.athleticCenter.update({
      where: { id },
      data: data as Prisma.AthleticCenterUpdateInput,
    });
    return this.stripPassword(item);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.athleticCenter.delete({ where: { id } });
  }

  async updateStatus(id: string, status: number) {
    await this.findOne(id);
    const item = await this.prisma.athleticCenter.update({ where: { id }, data: { status } });
    return this.stripPassword(item);
  }

  async resetPassword(id: string, password: string) {
    await this.findOne(id);
    const hashed = await bcrypt.hash(password, 10);
    const item = await this.prisma.athleticCenter.update({
      where: { id },
      data: { password: hashed },
    });
    return this.stripPassword(item);
  }

  private async buildData(dto: Partial<CreateAthleticCenterDto>) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    return data;
  }

  private stripPassword<T extends { password?: string | null }>(item: T) {
    const { password: _password, ...safeItem } = item;
    return safeItem;
  }
}
