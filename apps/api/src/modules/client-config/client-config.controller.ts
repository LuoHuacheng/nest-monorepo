import { Controller, Get, Patch, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { ClientConfigService } from "./client-config.service";
import { BatchUpdateClientConfigDto } from "./dto/update-client-config.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { apiOkResponse, ClientConfigDto } from "../../common/dto/response-dto";

@ApiTags("ClientConfigs")
@ApiBearerAuth()
@Controller("client-configs")
export class ClientConfigController {
  constructor(private clientConfigService: ClientConfigService) {}

  @Get()
  @Permissions("client-config:list")
  @ApiOperation({ summary: "配置列表" })
  @ApiResponse({ ...apiOkResponse(ClientConfigDto), description: "客户端配置列表" })
  findAll() {
    return this.clientConfigService.findAll();
  }

  @Patch()
  @Permissions("client-config:update")
  @ApiOperation({ summary: "批量更新配置" })
  @ApiResponse({ ...apiOkResponse(ClientConfigDto), description: "更新后的配置列表" })
  batchUpdate(@Body() dto: BatchUpdateClientConfigDto) {
    return this.clientConfigService.batchUpdate(dto.configs);
  }
}
