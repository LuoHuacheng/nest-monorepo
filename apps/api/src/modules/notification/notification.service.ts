import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { PaginationDto, PaginatedResult } from "../../common/dto/pagination.dto";

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto): Promise<PaginatedResult<Record<string, unknown>>> {
    const { page, pageSize } = query;
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.notification.count(),
    ]);
    return { items, total, page, pageSize };
  }

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        ...dto,
        status: "sent",
        sentAt: new Date(),
      },
    });
  }
}
