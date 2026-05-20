import { Controller, Get, Patch, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ClientConfigService } from "./client-config.service";
import { BatchUpdateClientConfigDto } from "./dto/update-client-config.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";

@ApiTags("ClientConfigs")
@ApiBearerAuth()
@Controller("client-configs")
export class ClientConfigController {
  constructor(private clientConfigService: ClientConfigService) {}

  @Get()
  @Permissions("client-config:list")
  @ApiOperation({ summary: "配置列表" })
  findAll() {
    return this.clientConfigService.findAll();
  }

  @Patch()
  @Permissions("client-config:update")
  @ApiOperation({ summary: "批量更新配置" })
  batchUpdate(@Body() dto: BatchUpdateClientConfigDto) {
    return this.clientConfigService.batchUpdate(dto.configs);
  }
}
