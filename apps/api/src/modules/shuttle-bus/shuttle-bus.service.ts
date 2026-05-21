import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateShuttleBusDto, UpdateShuttleBusDto, QueryShuttleBusDto } from "./dto";
import { EventService } from "../event/event.service";

@Injectable()
export class ShuttleBusService {
  constructor(
    private prisma: PrismaService,
    private eventService: EventService,
  ) {}

  async findAll(query: QueryShuttleBusDto) {
    const where: Record<string, unknown> = {};
    const { page, pageSize } = query;
    if (query.eventId && query.eventId.trim() !== "") where.eventId = query.eventId;

    return this.prisma.eventShuttleBus.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { departureTime: "asc" },
    });
  }

  async create(dto: CreateShuttleBusDto) {
    await this.eventService.findOne(dto.eventId);
    return this.prisma.eventShuttleBus.create({
      data: {
        ...dto,
        departureTime: new Date(dto.departureTime),
      },
    });
  }

  async update(id: string, dto: UpdateShuttleBusDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.departureTime) data.departureTime = new Date(dto.departureTime);
    return this.prisma.eventShuttleBus.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.eventShuttleBus.delete({ where: { id } });
  }
}
