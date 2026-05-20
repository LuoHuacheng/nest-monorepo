import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateRegistrationCardDto,
  UpdateRegistrationCardDto,
} from "./dto/create-registration-card.dto";
import type { PaginatedResult } from "../../common/dto/pagination.dto";
import { QueryRegistrationCardDto } from "./dto/query-registration-card.dto";

@Injectable()
export class RegistrationCardService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    query: QueryRegistrationCardDto,
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const { page, pageSize, keyword, phone, idNumber } = query;
    const where: Record<string, unknown> = {};
    if (keyword) where.name = { contains: keyword, mode: "insensitive" };
    if (phone) where.phone = { contains: phone };
    if (idNumber) where.idNumber = { contains: idNumber };

    const [items, total] = await Promise.all([
      this.prisma.registrationCard.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.registrationCard.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: string) {
    const card = await this.prisma.registrationCard.findUnique({ where: { id } });
    if (!card) throw new NotFoundException("报名卡不存在");
    return card;
  }

  async create(dto: CreateRegistrationCardDto) {
    return this.prisma.registrationCard.create({
      data: {
        ...dto,
        birthDate: new Date(dto.birthDate),
      },
    });
  }

  async update(id: string, dto: UpdateRegistrationCardDto) {
    await this.findOne(id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.birthDate) data.birthDate = new Date(dto.birthDate);
    return this.prisma.registrationCard.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.registrationCard.delete({ where: { id } });
  }
}
