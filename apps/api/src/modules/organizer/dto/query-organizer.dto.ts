import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class QueryOrganizerDto extends PaginationDto {
  @ApiPropertyOptional({ description: "搜索关键词" })
  @IsOptional()
  @IsString()
  keyword?: string;
}
