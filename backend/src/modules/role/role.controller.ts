import { Controller, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { RoleService } from "./role.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Roles")
@ApiBearerAuth()
@Controller("roles")
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  @Permissions("role:list")
  @ApiOperation({ summary: "角色列表" })
  findAll() {
    return this.roleService.findAll();
  }

  @Get(":id")
  @Permissions("role:list")
  @ApiOperation({ summary: "角色详情" })
  findOne(@Param("id") id: string) {
    return this.roleService.findOne(id);
  }

  @Post()
  @Permissions("role:create")
  @ApiOperation({ summary: "创建角色" })
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Patch(":id")
  @Permissions("role:update")
  @ApiOperation({ summary: "更新角色" })
  update(@Param("id") id: string, @Body() dto: Partial<CreateRoleDto>) {
    return this.roleService.update(id, dto);
  }

  @Delete(":id")
  @Permissions("role:delete")
  @ApiOperation({ summary: "删除角色" })
  remove(@Param("id") id: string) {
    return this.roleService.remove(id);
  }

  @Post(":id/permissions")
  @Permissions("role:assign")
  @ApiOperation({ summary: "分配权限" })
  assignPermissions(@Param("id") id: string, @Body("permissionIds") permissionIds: string[]) {
    return this.roleService.assignPermissions(id, permissionIds);
  }
}
