import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class QueryLogDto extends PaginationDto {
  @ApiPropertyOptional({ description: "模块名" })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ description: "用户ID" })
  @IsOptional()
  @IsString()
  userId?: string;
}
