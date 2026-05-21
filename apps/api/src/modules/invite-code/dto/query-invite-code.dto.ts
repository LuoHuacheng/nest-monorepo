import { IsDateString, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class QueryInviteCodeDto extends PaginationDto {
  @ApiPropertyOptional({ description: "赛事ID" })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiPropertyOptional({ description: "状态：1-启用 0-禁用" })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  status?: number;

  @ApiPropertyOptional({ description: "创建时间起" })
  @IsOptional()
  @IsDateString()
  dateStart?: string;

  @ApiPropertyOptional({ description: "创建时间止" })
  @IsOptional()
  @IsDateString()
  dateEnd?: string;
}

export class QueryInviteCodeParticipantDto extends PaginationDto {
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
