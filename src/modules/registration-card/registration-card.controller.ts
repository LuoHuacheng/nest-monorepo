import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { RegistrationCardService } from "./registration-card.service";
import {
  CreateRegistrationCardDto,
  UpdateRegistrationCardDto,
} from "./dto/create-registration-card.dto";
import { QueryRegistrationCardDto } from "./dto/query-registration-card.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";

@ApiTags("RegistrationCards")
@ApiBearerAuth()
@Controller("registration-cards")
export class RegistrationCardController {
  constructor(private registrationCardService: RegistrationCardService) {}

  @Get()
  @Permissions("registration-card:list")
  @ApiOperation({ summary: "报名卡列表" })
  findAll(@Query() query: QueryRegistrationCardDto) {
    return this.registrationCardService.findAll(query);
  }

  @Get(":id")
  @Permissions("registration-card:list")
  @ApiOperation({ summary: "报名卡详情" })
  findOne(@Param("id") id: string) {
    return this.registrationCardService.findOne(id);
  }

  @Post()
  @Permissions("registration-card:create")
  @ApiOperation({ summary: "创建报名卡" })
  create(@Body() dto: CreateRegistrationCardDto) {
    return this.registrationCardService.create(dto);
  }

  @Patch(":id")
  @Permissions("registration-card:update")
  @ApiOperation({ summary: "更新报名卡" })
  update(@Param("id") id: string, @Body() dto: UpdateRegistrationCardDto) {
    return this.registrationCardService.update(id, dto);
  }

  @Delete(":id")
  @Permissions("registration-card:delete")
  @ApiOperation({ summary: "删除报名卡" })
  remove(@Param("id") id: string) {
    return this.registrationCardService.remove(id);
  }
}
