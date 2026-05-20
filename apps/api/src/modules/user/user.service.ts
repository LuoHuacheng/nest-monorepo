import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { QueryUserDto } from "./dto/query-user.dto";
import { PaginatedResult } from "../../common/dto/pagination.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryUserDto): Promise<PaginatedResult<any>> {
    const { page, pageSize, keyword, status } = query;
    const where: any = {};

    if (keyword) {
      where.OR = [
        { username: { contains: keyword, mode: "insensitive" } },
        { name: { contains: keyword, mode: "insensitive" } },
      ];
    }
    if (status !== undefined) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.sysUser.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          phone: true,
          email: true,
          status: true,
          createdAt: true,
          userRoles: {
            select: { role: { select: { id: true, name: true, code: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.sysUser.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: string) {
    const user = await this.prisma.sysUser.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        phone: true,
        email: true,
        status: true,
        createdAt: true,
        userRoles: {
          select: { role: { select: { id: true, name: true, code: true } } },
        },
      },
    });
    if (!user) throw new NotFoundException("用户不存在");
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.sysUser.findUnique({
      where: { username: dto.username },
    });
    if (existing) throw new ConflictException("用户名已存在");

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.sysUser.create({
        data: {
          username: dto.username,
          password: hashedPassword,
          name: dto.name,
          phone: dto.phone,
          email: dto.email,
          avatar: dto.avatar,
        },
      });

      if (dto.roleIds?.length) {
        await tx.sysUserRole.createMany({
          data: dto.roleIds.map((roleId) => ({ userId: user.id, roleId })),
        });
      }

      return user;
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.sysUser.update({
        where: { id },
        data: {
          name: dto.name,
          phone: dto.phone,
          email: dto.email,
          avatar: dto.avatar,
        },
      });

      if (dto.roleIds !== undefined) {
        await tx.sysUserRole.deleteMany({ where: { userId: id } });
        if (dto.roleIds.length) {
          await tx.sysUserRole.createMany({
            data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
          });
        }
      }

      return user;
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sysUser.delete({ where: { id } });
  }

  async updateStatus(id: string, status: number) {
    await this.findOne(id);
    return this.prisma.sysUser.update({
      where: { id },
      data: { status },
    });
  }

  async resetPassword(id: string, newPassword: string) {
    await this.findOne(id);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.prisma.sysUser.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}
