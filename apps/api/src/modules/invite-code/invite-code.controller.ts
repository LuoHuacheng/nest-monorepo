import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { InviteCodeService } from "./invite-code.service";
import {
  CreateInviteCodeDto,
  UpdateInviteCodeDto,
  QueryInviteCodeDto,
  QueryInviteCodeParticipantDto,
} from "./dto";
import { Permissions } from "../../common/decorators/permissions.decorator";
import {
  EventInviteCodeDto,
  OrderDto,
  apiOkResponse,
  paginatedApiOkResponse,
} from "../../common/dto/response-dto";

@ApiTags("InviteCodes")
@ApiBearerAuth()
@Controller("invite-codes")
export class InviteCodeController {
  constructor(private inviteCodeService: InviteCodeService) {}

  @Get()
  @Permissions("event:list")
  @ApiOperation({ summary: "邀请码列表" })
  @ApiResponse({ ...paginatedApiOkResponse(EventInviteCodeDto), description: "邀请码列表" })
  findAll(@Query() query: QueryInviteCodeDto) {
    return this.inviteCodeService.findAll(query);
  }

  @Post()
  @Permissions("event:create")
  @ApiOperation({ summary: "创建邀请码" })
  @ApiResponse({ ...apiOkResponse(EventInviteCodeDto), description: "创建的邀请码" })
  create(@Body() dto: CreateInviteCodeDto) {
    return this.inviteCodeService.create(dto);
  }

  @Patch(":id")
  @Permissions("event:update")
  @ApiOperation({ summary: "更新邀请码" })
  @ApiResponse({ ...apiOkResponse(EventInviteCodeDto), description: "更新后的邀请码" })
  update(@Param("id") id: string, @Body() dto: UpdateInviteCodeDto) {
    return this.inviteCodeService.update(id, dto);
  }

  @Delete(":id")
  @Permissions("event:delete")
  @ApiOperation({ summary: "删除邀请码" })
  @ApiResponse({ ...apiOkResponse(EventInviteCodeDto), description: "删除的邀请码" })
  remove(@Param("id") id: string) {
    return this.inviteCodeService.remove(id);
  }

  @Get(":id/participants")
  @Permissions("event:list")
  @ApiOperation({ summary: "邀请码已使用人员列表" })
  @ApiResponse({
    ...paginatedApiOkResponse(OrderDto),
    description: "分页已使用人员列表",
  })
  findParticipants(@Param("id") id: string, @Query() query: QueryInviteCodeParticipantDto) {
    return this.inviteCodeService.findParticipants(id, query);
  }
}
