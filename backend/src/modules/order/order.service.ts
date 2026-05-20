import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { QueryOrderDto } from "./dto/query-order.dto";
import { CreateOrderDto } from "./dto/create-order.dto";
import { PaginatedResult } from "../../common/dto/pagination.dto";

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    // 如果是赛事订单，需要关联报名卡并计算金额
    if (dto.type === "event") {
      if (!dto.eventId) throw new BadRequestException("赛事订单必须关联赛事");
      if (!dto.registrationCardId) throw new BadRequestException("赛事订单必须选择报名卡");

      const card = await this.prisma.eventRegistrationCard.findUnique({
        where: { id: dto.registrationCardId },
      });
      if (!card) throw new NotFoundException("报名卡不存在");
      if (card.quota <= card.soldCount) throw new BadRequestException("报名卡已售罄");

      const orderNo = this.generateOrderNo();

      const order = await this.prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            orderNo,
            type: dto.type,
            eventId: dto.eventId,
            userId: dto.userId,
            registrationCardId: dto.registrationCardId,
            amount: card.price,
            status: "pending",
          },
        });

        // 更新已售数量
        await tx.eventRegistrationCard.update({
          where: { id: dto.registrationCardId },
          data: { soldCount: { increment: 1 } },
        });

        // 更新赛事当前参与人数
        if (dto.eventId) {
          await tx.event.update({
            where: { id: dto.eventId },
            data: { currentParticipants: { increment: 1 } },
          });
        }

        return newOrder;
      });

      return order;
    }

    // 线上赛订单
    const orderNo = this.generateOrderNo();
    return this.prisma.order.create({
      data: {
        orderNo,
        type: dto.type,
        eventId: dto.eventId,
        userId: dto.userId,
        amount: 0,
        status: "pending",
      },
    });
  }

  private generateOrderNo(): string {
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD${timestamp}${random}`;
  }

  async findAll(query: QueryOrderDto): Promise<PaginatedResult<any>> {
    const { page, pageSize, type, status, keyword } = query;
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (keyword) {
      where.OR = [{ orderNo: { contains: keyword, mode: "insensitive" } }];
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          event: { select: { id: true, name: true } },
          registrationCard: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        event: { select: { id: true, name: true } },
        registrationCard: { select: { id: true, name: true } },
      },
    });
    if (!order) throw new NotFoundException("订单不存在");
    return order;
  }

  async refund(id: string) {
    const order = await this.findOne(id);
    if (order.status !== "paid") {
      throw new NotFoundException("只能退款已支付的订单");
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: "refunded", refundedAt: new Date() },
    });
  }
}
