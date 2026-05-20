import { Controller, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { MenuService } from "./menu.service";
import { CreateMenuDto } from "./dto/create-menu.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SysMenuDto, apiOkResponse } from "../../common/dto/response-dto";

@ApiTags("Menus")
@ApiBearerAuth()
@Controller("menus")
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Get()
  @Permissions("menu:list")
  @ApiOperation({ summary: "全部菜单树" })
  @ApiResponse({ ...apiOkResponse(SysMenuDto), description: "树形菜单列表" })
  findTree() {
    return this.menuService.findTree();
  }

  @Get("tree")
  @ApiOperation({ summary: "当前用户菜单树" })
  @ApiResponse({ ...apiOkResponse(SysMenuDto), description: "当前用户可见的树形菜单" })
  findUserTree(@CurrentUser("permissions") permissions: string[]) {
    return this.menuService.findByUser(permissions);
  }

  @Post()
  @Permissions("menu:create")
  @ApiOperation({ summary: "创建菜单" })
  @ApiResponse({ ...apiOkResponse(SysMenuDto), description: "创建的菜单" })
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @Patch(":id")
  @Permissions("menu:update")
  @ApiOperation({ summary: "更新菜单" })
  @ApiResponse({ ...apiOkResponse(SysMenuDto), description: "更新后的菜单" })
  update(@Param("id") id: string, @Body() dto: Partial<CreateMenuDto>) {
    return this.menuService.update(id, dto);
  }

  @Delete(":id")
  @Permissions("menu:delete")
  @ApiOperation({ summary: "删除菜单" })
  @ApiResponse({ ...apiOkResponse(SysMenuDto), description: "删除的菜单" })
  remove(@Param("id") id: string) {
    return this.menuService.remove(id);
  }
}
