import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, getSchemaPath } from "@nestjs/swagger";
import { EventService } from "./event.service";
import { ConfirmDrawDto, CreateEventDto, UpdateEventDto } from "./dto/create-event.dto";
import { QueryEventDto, QueryEventParticipantDto } from "./dto/query-event.dto";
import { UpdatePublishStatusDto } from "./dto/update-publish-status.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";
import {
  EventDto,
  OrderDto,
  apiOkResponse,
  paginatedApiOkResponse,
} from "../../common/dto/response-dto";

@ApiTags("Events")
@ApiBearerAuth()
@Controller("events")
export class EventController {
  constructor(private eventService: EventService) {}

  // ==================== 赛事 ====================

  @Get()
  @Permissions("event:list")
  @ApiOperation({ summary: "赛事列表" })
  @ApiResponse({ ...paginatedApiOkResponse(EventDto), description: "分页赛事列表" })
  findAll(@Query() query: QueryEventDto) {
    return this.eventService.findAll(query);
  }

  @Get(":id")
  @Permissions("event:list")
  @ApiOperation({ summary: "赛事详情" })
  @ApiResponse({ ...apiOkResponse(EventDto), description: "赛事详情（含报名组、报名卡）" })
  findOne(@Param("id") id: string) {
    return this.eventService.findOne(id);
  }

  @Post()
  @Permissions("event:create")
  @ApiOperation({ summary: "创建赛事" })
  @ApiResponse({ ...apiOkResponse(EventDto), description: "创建的赛事" })
  create(@Body() dto: CreateEventDto) {
    return this.eventService.create(dto);
  }

  @Patch(":id")
  @Permissions("event:update")
  @ApiOperation({ summary: "更新赛事" })
  @ApiResponse({ ...apiOkResponse(EventDto), description: "更新后的赛事" })
  update(@Param("id") id: string, @Body() dto: UpdateEventDto) {
    return this.eventService.update(id, dto);
  }

  @Delete(":id")
  @Permissions("event:delete")
  @ApiOperation({ summary: "删除赛事" })
  @ApiResponse({ ...apiOkResponse(EventDto), description: "删除的赛事" })
  remove(@Param("id") id: string) {
    return this.eventService.remove(id);
  }

  @Patch(":id/publish-status")
  @Permissions("event:update")
  @ApiOperation({ summary: "更新发布状态" })
  @ApiResponse({ ...apiOkResponse(EventDto), description: "更新后的赛事" })
  updatePublishStatus(@Param("id") id: string, @Body() dto: UpdatePublishStatusDto) {
    return this.eventService.updatePublishStatus(id, dto.publishStatus);
  }

  @Patch(":id/confirm-registration-end")
  @Permissions("event:update")
  @ApiOperation({ summary: "确认报名结束" })
  @ApiResponse({ ...apiOkResponse(EventDto), description: "更新后的赛事" })
  confirmRegistrationEnd(@Param("id") id: string) {
    return this.eventService.confirmRegistrationEnd(id);
  }

  // ==================== 抽签 ====================

  @Post(":id/draw")
  @Permissions("event:update")
  @ApiOperation({ summary: "赛事抽签" })
  @ApiResponse({
    schema: {
      properties: {
        code: { type: "number", example: 200 },
        message: { type: "string", example: "success" },
        data: {
          type: "object",
          properties: {
            totalPaid: { type: "number", description: "已支付订单总数" },
            maxParticipants: { type: "number", description: "最大参赛人数" },
            drawnCount: { type: "number", description: "抽中人数" },
            drawn: {
              type: "array",
              items: { $ref: getSchemaPath(OrderDto) },
              description: "抽中的订单列表",
            },
          },
        },
      },
    },
    description: "抽签结果",
  })
  draw(@Param("id") id: string) {
    return this.eventService.draw(id);
  }

  @Post(":id/draw/confirm")
  @Permissions("event:update")
  @ApiOperation({ summary: "确认抽签结果" })
  @ApiResponse({
    schema: {
      properties: {
        code: { type: "number", example: 200 },
        message: { type: "string", example: "success" },
        data: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            drawnCount: { type: "number", description: "确认中签人数" },
          },
        },
      },
    },
    description: "确认抽签结果",
  })
  confirmDraw(@Param("id") id: string, @Body() dto: ConfirmDrawDto) {
    return this.eventService.confirmDraw(id, dto.orderIds);
  }

  @Get(":id/draw/results")
  @Permissions("event:list")
  @ApiOperation({ summary: "查看抽签结果" })
  @ApiResponse({
    schema: {
      properties: {
        code: { type: "number", example: 200 },
        message: { type: "string", example: "success" },
        data: {
          type: "object",
          properties: {
            groupDrawCompleted: { type: "boolean", description: "是否已完成抽签" },
            maxParticipants: { type: "number", description: "最大参赛人数" },
            drawnCount: { type: "number", description: "中签人数" },
            drawn: {
              type: "array",
              items: { $ref: getSchemaPath(OrderDto) },
              description: "中签订单列表",
            },
          },
        },
      },
    },
    description: "抽签结果",
  })
  findDrawResults(@Param("id") id: string) {
    return this.eventService.findDrawResults(id);
  }

  // ==================== 参赛人 ====================

  @Get(":id/participants")
  @Permissions("event:list")
  @ApiOperation({ summary: "赛事参赛人员列表" })
  @ApiResponse({
    ...paginatedApiOkResponse(OrderDto),
    description: "分页参赛人员列表（支持姓名/手机号搜索）",
  })
  findParticipants(@Param("id") id: string, @Query() query: QueryEventParticipantDto) {
    return this.eventService.findParticipants(id, query);
  }
}
