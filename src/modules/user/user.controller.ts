import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { QueryUserDto } from "./dto/query-user.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @Permissions("user:list")
  @ApiOperation({ summary: "用户列表" })
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }

  @Get(":id")
  @Permissions("user:list")
  @ApiOperation({ summary: "用户详情" })
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @Permissions("user:create")
  @ApiOperation({ summary: "创建用户" })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch(":id")
  @Permissions("user:update")
  @ApiOperation({ summary: "更新用户" })
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(":id")
  @Permissions("user:delete")
  @ApiOperation({ summary: "删除用户" })
  remove(@Param("id") id: string) {
    return this.userService.remove(id);
  }

  @Patch(":id/status")
  @Permissions("user:update")
  @ApiOperation({ summary: "启用/禁用用户" })
  updateStatus(@Param("id") id: string, @Body("status") status: number) {
    return this.userService.updateStatus(id, status);
  }

  @Post(":id/reset-password")
  @Permissions("user:update")
  @ApiOperation({ summary: "重置密码" })
  resetPassword(@Param("id") id: string, @Body("password") password: string) {
    return this.userService.resetPassword(id, password);
  }
}
