import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PacerService } from "./pacer.service";
import {
  CreatePacerDto,
  CreatePacerTestDto,
  AssignPacerDto,
  QueryPacerDto,
} from "./dto/create-pacer.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Pacers")
@ApiBearerAuth()
@Controller("pacers")
export class PacerController {
  constructor(private pacerService: PacerService) {}

  @Post()
  @Permissions("pacer:create")
  @ApiOperation({ summary: "创建配速员" })
  create(@Body() dto: CreatePacerDto) {
    return this.pacerService.create(dto);
  }

  @Get()
  @Permissions("pacer:list")
  @ApiOperation({ summary: "配速员列表" })
  findAll(@Query() query: QueryPacerDto) {
    return this.pacerService.findAll(query);
  }

  @Get(":id")
  @Permissions("pacer:list")
  @ApiOperation({ summary: "配速员详情" })
  findOne(@Param("id") id: string) {
    return this.pacerService.findOne(id);
  }

  @Patch(":id/approve")
  @Permissions("pacer:approve")
  @ApiOperation({ summary: "审核通过" })
  approve(@Param("id") id: string) {
    return this.pacerService.approve(id);
  }

  @Patch(":id/suspend")
  @Permissions("pacer:suspend")
  @ApiOperation({ summary: "暂停授权" })
  suspend(@Param("id") id: string) {
    return this.pacerService.suspend(id);
  }

  @Patch(":id/revoke")
  @Permissions("pacer:revoke")
  @ApiOperation({ summary: "解除授权" })
  revoke(@Param("id") id: string) {
    return this.pacerService.revoke(id);
  }

  @Delete(":id")
  @Permissions("pacer:delete")
  @ApiOperation({ summary: "删除配速员" })
  remove(@Param("id") id: string) {
    return this.pacerService.remove(id);
  }

  // ==================== 实测 ====================

  @Get("tests/list")
  @Permissions("pacer:list")
  @ApiOperation({ summary: "实测列表" })
  findTests(@Query() query: QueryPacerDto) {
    return this.pacerService.findTests(query);
  }

  @Patch("tests/:id")
  @Permissions("pacer:update")
  @ApiOperation({ summary: "编辑实测" })
  updateTest(@Param("id") id: string, @Body() dto: Partial<CreatePacerTestDto>) {
    return this.pacerService.updateTest(id, dto);
  }

  // ==================== 配速员赛事 ====================

  @Get("events/list")
  @Permissions("pacer:list")
  @ApiOperation({ summary: "配速员赛事列表" })
  findEvents(@Query() query: QueryPacerDto) {
    return this.pacerService.findEvents(query);
  }

  @Get("events/:id")
  @Permissions("pacer:list")
  @ApiOperation({ summary: "配速员赛事详情" })
  findEventDetail(@Param("id") id: string) {
    return this.pacerService.findEventDetail(id);
  }

  @Post("events/assign")
  @Permissions("pacer:assign")
  @ApiOperation({ summary: "分配配速员" })
  assign(@Body() dto: AssignPacerDto) {
    return this.pacerService.assign(dto);
  }

  @Patch("events/:id/withdraw")
  @Permissions("pacer:update")
  @ApiOperation({ summary: "弃权" })
  withdraw(@Param("id") id: string) {
    return this.pacerService.withdraw(id);
  }
}
