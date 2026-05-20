import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { SysMenu } from "../../../generated/prisma/client";
import { CreateMenuDto } from "./dto/create-menu.dto";

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async findTree() {
    const menus = await this.prisma.sysMenu.findMany({
      orderBy: { sort: "asc" },
    });
    return this.buildTree(menus, null);
  }

  async findByUser(userPermissions: string[]) {
    const menus = await this.prisma.sysMenu.findMany({
      where: { status: 1 },
      orderBy: { sort: "asc" },
    });

    const filtered = menus.filter((menu) => {
      if (!menu.permissionCode) return true;
      return userPermissions.includes(menu.permissionCode);
    });

    return this.buildTree(filtered, null);
  }

  async create(dto: CreateMenuDto) {
    return this.prisma.sysMenu.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateMenuDto>) {
    const menu = await this.prisma.sysMenu.findUnique({ where: { id } });
    if (!menu) throw new NotFoundException("菜单不存在");
    return this.prisma.sysMenu.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const menu = await this.prisma.sysMenu.findUnique({ where: { id } });
    if (!menu) throw new NotFoundException("菜单不存在");
    return this.prisma.sysMenu.delete({ where: { id } });
  }

  private buildTree(items: SysMenu[], parentId: string | null): SysMenu[] {
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: this.buildTree(items, item.id),
      }));
  }
}
