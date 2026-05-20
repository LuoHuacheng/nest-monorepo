import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { QueryUserDto } from "./dto/query-user.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { SysUserDto, apiOkResponse, paginatedApiOkResponse } from "../../common/dto/response-dto";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @Permissions("user:list")
  @ApiOperation({ summary: "用户列表" })
  @ApiResponse({ ...paginatedApiOkResponse(SysUserDto), description: "分页用户列表（含角色）" })
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }

  @Get(":id")
  @Permissions("user:list")
  @ApiOperation({ summary: "用户详情" })
  @ApiResponse({ ...apiOkResponse(SysUserDto), description: "用户详情（含角色）" })
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @Permissions("user:create")
  @ApiOperation({ summary: "创建用户" })
  @ApiResponse({ ...apiOkResponse(SysUserDto), description: "创建的用户" })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch(":id")
  @Permissions("user:update")
  @ApiOperation({ summary: "更新用户" })
  @ApiResponse({ ...apiOkResponse(SysUserDto), description: "更新后的用户" })
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(":id")
  @Permissions("user:delete")
  @ApiOperation({ summary: "删除用户" })
  @ApiResponse({ ...apiOkResponse(SysUserDto), description: "删除的用户" })
  remove(@Param("id") id: string) {
    return this.userService.remove(id);
  }

  @Patch(":id/status")
  @Permissions("user:update")
  @ApiOperation({ summary: "启用/禁用用户" })
  @ApiResponse({ ...apiOkResponse(SysUserDto), description: "更新后的用户" })
  updateStatus(@Param("id") id: string, @Body("status") status: number) {
    return this.userService.updateStatus(id, status);
  }

  @Post(":id/reset-password")
  @Permissions("user:update")
  @ApiOperation({ summary: "重置密码" })
  @ApiResponse({ ...apiOkResponse(SysUserDto), description: "更新后的用户" })
  resetPassword(@Param("id") id: string, @Body("password") password: string) {
    return this.userService.resetPassword(id, password);
  }
}
