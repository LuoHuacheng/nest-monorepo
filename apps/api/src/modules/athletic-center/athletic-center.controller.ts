import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { AthleticCenterService } from "./athletic-center.service";
import { CreateAthleticCenterDto } from "./dto/create-athletic-center.dto";
import { QueryAthleticCenterDto } from "./dto/query-athletic-center.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";
import {
  apiOkResponse,
  paginatedApiOkResponse,
  AthleticCenterDto,
} from "../../common/dto/response-dto";

@ApiTags("AthleticCenters")
@ApiBearerAuth()
@Controller("athletic-centers")
export class AthleticCenterController {
  constructor(private athleticCenterService: AthleticCenterService) {}

  @Get()
  @Permissions("athletic-center:list")
  @ApiOperation({ summary: "田管中心列表" })
  @ApiResponse({ ...paginatedApiOkResponse(AthleticCenterDto), description: "分页田管中心列表" })
  findAll(@Query() query: QueryAthleticCenterDto) {
    return this.athleticCenterService.findAll(query);
  }

  @Get(":id")
  @Permissions("athletic-center:list")
  @ApiOperation({ summary: "田管中心详情" })
  @ApiResponse({ ...apiOkResponse(AthleticCenterDto), description: "田管中心详情" })
  findOne(@Param("id") id: string) {
    return this.athleticCenterService.findOne(id);
  }

  @Post()
  @Permissions("athletic-center:create")
  @ApiOperation({ summary: "创建田管中心" })
  @ApiResponse({ ...apiOkResponse(AthleticCenterDto), description: "创建的田管中心" })
  create(@Body() dto: CreateAthleticCenterDto) {
    return this.athleticCenterService.create(dto);
  }

  @Patch(":id")
  @Permissions("athletic-center:update")
  @ApiOperation({ summary: "更新田管中心" })
  @ApiResponse({ ...apiOkResponse(AthleticCenterDto), description: "更新后的田管中心" })
  update(@Param("id") id: string, @Body() dto: Partial<CreateAthleticCenterDto>) {
    return this.athleticCenterService.update(id, dto);
  }

  @Delete(":id")
  @Permissions("athletic-center:delete")
  @ApiOperation({ summary: "删除田管中心" })
  @ApiResponse({ ...apiOkResponse(AthleticCenterDto), description: "删除的田管中心" })
  remove(@Param("id") id: string) {
    return this.athleticCenterService.remove(id);
  }

  @Patch(":id/status")
  @Permissions("athletic-center:update")
  @ApiOperation({ summary: "启用/禁用" })
  @ApiResponse({ ...apiOkResponse(AthleticCenterDto), description: "更新后的田管中心" })
  updateStatus(@Param("id") id: string, @Body("status") status: number) {
    return this.athleticCenterService.updateStatus(id, status);
  }
}
