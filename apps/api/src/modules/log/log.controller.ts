import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { LogService } from "./log.service";
import { QueryLogDto } from "./dto/query-log.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { SysLogDto, paginatedApiOkResponse } from "../../common/dto/response-dto";

@ApiTags("Logs")
@ApiBearerAuth()
@Controller("logs")
export class LogController {
  constructor(private logService: LogService) {}

  @Get()
  @Permissions("log:list")
  @ApiOperation({ summary: "日志列表" })
  @ApiResponse({
    ...paginatedApiOkResponse(SysLogDto),
    description: "分页日志列表（含操作用户信息）",
  })
  findAll(@Query() query: QueryLogDto) {
    return this.logService.findAll(query);
  }
}
