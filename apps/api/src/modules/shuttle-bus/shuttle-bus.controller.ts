import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { ShuttleBusService } from "./shuttle-bus.service";
import { CreateShuttleBusDto, UpdateShuttleBusDto, QueryShuttleBusDto } from "./dto";
import { Permissions } from "../../common/decorators/permissions.decorator";
import {
  EventShuttleBusDto,
  apiOkResponse,
  paginatedApiOkResponse,
} from "../../common/dto/response-dto";

@ApiTags("ShuttleBuses")
@ApiBearerAuth()
@Controller("shuttle-buses")
export class ShuttleBusController {
  constructor(private shuttleBusService: ShuttleBusService) {}

  @Get()
  @Permissions("event:list")
  @ApiOperation({ summary: "摆渡车列表" })
  @ApiResponse({ ...paginatedApiOkResponse(EventShuttleBusDto), description: "摆渡车列表" })
  findAll(@Query() query: QueryShuttleBusDto) {
    return this.shuttleBusService.findAll(query);
  }

  @Post()
  @Permissions("event:create")
  @ApiOperation({ summary: "创建摆渡车" })
  @ApiResponse({ ...apiOkResponse(EventShuttleBusDto), description: "创建的摆渡车" })
  create(@Body() dto: CreateShuttleBusDto) {
    return this.shuttleBusService.create(dto);
  }

  @Patch(":id")
  @Permissions("event:update")
  @ApiOperation({ summary: "更新摆渡车" })
  @ApiResponse({ ...apiOkResponse(EventShuttleBusDto), description: "更新后的摆渡车" })
  update(@Param("id") id: string, @Body() dto: UpdateShuttleBusDto) {
    return this.shuttleBusService.update(id, dto);
  }

  @Delete(":id")
  @Permissions("event:delete")
  @ApiOperation({ summary: "删除摆渡车" })
  @ApiResponse({ ...apiOkResponse(EventShuttleBusDto), description: "删除的摆渡车" })
  remove(@Param("id") id: string) {
    return this.shuttleBusService.remove(id);
  }
}
