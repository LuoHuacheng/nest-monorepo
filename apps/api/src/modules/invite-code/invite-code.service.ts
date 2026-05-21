import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "../../../generated/prisma/client";
import {
  CreateInviteCodeDto,
  UpdateInviteCodeDto,
  QueryInviteCodeDto,
  QueryInviteCodeParticipantDto,
} from "./dto";
import { EventService } from "../event/event.service";
import type { PaginatedResult } from "../../common/dto/pagination.dto";

@Injectable()
export class InviteCodeService {
  constructor(
    private prisma: PrismaService,
    private eventService: EventService,
  ) {}

  async findAll(query: QueryInviteCodeDto): Promise<PaginatedResult<Record<string, unknown>>> {
    const { page, pageSize } = query;
    const where: Prisma.EventInviteCodeWhereInput = {};
    if (query.eventId && query.eventId.trim() !== "") where.eventId = query.eventId;
    if (query.status !== undefined) where.status = query.status;
    if (query.dateStart || query.dateEnd) {
      where.createdAt = {};
      if (query.dateStart) where.createdAt.gte = new Date(query.dateStart);
      if (query.dateEnd) where.createdAt.lte = new Date(`${query.dateEnd}T23:59:59`);
    }

    const [items, total] = await Promise.all([
      this.prisma.eventInviteCode.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          event: { select: { id: true, name: true } },
          registrationGroup: { select: { id: true, name: true, specName: true } },
        },
      }),
      this.prisma.eventInviteCode.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async create(dto: CreateInviteCodeDto) {
    await this.eventService.findOne(dto.eventId);

    if (dto.registrationGroupId) {
      const group = await this.prisma.registrationGroup.findUnique({
        where: { id: dto.registrationGroupId },
      });
      if (!group || group.eventId !== dto.eventId) {
        throw new BadRequestException("赛事组别不存在或不属于该赛事");
      }
    }

    const existing = await this.prisma.eventInviteCode.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new BadRequestException("邀请码已存在");
    }

    return this.prisma.eventInviteCode.create({
      data: {
        code: dto.code,
        desc: dto.desc,
        discount: dto.discount,
        maxUses: dto.maxUses,
        eventId: dto.eventId,
        registrationGroupId: dto.registrationGroupId || null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async update(id: string, dto: UpdateInviteCodeDto) {
    const existing = await this.prisma.eventInviteCode.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("邀请码不存在");

    const data: Record<string, unknown> = {};
    if (dto.desc !== undefined) data.desc = dto.desc;
    if (dto.discount !== undefined) data.discount = dto.discount;
    if (dto.maxUses !== undefined) data.maxUses = dto.maxUses;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.expiresAt !== undefined)
      data.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;

    return this.prisma.eventInviteCode.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.eventInviteCode.delete({ where: { id } });
  }

  async findParticipants(id: string, query: QueryInviteCodeParticipantDto) {
    const { page, pageSize, status, keyword } = query;

    const inviteCode = await this.prisma.eventInviteCode.findUnique({ where: { id } });
    if (!inviteCode) throw new NotFoundException("邀请码不存在");

    const where: Prisma.OrderWhereInput = { inviteCodeId: id };
    if (status) where.status = status;
    if (keyword) {
      where.OR = [
        { orderNo: { contains: keyword, mode: "insensitive" } },
        { user: { name: { contains: keyword, mode: "insensitive" } } },
        { user: { phone: { contains: keyword, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          registrationGroup: {
            select: { id: true, name: true, groupType: true, specName: true, genderLimit: true },
          },
          user: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }
}
