import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiResponse } from "@nestjs/swagger";
import { ResultService } from "./result.service";
import { ImportResultsDto, QueryResultDto } from "./dto";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { ApiResponseDto } from "../../common/dto/api-response.dto";
import { EventResultDto, paginatedApiOkResponse } from "../../common/dto/response-dto";

@ApiTags("Results")
@ApiBearerAuth()
@Controller("results")
export class ResultController {
  constructor(private resultService: ResultService) {}

  @Get()
  @Permissions("event:list")
  @ApiOperation({ summary: "成绩列表" })
  @ApiResponse({ ...paginatedApiOkResponse(EventResultDto), description: "分页成绩列表" })
  findAll(@Query() query: QueryResultDto) {
    return this.resultService.findAll(query);
  }

  @Post("import")
  @Permissions("event:create")
  @ApiOperation({ summary: "导入成绩" })
  @ApiOkResponse({ type: ApiResponseDto, description: "导入结果" })
  importResults(@Body() dto: ImportResultsDto) {
    return this.resultService.importResults(dto);
  }
}
