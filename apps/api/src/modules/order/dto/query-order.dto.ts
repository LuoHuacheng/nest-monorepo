import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class QueryOrderDto extends PaginationDto {
  @ApiPropertyOptional({ description: "订单类型: event/online" })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: "订单状态" })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: "关键词搜索" })
  @IsOptional()
  @IsString()
  keyword?: string;
}
