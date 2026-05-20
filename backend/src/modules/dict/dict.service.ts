import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateDictDto, CreateDictItemDto } from "./dto/create-dict.dto";

@Injectable()
export class DictService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.sysDict.findMany({
      include: { items: { orderBy: { sort: "asc" } } },
      orderBy: { code: "asc" },
    });
  }

  async create(dto: CreateDictDto) {
    const existing = await this.prisma.sysDict.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException("字典编码已存在");
    return this.prisma.sysDict.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateDictDto>) {
    const dict = await this.prisma.sysDict.findUnique({ where: { id } });
    if (!dict) throw new NotFoundException("字典不存在");
    return this.prisma.sysDict.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const dict = await this.prisma.sysDict.findUnique({ where: { id } });
    if (!dict) throw new NotFoundException("字典不存在");
    return this.prisma.sysDict.delete({ where: { id } });
  }

  async findItems(dictId: string) {
    return this.prisma.sysDictItem.findMany({
      where: { dictId },
      orderBy: { sort: "asc" },
    });
  }

  async findByCode(code: string) {
    const dict = await this.prisma.sysDict.findUnique({
      where: { code },
      include: { items: { where: { status: 1 }, orderBy: { sort: "asc" } } },
    });
    if (!dict) throw new NotFoundException("字典不存在");
    return dict;
  }

  async createItem(dictId: string, dto: CreateDictItemDto) {
    const dict = await this.prisma.sysDict.findUnique({ where: { id: dictId } });
    if (!dict) throw new NotFoundException("字典不存在");
    return this.prisma.sysDictItem.create({ data: { ...dto, dictId } });
  }

  async updateItem(id: string, dto: Partial<CreateDictItemDto>) {
    const item = await this.prisma.sysDictItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("字典项不存在");
    return this.prisma.sysDictItem.update({ where: { id }, data: dto });
  }

  async removeItem(id: string) {
    const item = await this.prisma.sysDictItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("字典项不存在");
    return this.prisma.sysDictItem.delete({ where: { id } });
  }
}
