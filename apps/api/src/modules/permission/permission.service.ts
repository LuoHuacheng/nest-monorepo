import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { SysPermission } from "../../../generated/prisma/client";
import { CreatePermissionDto } from "./dto/create-permission.dto";

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async findTree() {
    const permissions = await this.prisma.sysPermission.findMany({
      orderBy: { code: "asc" },
    });
    return this.buildTree(permissions, null);
  }

  async create(dto: CreatePermissionDto) {
    const existing = await this.prisma.sysPermission.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException("权限编码已存在");
    return this.prisma.sysPermission.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreatePermissionDto>) {
    const perm = await this.prisma.sysPermission.findUnique({ where: { id } });
    if (!perm) throw new NotFoundException("权限不存在");
    return this.prisma.sysPermission.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const perm = await this.prisma.sysPermission.findUnique({ where: { id } });
    if (!perm) throw new NotFoundException("权限不存在");
    return this.prisma.sysPermission.delete({ where: { id } });
  }

  private buildTree(items: SysPermission[], parentId: string | null): SysPermission[] {
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: this.buildTree(items, item.id),
      }));
  }
}
