import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { Event as PrismaEvent, Prisma } from "../../../generated/prisma/client";
import {
  CreateEventDto,
  CreateEventRegistrationGroupDto,
  CreateInviteCodeDto,
  CreateShuttleBusDto,
  UpdateEventDto,
  UpdateInviteCodeDto,
} from "./dto/create-event.dto";
import { QueryEventDto, QueryOrderDto, QueryParticipantDto } from "./dto/query-event.dto";
import { PaginationDto, PaginatedResult } from "../../common/dto/pagination.dto";
import { computeEventStatus } from "./event-status";

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  // ==================== 赛事 ====================

  async findAll(query: QueryEventDto): Promise<PaginatedResult<Record<string, unknown>>> {
    const {
      page,
      pageSize,
      keyword,
      eventStatus,
      publishStatus,
      category,
      attribute,
      isHot,
      dateStart,
      dateEnd,
    } = query;
    const where: Record<string, unknown> = {};

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: "insensitive" } },
        { address: { contains: keyword, mode: "insensitive" } },
      ];
    }
    if (publishStatus) where.publishStatus = publishStatus;
    if (category) where.category = category;
    if (attribute) where.attributes = { has: attribute };
    if (isHot !== undefined) where.isHot = isHot;
    if (dateStart) where.startDate = { gte: new Date(dateStart) };
    if (dateEnd) where.endDate = { lte: new Date(`${dateEnd}T23:59:59`) };

    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.event.count({ where }),
    ]);
    const itemsWithStatus = items.map((item) => this.injectEventStatus(item));

    // eventStatus is computed, filter in memory
    if (eventStatus) {
      const filtered = itemsWithStatus.filter((item) => item.eventStatus === eventStatus);
      return { items: filtered, total: filtered.length, page, pageSize };
    }

    return { items: itemsWithStatus, total, page, pageSize };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        registrationGroups: { orderBy: { sort: "asc" } },
      },
    });
    if (!event) throw new NotFoundException("赛事不存在");
    return this.injectEventStatus(event);
  }

  async create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...this.buildEventData(dto),
        registrationGroups: {
          create: dto.registrationGroups.map((group, index) =>
            this.buildRegistrationCardData(group, index),
          ),
        },
      } as Prisma.EventCreateInput,
      include: {
        registrationGroups: { orderBy: { sort: "asc" } },
      },
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    const current = await this.findOne(id);
    const { registrationGroups } = dto;

    return this.prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id },
        data: this.buildEventData(dto, current),
      });

      if (registrationGroups) {
        const lockedGroups = await tx.registrationGroup.findMany({
          where: {
            eventId: id,
            OR: [{ soldCount: { gt: 0 } }, { orders: { some: {} } }],
          },
          select: { id: true },
          take: 1,
        });
        if (lockedGroups.length > 0) {
          throw new BadRequestException("已有报名记录的报名级别不可整体替换");
        }

        await tx.registrationGroup.deleteMany({ where: { eventId: id } });
        await tx.registrationGroup.createMany({
          data: registrationGroups.map((group, index) => ({
            eventId: id,
            ...this.buildRegistrationCardData(group, index),
          })),
        });
      }

      return tx.event.findUnique({
        where: { id },
        include: {
          registrationGroups: { orderBy: { sort: "asc" } },
        },
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.event.delete({ where: { id } });
  }

  async updatePublishStatus(id: string, publishStatus: string) {
    const event = await this.findOne(id);
    const validTransitions: Record<string, string[]> = {
      draft: ["published"],
      published: ["offline"],
      offline: ["published"],
    };
    if (!validTransitions[event.publishStatus]?.includes(publishStatus)) {
      throw new BadRequestException(`不允许从 "${event.publishStatus}" 转换为 "${publishStatus}"`);
    }
    return this.prisma.event.update({ where: { id }, data: { publishStatus } });
  }

  async confirmRegistrationEnd(id: string) {
    const event = await this.findOne(id);
    if (event.adminConfirmed) {
      throw new BadRequestException("已确认过报名结束");
    }
    return this.prisma.event.update({
      where: { id },
      data: { adminConfirmed: true },
    });
  }

  // ==================== 抽签 ====================

  async draw(id: string) {
    const event = await this.findOne(id);
    const now = new Date();

    if (event.registrationEndDate && now < event.registrationEndDate) {
      throw new BadRequestException("报名尚未结束，无法抽签");
    }
    if (now >= event.startDate) {
      throw new BadRequestException("赛事已开始，无法抽签");
    }
    if (event.currentParticipants <= event.maxParticipants) {
      throw new BadRequestException("报名人数未超过赛事限制人数，无需抽签");
    }
    if (event.groupDrawCompleted) {
      throw new BadRequestException("已完成抽签，不可重复操作");
    }

    const paidOrders = await this.prisma.order.findMany({
      where: { eventId: id, status: "paid", isDrawn: false },
      include: {
        registrationGroup: {
          select: { id: true, name: true, groupType: true, specName: true, genderLimit: true },
        },
        user: { select: { id: true, name: true, phone: true } },
      },
    });

    // Fisher-Yates 洗牌
    for (let i = paidOrders.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [paidOrders[i], paidOrders[j]] = [paidOrders[j], paidOrders[i]];
    }

    const drawn = paidOrders.slice(0, event.maxParticipants);

    return {
      totalPaid: paidOrders.length,
      maxParticipants: event.maxParticipants,
      drawnCount: drawn.length,
      drawn,
    };
  }

  async confirmDraw(id: string, orderIds: string[]) {
    const event = await this.findOne(id);
    const now = new Date();

    if (event.registrationEndDate && now < event.registrationEndDate) {
      throw new BadRequestException("报名尚未结束，无法确认抽签");
    }
    if (now >= event.startDate) {
      throw new BadRequestException("赛事已开始，无法确认抽签");
    }
    if (event.groupDrawCompleted) {
      throw new BadRequestException("已完成抽签，不可重复操作");
    }
    if (orderIds.length === 0) {
      throw new BadRequestException("请选择中签订单");
    }
    if (orderIds.length > event.maxParticipants) {
      throw new BadRequestException(`中签人数不能超过最大参赛人数 ${event.maxParticipants}`);
    }

    // 校验所有订单属于该赛事且为已支付状态
    const validOrders = await this.prisma.order.findMany({
      where: { id: { in: orderIds }, eventId: id, status: "paid" },
      select: { id: true },
    });
    if (validOrders.length !== orderIds.length) {
      throw new BadRequestException("存在无效的订单 ID");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: { id: { in: orderIds } },
        data: { isDrawn: true },
      });
      await tx.event.update({
        where: { id },
        data: { groupDrawCompleted: true },
      });
    });

    return { success: true, drawnCount: orderIds.length };
  }

  async findDrawResults(id: string) {
    const event = await this.findOne(id);
    const drawn = await this.prisma.order.findMany({
      where: { eventId: id, isDrawn: true },
      include: {
        registrationGroup: {
          select: { id: true, name: true, groupType: true, specName: true, genderLimit: true },
        },
        user: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return {
      groupDrawCompleted: event.groupDrawCompleted,
      maxParticipants: event.maxParticipants,
      drawnCount: drawn.length,
      drawn,
    };
  }

  // ==================== 订单 ====================

  async findOrders(eventId: string, query: QueryOrderDto) {
    const { page, pageSize, orderNo } = query;
    const where: Record<string, unknown> = { eventId };
    if (orderNo) where.orderNo = { contains: orderNo, mode: "insensitive" };
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

  // ==================== 邀请码 ====================

  async findInviteCodes(eventId: string) {
    return this.prisma.eventInviteCode.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createInviteCode(eventId: string, dto: CreateInviteCodeDto) {
    await this.findOne(eventId);

    if (dto.registrationGroupId) {
      const group = await this.prisma.registrationGroup.findUnique({
        where: { id: dto.registrationGroupId },
      });
      if (!group || group.eventId !== eventId) {
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
        eventId,
        registrationGroupId: dto.registrationGroupId || null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async updateInviteCode(id: string, dto: UpdateInviteCodeDto) {
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

  async removeInviteCode(id: string) {
    return this.prisma.eventInviteCode.delete({ where: { id } });
  }

  // ==================== 摆渡车 ====================

  async findShuttleBuses(eventId: string) {
    return this.prisma.eventShuttleBus.findMany({
      where: { eventId },
      orderBy: { departureTime: "asc" },
    });
  }

  async createShuttleBus(eventId: string, dto: CreateShuttleBusDto) {
    await this.findOne(eventId);
    return this.prisma.eventShuttleBus.create({
      data: { ...dto, eventId, departureTime: new Date(dto.departureTime) },
    });
  }

  async updateShuttleBus(id: string, dto: Partial<CreateShuttleBusDto>) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.departureTime) data.departureTime = new Date(dto.departureTime);
    return this.prisma.eventShuttleBus.update({ where: { id }, data });
  }

  async removeShuttleBus(id: string) {
    return this.prisma.eventShuttleBus.delete({ where: { id } });
  }

  // ==================== 成绩 ====================

  async findResults(eventId: string, query: PaginationDto) {
    const { page, pageSize } = query;
    const [items, total] = await Promise.all([
      this.prisma.eventResult.findMany({
        where: { eventId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { rank: "asc" },
      }),
      this.prisma.eventResult.count({ where: { eventId } }),
    ]);
    return { items, total, page, pageSize };
  }

  async importResults(
    eventId: string,
    results: { bibNumber: string; finishTime: string; rank?: number }[],
  ) {
    await this.findOne(eventId);
    return this.prisma.eventResult.createMany({
      data: results.map((r) => ({ ...r, eventId })),
    });
  }

  // ==================== 参赛人 ====================

  async findParticipants(eventId: string, query: QueryParticipantDto) {
    const { page, pageSize, status, keyword } = query;
    const where: Record<string, unknown> = { eventId };
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

  private injectEventStatus(event: PrismaEvent) {
    const eventStatus = computeEventStatus({
      startDate: event.startDate,
      endDate: event.endDate,
      registrationStartDate: event.registrationStartDate,
      registrationEndDate: event.registrationEndDate,
      groupDrawCompleted: event.groupDrawCompleted,
      adminConfirmed: event.adminConfirmed,
    });
    return { ...event, eventStatus };
  }

  private buildEventData(dto: CreateEventDto | UpdateEventDto, current?: PrismaEvent) {
    const data: Record<string, unknown> = {};
    const scalarFields = [
      "name",
      "category",
      "province",
      "city",
      "address",
      "packetPickupLocation",
      "isHot",
      "attributes",
      "maxParticipants",
      "organizerId",
      "description",
      "remark",
      "competitionRules",
      "entryStatement",
      "raceRoute",
      "registrationNotice",
      "pickupNotice",
    ] as const;

    for (const field of scalarFields) {
      if (dto[field] !== undefined) data[field] = dto[field];
    }

    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.coverImages !== undefined) data.coverImages = dto.coverImages;
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    if (dto.registrationStartDate) data.registrationStartDate = new Date(dto.registrationStartDate);
    if (dto.registrationEndDate) data.registrationEndDate = new Date(dto.registrationEndDate);
    if (dto.packetPickupTime) data.packetPickupTime = new Date(dto.packetPickupTime);

    if (dto.province !== undefined || dto.city !== undefined || dto.address !== undefined) {
      data.location = [
        dto.province ?? current?.province,
        dto.city ?? current?.city,
        dto.address ?? current?.address,
      ]
        .filter(Boolean)
        .join(" ");
    }

    return data;
  }

  private buildRegistrationCardData(group: CreateEventRegistrationGroupDto, sort: number) {
    return {
      name: group.specName,
      groupType: group.groupType,
      specName: group.specName,
      specDescription: group.specDescription,
      genderLimit: group.genderLimit,
      minAge: group.minAge,
      maxAge: group.maxAge,
      price: group.price,
      quota: group.quota,
      sort,
    };
  }
}
