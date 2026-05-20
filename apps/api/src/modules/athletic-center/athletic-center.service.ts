import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAthleticCenterDto } from "./dto/create-athletic-center.dto";
import type { PaginatedResult } from "../../common/dto/pagination.dto";
import { QueryAthleticCenterDto } from "./dto/query-athletic-center.dto";

@Injectable()
export class AthleticCenterService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryAthleticCenterDto): Promise<PaginatedResult<Record<string, unknown>>> {
    const { page, pageSize, keyword } = query;
    const where: Record<string, unknown> = {};
    if (keyword) where.name = { contains: keyword, mode: "insensitive" };

    const [items, total] = await Promise.all([
      this.prisma.athleticCenter.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.athleticCenter.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: string) {
    const item = await this.prisma.athleticCenter.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("田管中心不存在");
    return item;
  }

  async create(dto: CreateAthleticCenterDto) {
    return this.prisma.athleticCenter.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateAthleticCenterDto>) {
    await this.findOne(id);
    return this.prisma.athleticCenter.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.athleticCenter.delete({ where: { id } });
  }

  async updateStatus(id: string, status: number) {
    await this.findOne(id);
    return this.prisma.athleticCenter.update({ where: { id }, data: { status } });
  }
}
