import { Controller, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { DictService } from "./dict.service";
import { CreateDictDto, CreateDictItemDto } from "./dto/create-dict.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Dicts")
@ApiBearerAuth()
@Controller("dicts")
export class DictController {
  constructor(private dictService: DictService) {}

  @Get()
  @Permissions("dict:list")
  @ApiOperation({ summary: "字典类型列表" })
  findAll() {
    return this.dictService.findAll();
  }

  @Post()
  @Permissions("dict:create")
  @ApiOperation({ summary: "创建字典类型" })
  create(@Body() dto: CreateDictDto) {
    return this.dictService.create(dto);
  }

  @Patch(":id")
  @Permissions("dict:update")
  @ApiOperation({ summary: "更新字典类型" })
  update(@Param("id") id: string, @Body() dto: Partial<CreateDictDto>) {
    return this.dictService.update(id, dto);
  }

  @Delete(":id")
  @Permissions("dict:delete")
  @ApiOperation({ summary: "删除字典类型" })
  remove(@Param("id") id: string) {
    return this.dictService.remove(id);
  }

  @Get(":id/items")
  @Permissions("dict:list")
  @ApiOperation({ summary: "字典项列表" })
  findItems(@Param("id") id: string) {
    return this.dictService.findItems(id);
  }

  @Post(":id/items")
  @Permissions("dict:create")
  @ApiOperation({ summary: "创建字典项" })
  createItem(@Param("id") id: string, @Body() dto: CreateDictItemDto) {
    return this.dictService.createItem(id, dto);
  }

  @Patch("items/:id")
  @Permissions("dict:update")
  @ApiOperation({ summary: "更新字典项" })
  updateItem(@Param("id") id: string, @Body() dto: Partial<CreateDictItemDto>) {
    return this.dictService.updateItem(id, dto);
  }

  @Delete("items/:id")
  @Permissions("dict:delete")
  @ApiOperation({ summary: "删除字典项" })
  removeItem(@Param("id") id: string) {
    return this.dictService.removeItem(id);
  }

  @Get("by-code/:code")
  @ApiOperation({ summary: "按编码查询字典项" })
  findByCode(@Param("code") code: string) {
    return this.dictService.findByCode(code);
  }
}
