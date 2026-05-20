import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { QueryLogDto } from "./dto/query-log.dto";

@Injectable()
export class LogService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryLogDto) {
    const { page, pageSize, module, userId } = query;
    const where: Record<string, unknown> = {};
    if (module) where.module = module;
    if (userId) where.userId = userId;

    const [items, total] = await Promise.all([
      this.prisma.sysLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { id: true, username: true, name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.sysLog.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async create(data: {
    userId?: string;
    module?: string;
    action?: string;
    method?: string;
    path?: string;
    ip?: string;
    requestBody?: string;
    responseStatus?: number;
  }) {
    return this.prisma.sysLog.create({ data });
  }
}
