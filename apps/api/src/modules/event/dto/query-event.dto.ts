import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class QueryParticipantDto extends PaginationDto {
  @ApiPropertyOptional({
    description: "订单状态",
    enum: ["pending", "paid", "refunded", "cancelled"],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: "搜索关键词（订单号/姓名/手机号）" })
  @IsOptional()
  @IsString()
  keyword?: string;
}

export class QueryOrderDto extends PaginationDto {
  @ApiPropertyOptional({ description: "订单号" })
  @IsOptional()
  @IsString()
  orderNo?: string;
}

export class QueryEventDto extends PaginationDto {
  @ApiPropertyOptional({ description: "搜索关键词（赛事名称/地点）" })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: "赛事状态（自动计算）",
    enum: [
      "registration_not_started",
      "registration_open",
      "registration_ended",
      "event_not_started",
      "event_in_progress",
      "event_ended",
    ],
  })
  @IsOptional()
  @IsString()
  eventStatus?: string;

  @ApiPropertyOptional({
    description: "发布状态",
    enum: ["draft", "published", "offline"],
  })
  @IsOptional()
  @IsString()
  publishStatus?: string;

  @ApiPropertyOptional({ description: "赛事分类" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: "赛事属性",
    enum: ["online", "shuttle_bus", "pacer_recruitment"],
  })
  @IsOptional()
  @IsString()
  attribute?: string;

  @ApiPropertyOptional({ description: "是否热门" })
  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  isHot?: boolean;

  @ApiPropertyOptional({ description: "赛事日期起" })
  @IsOptional()
  @IsDateString()
  dateStart?: string;

  @ApiPropertyOptional({ description: "赛事日期止" })
  @IsOptional()
  @IsDateString()
  dateEnd?: string;
}
