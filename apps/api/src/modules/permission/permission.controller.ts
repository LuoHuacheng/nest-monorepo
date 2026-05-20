import { Controller, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { PermissionService } from "./permission.service";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { SysPermissionDto, apiOkResponse } from "../../common/dto/response-dto";

@ApiTags("Permissions")
@ApiBearerAuth()
@Controller("permissions")
export class PermissionController {
  constructor(private permissionService: PermissionService) {}

  @Get()
  @Permissions("permission:list")
  @ApiOperation({ summary: "权限树" })
  @ApiResponse({ ...apiOkResponse(SysPermissionDto), description: "树形权限列表" })
  findTree() {
    return this.permissionService.findTree();
  }

  @Post()
  @Permissions("permission:create")
  @ApiOperation({ summary: "创建权限" })
  @ApiResponse({ ...apiOkResponse(SysPermissionDto), description: "创建的权限" })
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionService.create(dto);
  }

  @Patch(":id")
  @Permissions("permission:update")
  @ApiOperation({ summary: "更新权限" })
  @ApiResponse({ ...apiOkResponse(SysPermissionDto), description: "更新后的权限" })
  update(@Param("id") id: string, @Body() dto: Partial<CreatePermissionDto>) {
    return this.permissionService.update(id, dto);
  }

  @Delete(":id")
  @Permissions("permission:delete")
  @ApiOperation({ summary: "删除权限" })
  @ApiResponse({ ...apiOkResponse(SysPermissionDto), description: "删除的权限" })
  remove(@Param("id") id: string) {
    return this.permissionService.remove(id);
  }
}
