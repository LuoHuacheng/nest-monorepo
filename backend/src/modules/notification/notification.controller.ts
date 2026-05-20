import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { NotificationService } from "./notification.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Notifications")
@ApiBearerAuth()
@Controller("notifications")
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  @Permissions("notification:list")
  @ApiOperation({ summary: "消息列表" })
  findAll(@Query() query: PaginationDto) {
    return this.notificationService.findAll(query);
  }

  @Post()
  @Permissions("notification:create")
  @ApiOperation({ summary: "创建并发送" })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }
}
