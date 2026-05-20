import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { OrganizerService } from "./organizer.service";
import { CreateOrganizerDto, UpdateOrganizerDto } from "./dto/create-organizer.dto";
import { QueryOrganizerDto } from "./dto/query-organizer.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Organizers")
@ApiBearerAuth()
@Controller("organizers")
export class OrganizerController {
  constructor(private organizerService: OrganizerService) {}

  @Get()
  @Permissions("organizer:list")
  @ApiOperation({ summary: "组委会列表" })
  findAll(@Query() query: QueryOrganizerDto) {
    return this.organizerService.findAll(query);
  }

  @Get(":id")
  @Permissions("organizer:list")
  @ApiOperation({ summary: "组委会详情" })
  findOne(@Param("id") id: string) {
    return this.organizerService.findOne(id);
  }

  @Post()
  @Permissions("organizer:create")
  @ApiOperation({ summary: "创建组委会" })
  create(@Body() dto: CreateOrganizerDto) {
    return this.organizerService.create(dto);
  }

  @Patch(":id")
  @Permissions("organizer:update")
  @ApiOperation({ summary: "更新组委会" })
  update(@Param("id") id: string, @Body() dto: UpdateOrganizerDto) {
    return this.organizerService.update(id, dto);
  }

  @Delete(":id")
  @Permissions("organizer:delete")
  @ApiOperation({ summary: "删除组委会" })
  remove(@Param("id") id: string) {
    return this.organizerService.remove(id);
  }

  @Patch(":id/status")
  @Permissions("organizer:update")
  @ApiOperation({ summary: "启用/停用" })
  updateStatus(@Param("id") id: string, @Body("status") status: number) {
    return this.organizerService.updateStatus(id, status);
  }

  @Post(":id/reset-password")
  @Permissions("organizer:update")
  @ApiOperation({ summary: "重置密码" })
  resetPassword(@Param("id") id: string, @Body("password") password: string) {
    return this.organizerService.resetPassword(id, password);
  }
}
