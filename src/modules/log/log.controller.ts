import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { LogService } from "./log.service";
import { QueryLogDto } from "./dto/query-log.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Logs")
@ApiBearerAuth()
@Controller("logs")
export class LogController {
  constructor(private logService: LogService) {}

  @Get()
  @Permissions("log:list")
  @ApiOperation({ summary: "日志列表" })
  findAll(@Query() query: QueryLogDto) {
    return this.logService.findAll(query);
  }
}
