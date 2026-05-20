import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateRoleDto } from "./dto/create-role.dto";

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.sysRole.findMany({
      include: {
        rolePermissions: {
          select: { permission: { select: { id: true, name: true, code: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.sysRole.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          select: { permission: { select: { id: true, name: true, code: true } } },
        },
      },
    });
    if (!role) throw new NotFoundException("角色不存在");
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.sysRole.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException("角色编码已存在");

    return this.prisma.$transaction(async (tx) => {
      const role = await tx.sysRole.create({
        data: { name: dto.name, code: dto.code, description: dto.description },
      });

      if (dto.permissionIds?.length) {
        await tx.sysRolePermission.createMany({
          data: dto.permissionIds.map((permissionId) => ({
            roleId: role.id,
            permissionId,
          })),
        });
      }

      return role;
    });
  }

  async update(id: string, dto: Partial<CreateRoleDto>) {
    await this.findOne(id);
    return this.prisma.sysRole.update({
      where: { id },
      data: { name: dto.name, description: dto.description },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sysRole.delete({ where: { id } });
  }

  async assignPermissions(id: string, permissionIds: string[]) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      await tx.sysRolePermission.deleteMany({ where: { roleId: id } });
      if (permissionIds.length) {
        await tx.sysRolePermission.createMany({
          data: permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
        });
      }
      return this.findOne(id);
    });
  }
}
