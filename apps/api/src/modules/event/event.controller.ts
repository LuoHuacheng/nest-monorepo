import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiResponse } from "@nestjs/swagger";
import { EventService } from "./event.service";
import {
  CreateEventDto,
  CreateInviteCodeDto,
  CreateShuttleBusDto,
  UpdateEventDto,
} from "./dto/create-event.dto";
import { QueryEventDto } from "./dto/query-event.dto";
import { UpdatePublishStatusDto } from "./dto/update-publish-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ApiResponseDto } from "../../common/dto/api-response.dto";
import {
  EventDto,
  EventInviteCodeDto,
  EventShuttleBusDto,
  EventResultDto,
  apiOkResponse,
  paginatedApiOkResponse,
} from "../../common/dto/response-dto";

@ApiTags("Events")
@ApiBearerAuth()
@Controller("events")
export class EventController {
  constructor(private eventService: EventService) {}

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

  // ==================== 邀请码 ====================

  @Get(":eventId/invite-codes")
  @Permissions("event:list")
  @ApiOperation({ summary: "邀请码列表" })
  @ApiResponse({ ...paginatedApiOkResponse(EventInviteCodeDto), description: "邀请码列表" })
  findInviteCodes(@Param("eventId") eventId: string) {
    return this.eventService.findInviteCodes(eventId);
  }

  @Post(":eventId/invite-codes")
  @Permissions("event:create")
  @ApiOperation({ summary: "创建邀请码" })
  @ApiResponse({ ...apiOkResponse(EventInviteCodeDto), description: "创建的邀请码" })
  createInviteCode(@Param("eventId") eventId: string, @Body() dto: CreateInviteCodeDto) {
    return this.eventService.createInviteCode(eventId, dto);
  }

  @Delete("invite-codes/:id")
  @Permissions("event:delete")
  @ApiOperation({ summary: "删除邀请码" })
  @ApiResponse({ ...apiOkResponse(EventInviteCodeDto), description: "删除的邀请码" })
  removeInviteCode(@Param("id") id: string) {
    return this.eventService.removeInviteCode(id);
  }

  // ==================== 摆渡车 ====================

  @Get(":eventId/shuttle-buses")
  @Permissions("event:list")
  @ApiOperation({ summary: "摆渡车列表" })
  @ApiResponse({ ...paginatedApiOkResponse(EventShuttleBusDto), description: "摆渡车列表" })
  findShuttleBuses(@Param("eventId") eventId: string) {
    return this.eventService.findShuttleBuses(eventId);
  }

  @Post(":eventId/shuttle-buses")
  @Permissions("event:create")
  @ApiOperation({ summary: "创建摆渡车" })
  @ApiResponse({ ...apiOkResponse(EventShuttleBusDto), description: "创建的摆渡车" })
  createShuttleBus(@Param("eventId") eventId: string, @Body() dto: CreateShuttleBusDto) {
    return this.eventService.createShuttleBus(eventId, dto);
  }

  @Patch("shuttle-buses/:id")
  @Permissions("event:update")
  @ApiOperation({ summary: "更新摆渡车" })
  @ApiResponse({ ...apiOkResponse(EventShuttleBusDto), description: "更新后的摆渡车" })
  updateShuttleBus(@Param("id") id: string, @Body() dto: Partial<CreateShuttleBusDto>) {
    return this.eventService.updateShuttleBus(id, dto);
  }

  @Delete("shuttle-buses/:id")
  @Permissions("event:delete")
  @ApiOperation({ summary: "删除摆渡车" })
  @ApiResponse({ ...apiOkResponse(EventShuttleBusDto), description: "删除的摆渡车" })
  removeShuttleBus(@Param("id") id: string) {
    return this.eventService.removeShuttleBus(id);
  }

  // ==================== 成绩 ====================

  @Get(":eventId/results")
  @Permissions("event:list")
  @ApiOperation({ summary: "成绩列表" })
  @ApiResponse({ ...paginatedApiOkResponse(EventResultDto), description: "分页成绩列表" })
  findResults(@Param("eventId") eventId: string, @Query() query: PaginationDto) {
    return this.eventService.findResults(eventId, query);
  }

  @Post(":eventId/results/import")
  @Permissions("event:create")
  @ApiOperation({ summary: "导入成绩" })
  @ApiOkResponse({ type: ApiResponseDto, description: "导入结果" })
  importResults(
    @Param("eventId") eventId: string,
    @Body() results: { bibNumber: string; finishTime: string; rank?: number }[],
  ) {
    return this.eventService.importResults(eventId, results);
  }
}
