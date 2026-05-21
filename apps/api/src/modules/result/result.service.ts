import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ImportResultsDto, QueryResultDto } from "./dto";
import { EventService } from "../event/event.service";
import { PaginationDto } from "../../common/dto/pagination.dto";

@Injectable()
export class ResultService {
  constructor(
    private prisma: PrismaService,
    private eventService: EventService,
  ) {}

  async findAll(query: QueryResultDto & PaginationDto) {
    const { page, pageSize, eventId } = query;
    const where: Record<string, unknown> = {};
    if (eventId && eventId.trim() !== "") where.eventId = eventId;

    const [items, total] = await Promise.all([
      this.prisma.eventResult.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { rank: "asc" },
      }),
      this.prisma.eventResult.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async importResults(dto: ImportResultsDto) {
    await this.eventService.findOne(dto.eventId);
    return this.prisma.eventResult.createMany({
      data: dto.results.map((r) => ({ ...r, eventId: dto.eventId })),
    });
  }
}
