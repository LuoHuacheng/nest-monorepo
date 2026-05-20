import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreatePacerDto,
  CreatePacerTestDto,
  AssignPacerDto,
  QueryPacerDto,
} from "./dto/create-pacer.dto";
import type { PaginatedResult } from "../../common/dto/pagination.dto";

@Injectable()
export class PacerService {
  constructor(private prisma: PrismaService) {}

  // ==================== 配速员 ====================

  async create(dto: CreatePacerDto) {
    const pacerNo = dto.pacerNo ?? (await this.generatePacerNo());
    return this.prisma.pacer.create({
      data: {
        ...dto,
        pacerNo,
        validFrom: new Date(dto.validFrom),
        validTo: new Date(dto.validTo),
        approvedAt: dto.status === "approved" ? new Date() : undefined,
      },
    });
  }

  async findAll(query: QueryPacerDto): Promise<PaginatedResult<Record<string, unknown>>> {
    const { page, pageSize, keyword, status } = query;
    const where: Record<string, unknown> = {};
    if (keyword) {
      where.OR = [
        { pacerNo: { contains: keyword, mode: "insensitive" } },
        { name: { contains: keyword, mode: "insensitive" } },
        { phone: { contains: keyword, mode: "insensitive" } },
        { idCard: { contains: keyword, mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.pacer.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.pacer.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: string) {
    const pacer = await this.prisma.pacer.findUnique({
      where: { id },
      include: { tests: true, events: true },
    });
    if (!pacer) throw new NotFoundException("配速员不存在");
    return pacer;
  }

  async approve(id: string) {
    await this.findOne(id);
    return this.prisma.pacer.update({
      where: { id },
      data: { status: "approved", approvedAt: new Date() },
    });
  }

  async suspend(id: string) {
    await this.findOne(id);
    return this.prisma.pacer.update({
      where: { id },
      data: { status: "suspended" },
    });
  }

  async revoke(id: string) {
    await this.findOne(id);
    return this.prisma.pacer.update({
      where: { id },
      data: { status: "revoked" },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.pacer.delete({ where: { id } });
  }

  // ==================== 实测 ====================

  async findTests(query: QueryPacerDto) {
    const { page, pageSize } = query;
    const [items, total] = await Promise.all([
      this.prisma.pacerTest.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { pacer: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.pacerTest.count(),
    ]);
    return { items, total, page, pageSize };
  }

  async updateTest(id: string, dto: Partial<CreatePacerTestDto>) {
    const test = await this.prisma.pacerTest.findUnique({ where: { id } });
    if (!test) throw new NotFoundException("实测记录不存在");
    const data: Record<string, unknown> = { ...dto };
    if (dto.testDate) data.testDate = new Date(dto.testDate);
    return this.prisma.pacerTest.update({ where: { id }, data });
  }

  // ==================== 配速员赛事 ====================

  async findEvents(query: QueryPacerDto) {
    const { page, pageSize } = query;
    const [items, total] = await Promise.all([
      this.prisma.pacerEvent.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          pacer: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.pacerEvent.count(),
    ]);
    return { items, total, page, pageSize };
  }

  async findEventDetail(id: string) {
    const item = await this.prisma.pacerEvent.findUnique({
      where: { id },
      include: { pacer: true },
    });
    if (!item) throw new NotFoundException("配速员赛事不存在");
    return item;
  }

  async assign(dto: AssignPacerDto) {
    return this.prisma.pacerEvent.create({
      data: {
        pacerId: dto.pacerId,
        eventId: dto.eventId,
        targetTime: dto.targetTime,
      },
    });
  }

  async withdraw(id: string) {
    const item = await this.prisma.pacerEvent.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("配速员赛事不存在");
    return this.prisma.pacerEvent.update({
      where: { id },
      data: { status: "withdrawn" },
    });
  }

  private async generatePacerNo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const prefix = `${year}${month}${day}`;
    const latest = await this.prisma.pacer.findFirst({
      where: { pacerNo: { startsWith: prefix } },
      orderBy: { pacerNo: "desc" },
      select: { pacerNo: true },
    });
    const currentSequence = latest?.pacerNo ? Number(latest.pacerNo.slice(prefix.length)) : 0;
    return `${prefix}${String(currentSequence + 1).padStart(5, "0")}`;
  }
}
