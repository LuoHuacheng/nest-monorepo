import { Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateOrganizerDto, UpdateOrganizerDto } from "./dto/create-organizer.dto";
import { PaginatedResult } from "../../common/dto/pagination.dto";
import { QueryOrganizerDto } from "./dto/query-organizer.dto";

@Injectable()
export class OrganizerService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryOrganizerDto): Promise<PaginatedResult<any>> {
    const { page, pageSize, keyword } = query;
    const where: any = {};
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
    const item = await this.prisma.organizer.create({ data });
    return this.stripPassword(item);
  }

  async update(id: string, dto: UpdateOrganizerDto) {
    await this.findOne(id);
    const data = await this.buildOrganizerData(dto);
    const item = await this.prisma.organizer.update({ where: { id }, data });
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
    const data: any = { ...dto };
    if (dto.eventDate) data.eventDate = new Date(dto.eventDate);
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    return data;
  }

  private stripPassword<T extends { password?: string | null }>(item: T) {
    const { password: _password, ...safeItem } = item;
    return safeItem;
  }
}
