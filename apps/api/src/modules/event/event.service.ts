import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateEventDto,
  CreateEventRegistrationGroupDto,
  CreateInviteCodeDto,
  CreateShuttleBusDto,
  UpdateEventDto,
} from "./dto/create-event.dto";
import { QueryEventDto } from "./dto/query-event.dto";
import { PaginationDto, PaginatedResult } from "../../common/dto/pagination.dto";
import { computeEventStatus } from "./event-status";

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  // ==================== 赛事 ====================

  async findAll(query: QueryEventDto): Promise<PaginatedResult<any>> {
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
    const where: any = {};

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
        registrationCards: { orderBy: { sort: "asc" } },
      },
    });
    if (!event) throw new NotFoundException("赛事不存在");
    return this.injectEventStatus(event);
  }

  async create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...this.buildEventData(dto),
        registrationCards: {
          create: dto.registrationGroups.map((group, index) =>
            this.buildRegistrationCardData(group, index),
          ),
        },
      },
      include: {
        registrationCards: { orderBy: { sort: "asc" } },
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
        const lockedGroups = await tx.eventRegistrationCard.findMany({
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

        await tx.eventRegistrationCard.deleteMany({ where: { eventId: id } });
        await tx.eventRegistrationCard.createMany({
          data: registrationGroups.map((group, index) => ({
            eventId: id,
            ...this.buildRegistrationCardData(group, index),
          })),
        });
      }

      return tx.event.findUnique({
        where: { id },
        include: {
          registrationCards: { orderBy: { sort: "asc" } },
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

  // ==================== 邀请码 ====================

  async findInviteCodes(eventId: string) {
    return this.prisma.eventInviteCode.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createInviteCode(eventId: string, dto: CreateInviteCodeDto) {
    await this.findOne(eventId);
    return this.prisma.eventInviteCode.create({
      data: {
        ...dto,
        eventId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
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
    const data: any = { ...dto };
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

  private injectEventStatus(event: any) {
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

  private buildEventData(dto: CreateEventDto | UpdateEventDto, current?: any) {
    const data: any = {};
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
